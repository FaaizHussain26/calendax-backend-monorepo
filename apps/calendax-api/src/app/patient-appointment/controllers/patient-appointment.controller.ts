import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, UsePipes, ValidationPipe } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { ApiPaginationQueries } from "../../utils/pagination/decorators/api-paginated-queries.decorators";
import { AppointmentStatus } from "../../utils/value-objects/appointment-status.vo";
import { PaginationParams } from "../../utils/pagination/decorators";
import type { PaginationRequest } from "../../utils/pagination/interfaces";
import { PatientAppointmentService } from "../services/patient-appointment.service";
import { CreatePatientAppointmentDto } from "../dtos/create-patient-appointment.dto";
import { UpdatePatientAppointmentDto } from "../dtos/update-patient-appointment.dto";
import { skipAuth } from "../../utils/decorators/skip-auth.decorator";

@Controller("v1/patient-appointments")
@ApiTags("Patient Appointments")
export class PatientAppointmentController {
    constructor(
        private readonly patientAppointmentService: PatientAppointmentService
    ) {}

    @ApiOperation({ description: "Get a paginated appointment list" })
    @Get("/")
    @UsePipes(new ValidationPipe({ transform: true }))
    @ApiPaginationQueries([
        {
            name: "status",
            type: String,
            enum: AppointmentStatus,
            required: false,
            description: "Status of Appointment"
        }
    ])
    @skipAuth()
    public getAppointments(
        @PaginationParams() pagination: PaginationRequest
    ) {
        return this.patientAppointmentService.getAll(pagination);
    }

    @Post("/")
    @skipAuth()
    public create(
        @Body(ValidationPipe) payload: CreatePatientAppointmentDto
    ) {
        return this.patientAppointmentService.create(payload);
    }

    @Put("/:id")
    @skipAuth()
    public update(
        @Param('id', ParseIntPipe) id: number,
        @Body(ValidationPipe) payload: UpdatePatientAppointmentDto
    ) {
        return this.patientAppointmentService.update(id, payload);
    }

    @Delete("/:id")
    @skipAuth()
    public delete(
        @Param('id', ParseIntPipe) id: number
    ) {
        this.patientAppointmentService.delete(id);
        return { message: "Appointment deleted successfully"} ;
    }
}