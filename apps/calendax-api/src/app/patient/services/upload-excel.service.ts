import { Injectable,Logger } from "@nestjs/common";
import { In, Repository } from "typeorm";
import { ProtocolsSites } from "../database/protocol-site.entity-orm";
import { InjectRepository } from "@nestjs/typeorm";
import { InjectConnection } from "@nestjs/mongoose";
import { Connection } from "mongoose";
import { PatientRepository } from "../repositories/patient.repository";
import { UserRepository } from "../../user/repositories/user.repository";
import { SiteRepository } from "../../site/repositories/site.repository";
import { PatientSiteRepository } from "../../patient-site/repositories/patient-site.repository";
import * as ExcelJS from "exceljs";
import { HashingService } from "../../utils/commonservices/hashing.service";
import { PlainPassword } from "../../utils/value-objects/password.vo";
import { UserStatus } from "../../utils/value-objects/user-status.vo";

interface PatientRow {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber1: string;
    siteNumber: string;
    protocolId: string;
    bestTimeToCall: string;
}

interface ProcessResult {
    totalRows: number;
    successCount: number;
    failedCount: number;
    duplicateCount: number;
    errors: Array<{ rowNumber: number, error: string }>;
    processingTime: string;
}

@Injectable()
export class UploadExcelService {
    private readonly logger = new Logger(UploadExcelService.name);
    private readonly BATCH_SIZE = 500;

    constructor(
        @InjectRepository(ProtocolsSites)
        private readonly protocolSiteRepository: Repository<ProtocolsSites>,
        @InjectConnection()
        private readonly mongoConnection: Connection,
        private readonly patientRepository: PatientRepository,
        private readonly userRepository: UserRepository,
        private readonly siteRepository: SiteRepository,
        private readonly patientSiteRepository: PatientSiteRepository,
        private readonly hashingService: HashingService,
    ) {}

    async processExcelFile(
        file: Express.Multer.File): Promise<ProcessResult> {
            const startTime = Date.now();

            const result: ProcessResult = {
                totalRows: 0,
                successCount: 0,
                failedCount: 0,
                duplicateCount: 0,
                errors: [],
                processingTime: "0s",
            };
        // Load Excel directly from memory buffer (no temp file needed)
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(file.buffer as any);

        const worksheet = workbook.worksheets[0];
        if (!worksheet) throw new Error("No worksheet found in Excel file");

        // Read ALL rows in one pass
        const allRows: Array<{ data: PatientRow; rowNumber: number }> = [];
        worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
            if (rowNumber === 1) return; // skip header
            const data = this.mapRow(row);
            if (!this.isRowEmpty(data)) allRows.push({ data, rowNumber });
        });

        result.totalRows = allRows.length;
        this.logger.log(`📂 Loaded ${result.totalRows} rows from Excel`);

        // Process in batches of 500
        const totalBatches = Math.ceil(allRows.length / this.BATCH_SIZE);
        for (let i = 0; i < allRows.length; i += this.BATCH_SIZE) {
            const batchNum = Math.ceil((i + 1) / this.BATCH_SIZE);
            const batch = allRows.slice(i, i + this.BATCH_SIZE);

            await this.processBatch(batch, result);

            this.logger.log(
                `Batch ${batchNum}/${totalBatches} | ` +
                `✅ ${result.successCount} | ⏭ ${result.duplicateCount} | ❌ ${result.failedCount}`,
            );
        }

        result.processingTime = `${((Date.now() - startTime) / 1000).toFixed(2)}s`;
        this.logger.log(`✅ DONE in ${result.processingTime}`);
        return result;
    }

    // ─────────────────────────────────────────
    // PROCESS ONE BATCH (bulk queries, not per-row)
    // ─────────────────────────────────────────
    async processBatch(
        batch: Array<{ data: PatientRow; rowNumber: number }>,
        result: ProcessResult,
    ): Promise<void> {
        const uniqueEmails      = [...new Set(batch.map((b) => b.data.email.toLowerCase()))];
        const uniqueSiteNumbers = [...new Set(batch.map((b) => b.data.siteNumber))];
        const uniqueProtocolIds = [...new Set(batch.map((b) => b.data.protocolId))];

        // 3 bulk queries in parallel instead of N per-row queries
        const [siteMap, userMap] = await Promise.all([
        this.fetchSiteMap(uniqueSiteNumbers),
        this.fetchUserMap(uniqueEmails),
        ]);
        const [protocolSiteMap, patientMap] = await Promise.all([
        this.fetchProtocolSiteMap(siteMap, uniqueProtocolIds),
        this.fetchPatientMap(userMap),
        ]);

        // 2 queries to detect all duplicates for the whole batch
        const duplicateKeys = await this.getDuplicateKeys(
        patientMap, siteMap, uniqueEmails, uniqueProtocolIds,
        );

        // Sort rows into buckets
        const toFullInsert: Array<{ data: PatientRow; rowNumber: number }> = [];
        const toMongoOnly:  Array<{ data: PatientRow; rowNumber: number }> = [];

        for (const item of batch) {
        const { data, rowNumber } = item;
        const site = siteMap.get(data.siteNumber);

        if (!site) {
            result.failedCount++;
            result.errors.push({ rowNumber, error: `Site not found: ${data.siteNumber}` });
            continue;
        }

        const key  = this.makeKey(data.email, site.id, data.protocolId);
        const dup  = duplicateKeys.get(key);

        if (dup?.pg && dup?.mongo) {
            // Complete duplicate — skip
            result.duplicateCount++;
            continue;
        }

        if (dup?.pg && !dup?.mongo) {
            // PG exists, MongoDB missing — insert only Mongo
            toMongoOnly.push(item);
            result.duplicateCount++;
            continue;
        }

        if (!protocolSiteMap.has(`${site.id}-${data.protocolId}`)) {
            result.failedCount++;
            result.errors.push({
            rowNumber,
            error: `Protocol-Site mapping not found: site=${data.siteNumber} protocol=${data.protocolId}`,
            });
            continue;
        }

        toFullInsert.push(item);
        }

        // Run both insert types in parallel
        await Promise.all([
        toFullInsert.length > 0 && this.doFullInsert(toFullInsert, siteMap, userMap, patientMap, result),
        toMongoOnly.length  > 0 && this.doMongoOnlyInsert(toMongoOnly, siteMap, userMap, patientMap),
        ]);
    }

    // ─────────────────────────────────────────
    // FULL INSERT — PostgreSQL + MongoDB
    // ─────────────────────────────────────────
    private async doFullInsert(
        rows: Array<{ data: PatientRow; rowNumber: number }>,
        siteMap: Map<string, any>,
        userMap: Map<string, any>,
        patientMap: Map<number, any>,
        result: ProcessResult,
    ): Promise<void> {
        // Hash default password ONCE per batch (not per row)
        const defaultPassword = await this.hashingService.hashPlainPassword(
        "password" as PlainPassword,
        );

        const mongoRecords: any[] = [];

        for (const { data, rowNumber } of rows) {
        try {
            const site = siteMap.get(data.siteNumber)!;
            let user   = userMap.get(data.email.toLowerCase());
            let patient = user ? patientMap.get(user.id) : null;

            if (!user) {
            user = await this.userRepository.create({
                firstName: data.firstName,
                lastName: data.lastName,
                email: data.email,
                phoneNumber1: data.phoneNumber1,
                password: defaultPassword,
                isPatient: true,
                status: UserStatus.Active,
            });
            userMap.set(data.email.toLowerCase(), user); // cache for same-batch duplicates
            }

            if (!patient) {
            patient = await this.patientRepository.create({
                user,
                source: "excel-upload",
            });
            patientMap.set(user.id, patient);
            }

            await this.patientSiteRepository.create({
            patient,
            site,
            protocolId: data.protocolId,
            });

            mongoRecords.push(this.buildMongoDoc(data, user, patient, site));
            result.successCount++;
        } catch (err) {
            result.failedCount++;
            result.errors.push({ rowNumber, error: err.message });
            this.logger.error(`Row ${rowNumber} failed: ${err.message}`);
        }
        }

        // One bulk MongoDB insert for the whole batch
        if (mongoRecords.length > 0) {
        await this.mongoConnection.db
            .collection("patient-questions")
            .insertMany(mongoRecords, { ordered: false });
        }
    }

    // ─────────────────────────────────────────
    // MONGO-ONLY INSERT
    // ─────────────────────────────────────────
    private async doMongoOnlyInsert(
        rows: Array<{ data: PatientRow; rowNumber: number }>,
        siteMap: Map<string, any>,
        userMap: Map<string, any>,
        patientMap: Map<number, any>,
    ): Promise<void> {
        const records: any[] = [];

        for (const { data } of rows) {
        const site    = siteMap.get(data.siteNumber);
        const user    = userMap.get(data.email.toLowerCase());
        const patient = user ? patientMap.get(user.id) : null;
        if (site && user && patient) {
            records.push(this.buildMongoDoc(data, user, patient, site));
        }
        }

        if (records.length > 0) {
        await this.mongoConnection.db
            .collection("patient-questions")
            .insertMany(records, { ordered: false });
        }
    }

    // ─────────────────────────────────────────
    // BULK FETCH HELPERS — 1 query each, returns Map
    // ─────────────────────────────────────────
    private async fetchSiteMap(siteNumbers: string[]): Promise<Map<string, any>> {
        const map = new Map<string, any>();
        if (!siteNumbers.length) return map;
        const sites = await this.siteRepository.getSitesBySiteNumbers(siteNumbers);
        (sites ?? []).forEach((s) => s?.siteNumber && map.set(s.siteNumber, s));
        return map;
    }

    private async fetchProtocolSiteMap(
        siteMap: Map<string, any>,
        protocolIds: string[],
    ): Promise<Map<string, any>> {
        const map = new Map<string, any>();
        if (!siteMap.size || !protocolIds.length) return map;
        const siteIds = [...siteMap.values()].map((s) => String(s.id));
        const rows = await this.protocolSiteRepository.find({
        where: { site_id: In(siteIds), protocol_id: In(protocolIds) },
        });
        (rows ?? []).forEach((ps) => {
        if (ps?.site_id && ps?.protocol_id)
            map.set(`${ps.site_id}-${ps.protocol_id}`, ps);
        });
        return map;
    }

    private async fetchUserMap(emails: string[]): Promise<Map<string, any>> {
        const map = new Map<string, any>();
        if (!emails.length) return map;
        const users = await this.userRepository.getByEmails(emails);
        (users ?? []).forEach((u) => u?.email && map.set(u.email.toLowerCase(), u));
        return map;
    }

    private async fetchPatientMap(userMap: Map<string, any>): Promise<Map<number, any>> {
        const map = new Map<number, any>();
        const ids = [...userMap.values()].map((u) => u.id).filter(Boolean);
        if (!ids.length) return map;
        const patients = await this.patientRepository.getByUserIds(ids);
        (patients ?? []).forEach((p) => p?.user?.id && map.set(p.user.id, p));
        return map;
    }

    // ─────────────────────────────────────────
    // DUPLICATE DETECTION — 2 queries for whole batch
    // ─────────────────────────────────────────
    private async getDuplicateKeys(
        patientMap: Map<number, any>,
        siteMap: Map<string, any>,
        uniqueEmails: string[],
        uniqueProtocolIds: string[],
    ): Promise<Map<string, { pg: boolean; mongo: boolean }>> {
        const map = new Map<string, { pg: boolean; mongo: boolean }>();

        const patientIds = [...patientMap.values()].map((p) => p.id).filter(Boolean);
        const siteIds    = [...siteMap.values()].map((s) => s.id).filter(Boolean);

        // Query 1: PostgreSQL
        if (patientIds.length && siteIds.length && uniqueProtocolIds.length) {
        const existing = await this.patientSiteRepository.findByPatientSiteAndProtocolIds(
            patientIds, siteIds, uniqueProtocolIds,
        );
        existing.forEach((ps) => {
            const key = this.makeKey(ps.patient.user.email, ps.site.id, ps.protocolId);
            map.set(key, { pg: true, mongo: false });
        });
        }

        // Query 2: MongoDB
        const mongoRecs = await this.mongoConnection.db
        .collection("patient-questions")
        .find({ email: { $in: uniqueEmails } })
        .toArray();

        mongoRecs.forEach((rec) => {
        const key = this.makeKey(rec.email, rec.siteId, rec.protocol_id);
        const ex  = map.get(key);
        if (ex) ex.mongo = true;
        else map.set(key, { pg: false, mongo: true });
        });

        return map;
    }

    // ─────────────────────────────────────────
    // SMALL HELPERS
    // ─────────────────────────────────────────
    private makeKey(email: string, siteId: number | string, protocolId: string): string {
        return `${email.toLowerCase()}-${siteId}-${protocolId}`;
    }

    private buildMongoDoc(data: PatientRow, user: any, patient: any, site: any) {
        return {
        firstName:      data.firstName,
        lastName:       data.lastName,
        email:          data.email,
        phoneNo1:       data.phoneNumber1,
        userId:         Number(user.id),
        patientId:      String(patient.id),
        siteId:         Number(site.id),
        protocol_id:    String(data.protocolId),
        questions:      null,
        bestTimeToCall: data.bestTimeToCall,
        status:         false,
        isExcelImport:   true,
        };
    }

    isRowEmpty(d: PatientRow): boolean {
        return (
        !d.firstName?.trim() &&
        !d.lastName?.trim() &&
        !d.email?.trim() &&
        !d.phoneNumber1?.trim() &&
        !d.siteNumber?.trim() &&
        !d.protocolId?.trim()
        );
    }

    mapRow(row: ExcelJS.Row): PatientRow {
        const get = (cell: ExcelJS.Cell): string => {
        const v = cell.value;
        if (v === null || v === undefined)                   return "";
        if (typeof v === "string")                           return v;
        if (typeof v === "number" || typeof v === "boolean") return String(v);
        if (v instanceof Date)                               return v.toISOString();
        if (typeof v === "object") {
            if ("richText" in v && Array.isArray(v.richText))
            return v.richText.map((t: any) => t.text ?? "").join("");
            if ("result" in v) return String(v.result ?? "");
            if ("text"   in v) return String(v.text   ?? "");
            if ("error"  in v) return "";
        }
        return String(v);
        };

        return {
        firstName:      get(row.getCell(1)).trim(),
        lastName:       get(row.getCell(2)).trim(),
        email:          get(row.getCell(3)).toLowerCase().trim(),
        phoneNumber1:   get(row.getCell(4)).trim(),
        siteNumber:     get(row.getCell(5)).trim(),
        protocolId:     get(row.getCell(6)).trim(),
        bestTimeToCall: get(row.getCell(7)).trim(),
        };
    }
}