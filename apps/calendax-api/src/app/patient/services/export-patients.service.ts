import { Injectable } from "@nestjs/common";
import { PatientService } from "./patient.service";
import { PinoLoggerService } from "../../utils/logger/pinoLogger.service";
import { PatientSiteRepository } from "../../patient-site/repositories/patient-site.repository";
import { InjectConnection } from "@nestjs/mongoose";
import { Connection } from "mongoose";
import { Response } from "express";
import * as ExcelJS from 'exceljs';

interface PatientExportRawRow {
    entity_id?: number | string;
    entity_created_at?: string | Date;
    user_firstName?: string;
    firstName?: string;
    user_lastName?: string;
    lastName?: string;
    user_email?: string;
    email?: string;
    user_phoneNumber1?: string;
    phoneNumber?: string;
    entity_status?: string;
    status?: string;
}

interface FollowUpData {
    callDuration: string;
    summary: string;
}

@Injectable()
export class ExportPatientService {
    constructor(
        private readonly patientService: PatientService,
        private readonly logger: PinoLoggerService,
        private readonly patientSiteRepository: PatientSiteRepository,
        @InjectConnection()
        private readonly mongoConnection: Connection
    ) {
        this.logger.setContext(ExportPatientService.name);
    }

    async execute(
        params: {
            status?: string;
            protocolId?: string;
            fromDate?: string;
            tillDate?: string;
        },
        siteIds: number[],
        isAdmin: boolean,
        res: Response
    ): Promise<void> {
        // 1. Set response headers before the streaming starts
        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        );
        res.setHeader(
            "Content-Disposition",
            `attachment; filename=patients_export_${Date.now()}.xlsx`,
        );

        // 2. Setup workbook with streaming writer
        const workbook = new ExcelJS.stream.xlsx.WorkbookWriter({
            stream: res,
            useStyles: true,
            useSharedStrings: true,
        });

        const sheet = workbook.addWorksheet("Patients");

        // 3. Define Columns
        sheet.columns = [
            { header: "No.", key: "no", width: 6 },
            { header: "First Name", key: "firstName", width: 15 },
            { header: "Last Name", key: "lastName", width: 15 },
            { header: "Email", key: "email", width: 30},
            { header: "Phone Number", key: "phoneNumber", width: 18 },
            { header: "Created Date", key: "createdDate", width: 16},
            { header: "Created Time", key: "createdTime", width: 14 },
            { header: "Call Duration (seconds)", key: "callDuration", width: 18 },
            { header: "Summary", key: "summary", width: 42 },
            { header: "Status", key: "status", width: 16 },
        ];

        // 4. Style Header Row
        sheet.getRow(1).eachCell((cell) => {
            cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
            cell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "FFFF6B35" },
            };
            cell.alignment = { vertical: "middle", horizontal: "center" };
        });
        sheet.getRow(1).commit();

        // 5. Get filtered patients stream
        const stream = await this.patientService.streamPatientsForExport(
            params,
            siteIds,
            isAdmin,
        );

        // 6. Buffer filtered rows so we can enrich via patient_sites + MongoDB
        const rows = await this.collectStreamRows(stream);
        const followUpMap = await this.getFollowUpDataMap(rows);

        // 7. Write rows to the workbook
        let rowIndex = 1;
        for(const rawRow of rows) {
            const patientId = this.getPatientId(rawRow);
            const followUp = patientId ? followUpMap.get(patientId) : undefined;
            const createdAt = this.getCreatedAt(rawRow);

            const row = sheet.addRow({
                no: rowIndex++,
                firstName: rawRow.user_firstName ?? rawRow.firstName ?? "-",
                lastName: rawRow.user_lastName ?? rawRow.lastName ?? "-",
                email: rawRow.user_email ?? rawRow.email ?? "-",
                phoneNumber: rawRow.user_phoneNumber1 ?? rawRow.phoneNumber ?? "-",
                createdDate: createdAt?.toLocaleDateString() ?? "-",
                createdTime: createdAt?. toLocaleTimeString() ?? "-",
                callDuration: followUp?.callDuration ?? "-",
                summary: followUp?.summary ?? rawRow.status ?? "-",
            });

            row.commit();
        }

        await sheet.commit();
        await workbook.commit();
    }

    async collectStreamRows(
        stream: NodeJS.ReadableStream,
    ): Promise<PatientExportRawRow[]> {
        return new Promise((resolve, reject) => {
            const rows: PatientExportRawRow[] = [];

            stream.on("end", () => resolve(rows));
            stream.on("error", (err) => {
                this.logger.error("Stream error during export", err);
                reject(err);
            });
        });
    }

    private getPatientId(
        rawRow: PatientExportRawRow
    ): number | null {
        const id = Number(rawRow.entity_id);
        return Number.isFinite(id) ? id : null;
    }

    private getCreatedAt(rawRow: PatientExportRawRow): Date | null {
        if(!rawRow?.entity_created_at) {
            return null;
        }
        const date = new Date(rawRow.entity_created_at);
        return Number.isNaN(date.getTime()) ? null : date;
    }

    private async getFollowUpDataMap(
        rows: PatientExportRawRow[],
    ): Promise<Map<number, FollowUpData>> {
        const patientIds = [
            ...new Set(
                rows
                    .map((row) => this.getPatientId(row))
                    .filter((id): id is number => id !== null),
            ),
        ];

        if(!patientIds.length) {
            return new Map<number, FollowUpData>();
        }

        const patientSites = 
            await this.patientSiteRepository.findByPatientIds(patientIds);
        const protocolByPatientId = new Map<number, string>();

        for(const patientSite of patientSites) {
            const patientId = Number(patientSite?.patient?.id);
            if(!Number.isFinite(patientId)) {
                continue;
            }

            if(!protocolByPatientId.has(patientId) && patientSite?.protocolId) {
                protocolByPatientId.set(patientId, patientSite.protocolId);
            }
        }

        if(!this.mongoConnection?.db) {
            this.logger.warn(
                "MongoDB connection not initialized. Exporting without follow-up fields.",
            );
            return new Map<number, FollowUpData>();
        }

        const followUpCollection = 
            this.mongoConnection.db.collection("patient_followup_status");
        const filter: Record<string, any> = {
            $or: [
                { patientId: { $in: patientIds } },
                { patientId: { $in: patientIds.map(String) } },
                { patientId: { $in: patientIds } },
                { patientId: { $in: patientIds.map(String) } },
            ],
        };

        const followUpDocs = await followUpCollection.find(filter).toArray();

        const followUpByPatientId = new Map<number, FollowUpData>();
        const sortByTimeDesc = (a: any, b: any) => 
            this.getDocTimeStamp(b) - this.getDocTimeStamp(a);
        followUpDocs.sort(sortByTimeDesc);

        for (const doc of followUpDocs) {
            const patientId = Number(doc?.patientId ?? doc?.patient_id);
            if (!Number.isFinite(patientId) || followUpByPatientId.has(patientId)) {
                continue;
            }

            const expectedProtocolId = protocolByPatientId.get(patientId);
            const docProtocolId = doc?.protocol_id ?? doc?.protocolId;
            if(
                expectedProtocolId &&
                docProtocolId &&
                String(expectedProtocolId) !== String(docProtocolId)
            ) {
                continue;
            }

            const callDuration = this.getFirstStringValue(doc, [
                "callDuration",
                "call_duration",
                "call_duration_secs",
                "duration",
                "call_time",
                "total_duration",
            ]);

            const summary = this.getFirstStringValue(doc, [
                "summary",
                "callSummary",
                "call_summary",
                "note",
                "notes",
                "remarks",
                "comment",
                "comments",
            ]);

            followUpByPatientId.set(patientId, {
                callDuration: callDuration || "-",
                summary: summary || "-",
            });
        }

        return followUpByPatientId;
    }

    private getDocTimeStamp(doc: Record<string, any>): number {
        const dateCandidates = [doc?.updatedAt, doc?.createdAt, doc?.date];
        for (const candidate of dateCandidates) {
            const timestamp = new Date(candidate).getTime();
            if(Number.isFinite(timestamp)) {
                return timestamp;
            }
        }
        return 0;
    }

    private getFirstStringValue(
        source: Record<string, any>,
        keys: string[],
    ): string {
        for (const key of keys) {
            const value = source?.[key];
            if(value !== undefined && value !== null && String(value).trim()) {
                return String(value);
            }
        }
        return "";
    }

}