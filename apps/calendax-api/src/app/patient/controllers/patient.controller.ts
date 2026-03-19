import { BadRequestException, Body, Controller, Delete, Get, HttpCode, Param, ParseIntPipe, Post, Put, Query, Res, UploadedFile, UseInterceptors } from "@nestjs/common";
import { ApiBody, ApiConsumes, ApiQuery, ApiTags } from "@nestjs/swagger";
import { PatientService } from "../services/patient.service";
import { ApiPaginationQueries } from "../../utils/pagination/decorators/api-paginated-queries.decorators";
import { Permissions } from "../../utils/decorators/permission.decorator";
import { PaginationParams } from "../../utils/pagination/decorators";
import type { PaginationRequest } from "../../utils/pagination/interfaces";
import { CreatePatientRequestDto } from "../dtos/create-patient-request.dto";
import { UpdatePatientRequestDto } from "../dtos/update-patient-request.dto";
import { SiteIds } from "../../utils/decorators/site-ids.decorator";
import { isAdmin } from "../../utils/decorators/is-admin.decorator";
import { ExportPatientService } from "../services/export-patients.service";
import type { Response } from "express";
import { GetPatientResponseDto } from "../dtos/get-patient-request.dto";
import { PaginationResponseDto } from "../../utils/pagination/pagination-response.dto";
import { PatientStatusEnum } from "../../utils/value-objects/patient-status.enum";
import { PatientSiteService } from "../../patient-site/services/patient-site.service";
import { FileInterceptor } from "@nestjs/platform-express";
import { UploadExcelResponseDto } from "../dtos/upload-excel.dto";
import { UploadExcelService } from "../services/upload-excel.service";
import { UpdatePatientDto } from "../dtos/update-patient-response-status.dto";
import { UpdatePatientStatusService } from "../services/update-patient-status.service";

@Controller('v1/patients')
@ApiTags('Patient')
export class PatientController {
    constructor(
        private readonly patientService: PatientService,
        private readonly exportPatientService: ExportPatientService,
        private readonly patientSiteService: PatientSiteService,
        private readonly uploadExcelService: UploadExcelService,
        private readonly updatePatientStatusService: UpdatePatientStatusService,
    ) {}

    @ApiQuery({ name: "status", required: false })
    @ApiQuery({ name: "protocolId", required: false })
    @ApiQuery({ name: "fromDate", required: false })
    @ApiQuery({ name: "tillDate", required: false })
    @Permissions("patient.view")
    @Get("/export")
    async exportPatients(
        @Res({ passthrough: false }) res: Response,
        @SiteIds() siteIds: number[],
        @isAdmin() isAdmin: boolean,
        @Query("status") status?: string,
        @Query("protocolId") protocolId?: string,
        @Query("fromDate") fromDate?: string,
        @Query("tillDate") tillDate?: string,
    ): Promise<void> {
        await this.exportPatientService.execute(
            { status, protocolId, fromDate, tillDate },
            siteIds,
            isAdmin,
            res,
        );   
    }

    @ApiPaginationQueries([
        {
            name: "status",
            type: String,
            enum: PatientStatusEnum,
            description: "status",
            required: false,
        },

        {
            name: "protocolId",
            type: String,
            description: "protocolId",
            required: false,
        },

        {
            name: "fromDate",
            type: Date,
            required: false,
            description: "From Start Date of patient creation",
        },
        {
            name: "tillDate",
            type: Date,
            required: false,
            description: "Till Date of patient creation",
        },
    ])
    @Permissions("patient.view")
    @Get("/")
    async getPatients(
        @SiteIds() siteIds: number[],
        @isAdmin() isAdmin: boolean,
        @PaginationParams() pagination: PaginationRequest,
    ): Promise<PaginationResponseDto<GetPatientResponseDto>> {
        const data = await this.patientService.getPatients(
        pagination,
        siteIds,
        isAdmin,
        );
        return data;
    }

    @Get("/protocols")
    @Permissions("patient.view")
    async getAllProtocolIds(): Promise<{ protocolIds: string[] }> {
        const protocolIds = await this.patientSiteService.getAllProtocols();
        return { protocolIds };
    }
    
    @Permissions("patient.view")
    @Get("/:id")
    public getPatientById(@Param('id', ParseIntPipe) userId: number){
        return this.patientService.getPatientById(userId);
        
    }

    @ApiQuery({
        name: "protocolId",
        type: String,
        description: "Protocol ID to add MongoDB data for",
        required: true,
    })
    @Permissions("patient.update")
    @Get("/patient-site/add-mongodb-data")
    async patientSite(@Query("protocolId") protocolId: string) {
        await this.patientSiteService.addMongodbDataToPatientSite(protocolId);
    }

    // @Permissions("user.view")
    // @Get("/user/:user_id")
    // public getPatientByUserId(@Param('user_id', ParseIntPipe) userId: number) {
    //     return this.patientService.getPatientByUserId(userId);
    // }

    @Permissions("patient.create")
    @HttpCode(200)
    @Post("/")
    public createPatient(
        @Body() payload: CreatePatientRequestDto
    ) {
        return this.patientService.createPatient(payload);
    }

    @Post("/bulk-upload")
    @Permissions("patient.create")
    @HttpCode(202)
    @UseInterceptors(
        FileInterceptor("file", {
            limits: {
                fileSize: 10 * 1024 * 1024,
            },
            fileFilter: (req, file, callback) => {
                if(!file.originalname.match(/\.(xlsx|xls|csv)$/)) {
                    return callback(
                        new BadRequestException(
                            "Only files are allowed (xlsx, xls, csv)",
                        ),
                        false,
                    );
                }
                callback(null, true);
            },
        }),
    )
    @ApiConsumes("multipart/form-data")
    @ApiBody({
        schema: {
            type: "object",
            properties: {
                file: {
                    type: "string",
                    format: "binary",
                },
            },
        },
    })
    async bulkUploadPatients(
        @UploadedFile()
        file: Express.Multer.File,
    ): Promise<UploadExcelResponseDto> {
        if(!file) {
            throw new BadRequestException("No File uploaded");
        }

        try {
            const result = await this.uploadExcelService.processExcelFile(file);
            return {
                message: "Excel file processed succesfully",
                data: result,
            };
        }catch(error) {
            throw new BadRequestException(
                `Failed to process excel file: ${error.message}`
            );
        }
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

    @Put("/status/:id")
    @Permissions("patient.update")
    @HttpCode(200)
    async updataPatientStatus(
        @Param("id", ParseIntPipe) id: number,
        @Body() payload: UpdatePatientDto,
    ) {
        return await this.updatePatientStatusService.execute(
            id,
            payload,
        );
    }

    @Permissions("patient.delete")
    @HttpCode(200)
    @Delete("/:id")
    public async deletePatient(@Param("id", ParseIntPipe) id: number) {
        await this.patientService.delete(id);
        return "Patient Deleted Successfully";
    }

}