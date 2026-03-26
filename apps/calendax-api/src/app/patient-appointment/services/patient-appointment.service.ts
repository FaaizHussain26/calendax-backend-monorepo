import { BadRequestException, Injectable } from "@nestjs/common";
import { PatientAppointmentRepository } from "../repositories/patient-appointment.repository";
import { PaginationRequest } from "../../utils/pagination/interfaces";
import { PaginationResponseDto } from "../../utils/pagination/pagination-response.dto";
import { PatientAppointmentResponseDto } from "../dtos/patient-appointment-response.dto";
import { Pagination } from "../../utils/pagination/pagination.helper";
import { CreatePatientAppointmentDto } from "../dtos/create-patient-appointment.dto";
import { SiteService } from "../../site/services/site.service";
import { UserService } from "../../user/services/user.service";
import { PatientService } from "../../patient/services/patient.service";
import { PinoLoggerService } from "../../utils/logger/pinoLogger.service";
import { PatientStatusEnum } from "../../utils/value-objects/patient-status.enum";
import { PlainPassword } from "../../utils/value-objects/password.vo";
import { HashingService } from "../../utils/commonservices/hashing.service";
import { UserStatus } from "../../utils/value-objects/user-status.vo";
import { EmailService } from "../../utils/mailers/email.service";
import { UpdatePatientAppointmentDto } from "../dtos/update-patient-appointment.dto";
import { assertFound } from "../../utils/exceptions/not-found.exception";
import { DeleteResult } from "typeorm";

@Injectable()
export class PatientAppointmentService {
    constructor(
        private readonly repository: PatientAppointmentRepository,
        private readonly siteService: SiteService,
        private readonly userService: UserService,
        private readonly patientService: PatientService,
        private readonly logger: PinoLoggerService,
        private readonly hashingService: HashingService,
        private readonly emailService: EmailService,
    ) {}

    async getAll(
        pagination: PaginationRequest
    ): Promise<PaginationResponseDto<PatientAppointmentResponseDto>> {
        const [appointments, total] = 
        await this.repository.getPaginatedDataWithCount(
            pagination,
        );
        const appointmentDtos = appointments.map((appointment) => 
            this.mapToResponseDto(appointment)
        );
        return Pagination.of(pagination, total, appointmentDtos);
    }

    async create(
        payload: CreatePatientAppointmentDto
    ): Promise<PatientAppointmentResponseDto> {
        if(!payload.siteId) {
            throw new BadRequestException("Site ID is required");
        }

        const site = await this.siteService.getSiteById(payload.siteId);
        if(!site) {
            throw new BadRequestException(`Site with ID ${payload.siteId} not found!`);
        }

        let existingUser;
        try {
            existingUser = await this.userService.getUserByEmail(
                payload.patient.user.email
            );
        }catch (error) {
            existingUser = null;
        }

        existingUser
        ? await this.handleExistingUser(payload, existingUser)
        : await this.handleNewUser(payload);

        const appointment = await this.buildAppointment(payload, site);
        const appointmentCreated = 
        await this.repository.createAndSave(appointment);

        if(!payload.status) {
            await this.emailService.sendDynamicEmail({
                toEmail: appointmentCreated.patient.user.email,
                subject: "Appointment Created",
                data: {
                    recipient_name:
                        appointmentCreated.patient.user.firstName +
                        " " + 
                        appointmentCreated.patient.user.lastName,
                    profile_url: String(appointmentCreated.patient.id),
                },
            });
        }
        if(appointmentCreated.patient?.user?.id) {
            appointmentCreated.user = {
                id: appointmentCreated.patient.user.id,
            } as any;
            await this.repository.update(appointmentCreated.id, {
                user: appointmentCreated.user,
            });
        }
        this.logger.info(
            `Successfully created appointment for patient ${payload.patient.user.email}`
        );
        return this.mapToResponseDto(appointmentCreated);
    }

    async update(
        id: number,
        payload: UpdatePatientAppointmentDto
    ): Promise<PatientAppointmentResponseDto> {
        const appointment = await this.repository.findById(id);
        assertFound(appointment, "Appointment", id);

        if(payload.siteId && payload.siteId !== appointment.site?.id) {
            const site = await this.siteService.getSiteById(payload.siteId);
            assertFound(site, "Site");
            appointment.site = site;
        }
        if(payload.date) {
            appointment.date = new Date(payload.date);
        }
        if(payload.time) {
            appointment.time = payload.time;
        }
        if(payload.status) {
            appointment.status = payload.status;
        }
        if(payload.protocol_id) {
            appointment.protocol_id = payload.protocol_id;
        }
        if(payload.indication) {
            appointment.indication = payload.indication;
        }
        if(payload.patient) {
            await this.updateExistingPatient(
                payload as any,
                appointment.patient,
                appointment.user,
            );
        }
        const updatedAppointment = await this.repository.update(
            id,
            appointment
        );
        await this.emailService.sendDynamicEmail({
            toEmail: updatedAppointment.patient.user.email,
            subject: "Your Appointment has been updated",
            data: {
                recipient_name:
                updatedAppointment.patient.user.firstName +
                " " +
                updatedAppointment.patient.user.lastName,
            profile_url: String(updatedAppointment.patient.id),
            },
        });
        this.logger.info(`Successfully updated appointment ${id}`);
        return this.mapToResponseDto(updatedAppointment);
    }

    async delete(id: number): Promise<DeleteResult> {
        this.logger.info(`Successfully  deleted appointment ${id}`);
        return await this.repository.delete(id);
    }

    //Helpers
    private async handleExistingUser(
        payload: CreatePatientAppointmentDto,
        existingUser: any
    ): Promise<void> {
        let existingPatient = null;
        try {
            existingPatient = await this.patientService.getPatientByUserId(
                existingUser.id
            );
        }catch(error) {
            this.logger.info(
                `No patient found for user ${existingUser.id}, will create new patient`
            );
        }
        if(!existingPatient) {
            payload.userId = existingUser.id;
            payload.patient.user = existingUser;
            payload.patient.id = undefined;
            this.logger.info(
                `User exists, creating new patient for user ${existingUser.id}`
            );
            return;
        }
        await this.updateExistingPatient(payload, existingPatient, existingUser);
    }

    private async updateExistingPatient(
        payload: CreatePatientAppointmentDto,
        existingPatient: any,
        existingUser: any
    ): Promise<void> {
        const allowedFields = [
            "firstName",
            "lastName",
            "phone",
            "dob",
            "notes",
            "address",
            "streetAddress",
            "apartmentNumber",
            "state",
            "city",
            "zipCode",
            "age",
            "gender",
            "source",
            "indication",
            "isActive",
        ];

        const updateData = Object.fromEntries(
            allowedFields
            .filter(
                (key) => 
                    payload.patient[key] !== undefined &&
                    payload.patient[key] !== existingPatient[key]
            )
            .map((key) => [key, payload.patient[key]])
        );
        updateData.status = PatientStatusEnum.pre_screening_visit;

        if(Object.keys(updateData).length === 0) {
            this.assignPayloadIds(payload, existingUser, existingPatient);
            return;
        }

        const updatedUser = await this.userService.updateUser(existingUser.id, {
            firstName: payload.patient.user.firstName,
            lastName: payload.patient.user.lastName,
            phoneNumber1: payload.patient.user.phoneNumber1,
        } as any);

        this.assignPayloadIds(
            payload,
            updatedUser || existingUser,
            existingPatient
        );
        this.logger.info(
            `Updated patient ${existingPatient.id} (${Object.keys(updateData).join(", ")})`
        )
    }

    private async handleNewUser(
        payload: CreatePatientAppointmentDto
    ): Promise<void> {
        payload.patient.user.password = "password" as PlainPassword;
        const hashedPassword = await this.hashingService.hashPlainPassword(
            payload.patient.user.password
        );

        payload.patient.user.password = hashedPassword as PlainPassword;
        (payload.patient.user as any).status = UserStatus.Active;

        this.logger.info(
            `Create new user and patient for ${payload.patient.user.email}`
        );
    }

    private async buildAppointment(
        payload: CreatePatientAppointmentDto,
        site: any
    ): Promise<any> {
        const appointmentPatient = payload.patient.id
        ? this.buildExistingPatient(payload)
        : {
            ...payload.patient,
            status: PatientStatusEnum.pre_screening_visit,
            user: payload.patient.user,
        };

        return {
            patient: appointmentPatient,
            site,
            user: payload.userId ? payload.userId : payload.patient.user,
            date: payload.date ? new Date(payload.date) : null,
            time: payload.time,
            status: payload.status,
            protocol_id: payload.protocol_id,
            indication: payload.indication,
        };
    }

    private buildExistingPatient(
        payload: CreatePatientAppointmentDto
    ): any {
        return payload.patient;
    }

    private assignPayloadIds(
        payload: CreatePatientAppointmentDto,
        user: any,
        patient: any,
    ): void {
        payload.userId = user.id,
        payload.patient.id = patient.id,
        payload.patient.user = user;
    }

    private mapToResponseDto(
        patientAppointmentEntity: any
    ): PatientAppointmentResponseDto {
        return {
            id: patientAppointmentEntity.id,
            patient: this.filterPatientFields(patientAppointmentEntity.patient),
            date: patientAppointmentEntity.date,
            time: patientAppointmentEntity.time,
            status: patientAppointmentEntity.status,
            protocol_id: patientAppointmentEntity.protocol_id,
            indication: patientAppointmentEntity.indication,
            siteId: patientAppointmentEntity.siteId,
            userId: patientAppointmentEntity.userId,
            createdAt: patientAppointmentEntity.createdAt,
            updatedAt: patientAppointmentEntity.updatedAt,
        };
    }

    private filterPatientFields(
        patient: any
    ): any {
        return {
            id: patient.id,
            firstName: patient.user?.firstName,
            lastName: patient.user?.lastName,
            email: patient.user?.email,
            phoneNumber1: patient.user?.phoneNumber1,
            dob: patient.dob,
            age: patient.age,
            gender: patient.gender,
            address: patient.address,
            city: patient.city,
            state: patient.state,
            zipCode: patient.zipCode,
            indication: patient.indication,
            source: patient.source,
            notes: patient.notes,
        };
    }
}