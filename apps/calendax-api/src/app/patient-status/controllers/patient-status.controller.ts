import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Post, Put } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { PatientStatusService } from "../services/patient-status.service";
import { CreatePatientStatusDto } from "../dtos/create-patient-status.dto";
import { ApiPaginationQueries } from "../../utils/pagination/decorators/api-paginated-queries.decorators";
import { PatientStatusResponseDto, UpdatePatientStatusDto } from "../dtos";
import type { PaginationRequest } from "../../utils/pagination/interfaces";
import { PaginationParams } from "../../utils/pagination/decorators";

@ApiTags("Patient Status")
@ApiBearerAuth()
@Controller("v1/patient-status")
export class PatientStatusController {
    constructor(
        private readonly patientStatusService: PatientStatusService
    ) {}

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: "Create a new patient status" })
    @ApiResponse({
        status: 201,
        description: "Patient status created successfully",
        type: CreatePatientStatusDto
    })
    @ApiResponse({
        status: 400,
        description: "Bad request - Invalid input data",
    })
    async create(
        @Body() createDto: CreatePatientStatusDto
    ): Promise<any> {
        return await this.patientStatusService.create(createDto);
    }

    @Get()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Get all patient statuses with pagination" })
    @ApiPaginationQueries([])
    @ApiResponse({
        status: 200,
        description: "Patient status retrieved successfully",
        type: [PatientStatusResponseDto],
    })
    async getAll(
        @PaginationParams() pagination: PaginationRequest
    ): Promise<any> {
        return await this.patientStatusService.getAll(pagination);
    }

    @Get("patient/:patientId")
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Get patient status by patient ID" })
    @ApiResponse({
        status: 200,
        description: "Patient status received successfully",
    })
    @ApiResponse({
        status: 404,
        description: "Patient status not found for this patient",
    })
    async findByPatientId(
        @Param("patientId", ParseIntPipe) patientId: number
    ): Promise<any> {
        return await this.patientStatusService.getByPatientId(patientId);
    }

    @Get(":id")
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Get Patient status by ID"})
    @ApiResponse({
        status: 200,
        description: "Patient status retrieved successfully",
        type: PatientStatusResponseDto,
    })
    @ApiResponse({
        status: 404,
        description: "Patient status not found",
    })
    async findOne(@Param('id', ParseIntPipe)id: number): Promise<any> {
        return await this.patientStatusService.getById(id);
    }

    @Put("/:id")
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Update patient status by ID" })
    @ApiResponse({
        status: 200,
        description: "Patient status updated successfully",
    })
    @ApiResponse({
        status: 404,
        description: "Patient status not found",
    })
    @ApiResponse({
        status: 400,
        description: "Bad request - Invalid input data",
    })
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateDto: UpdatePatientStatusDto,
    ): Promise<{ message: string }> {
        await this.patientStatusService.update(id, updateDto);
        return { message: "Patient status updated successfully" };
    }

    @Delete("/:id")
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: "Delete patient status by ID" })
    @ApiResponse({
        status: 204,
        description: "Patient status deleted successfully",
    })
    @ApiResponse({
        status: 404,
        description: "Patient status not found",
    })
    async delete(
        @Param('id', ParseIntPipe) id: number,
    ): Promise<void> {
        await this.patientStatusService.delete(id);
    }
}