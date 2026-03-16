import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { PatientAppointment } from "../database/patient-appointment.orm-entity";
import { Repository } from "typeorm";
import { PaginationService } from "../../utils/pagination/services/pagination.service";
import { PaginationRequest } from "../../utils/pagination/interfaces";
import { DeleteResult } from "typeorm/browser";

@Injectable()
export class PatientAppointmentRepository {
    constructor(
        @InjectRepository(PatientAppointment)
        private readonly patientAppointmentRepository: Repository<PatientAppointment>,
        private readonly paginationService: PaginationService,
    ) {}

    async getPaginatedDataWithCount(
        pagination: PaginationRequest
    ): Promise<
        [appointmentEntities: PatientAppointment[], totalAppointments: number]
        > {
            const params = pagination.params;
            const hasConditions = Boolean(params.siteIds || params.status);
            if(params.fromDate && params.toDate && params.fromDate > params.toDate) {
                throw new Error("Invalid date range: fromDate cannot be after toDate");
            }
            const whereCondition = hasConditions
            ? (qb) => {
                const conditions = [];
                const parameters = {};

                if(params.status) {
                    conditions.push("entity.status = :status");
                    parameters["status"] = params.status;
                }

                if(conditions.length) {
                    qb.where(conditions.join(" AND "), parameters);
                }
            }
            :null;
            return await this.paginationService.getPaginatedDataWithCount(
                this.patientAppointmentRepository,
                ["patient", "patient.user", "site", "user"],
                pagination,
                whereCondition
            );
        }

        async createAndSave(
            payload: Partial<PatientAppointment>
        ): Promise<PatientAppointment> {
            const data = this.patientAppointmentRepository.create(payload);
            return await this.patientAppointmentRepository.save(data);
        }

        async findById(
            id: PatientAppointment['id']
        ): Promise<PatientAppointment> {
            return await this.patientAppointmentRepository.findOne({
                where: { id },
                relations: ["patient", "patient.user", "site", "user"],
            });
        }

        async update(
            id: number,
            payload: Partial<PatientAppointment>
        ): Promise<PatientAppointment> {
            await this.patientAppointmentRepository.update(id, payload);
            return await this,this.findById(id);
        }

        async delete(
            id: number
        ): Promise<DeleteResult> {
            return await this.patientAppointmentRepository.delete(id);
        }
    }