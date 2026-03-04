import { Body, Controller, Delete, Get, HttpCode, Param, ParseIntPipe, Post, Put } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { PatientService } from "../services/patient.service";
import { ApiPaginationQueries } from "../../utils/pagination/decorators/api-paginated-queries.decorators";
import { Permissions } from "../../utils/decorators/permission.decorator";
import { PaginationParams } from "../../utils/pagination/decorators";
import type { PaginationRequest } from "../../utils/pagination/interfaces";
import { CreatePatientRequestDto } from "../dtos/create-patient-request.dto";
import { UpdatePatientRequestDto } from "../dtos/update-patient-request.dto";

@Controller('v1/patients')
@ApiTags('Patient')
export class PatientController {
    constructor(
        private readonly patientService: PatientService,
    ) {}

    @ApiPaginationQueries([
        {
            name: "indication",
            type: String,
            description: "indication",
            required: false,
        },
    ])
    @Permissions("patient.view")
    @Get("/")
    public getPatients(
        @PaginationParams() pagination: PaginationRequest
    ){
        return this.patientService.getPatients(pagination);
    }

    @Permissions("patient.view")
    @Get("/:id")
    public getPatientById(@Param('id', ParseIntPipe) userId: number){
        return this.patientService.getPatientById(userId);
        
    }

    @Permissions("user.view")
    @Get("/user/:user_id")
    public getPatientByUserId(@Param('user_id', ParseIntPipe) userId: number) {
        return this.patientService.getPatientByUserId(userId);
    }

    @Permissions("patient.create")
    @HttpCode(200)
    @Post("/")
    public createPatient(
        @Body() payload: CreatePatientRequestDto
    ) {
        return this.patientService.createPatient(payload);
    }

    @Permissions("patient.update")
    @HttpCode(200)
    @Put("/:id")
    public updatePatient(
        @Param("id", ParseIntPipe) id: number,
        @Body() payload: UpdatePatientRequestDto
    ) {
        return this.patientService.updatePatient(id, payload);
        
    }

    @Permissions("patient.delete")
    @HttpCode(200)
    @Delete("/:id")
    public async deletePatient(@Param("id", ParseIntPipe) id: number) {
        await this.patientService.delete(id);
        return "Patient Deleted Successfully";
    }

}