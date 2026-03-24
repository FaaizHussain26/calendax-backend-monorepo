import { SiteResponseDto } from "../../site/dtos/site-response.dto";
import { PatientStatusEnum } from "../../utils/value-objects/patient-status.enum";
import { UserStatus } from "../../utils/value-objects/user-status.vo";

export class GetUserPatientResponseDto {
    id: number;
    firstName: string;
    middleName?: string;
    lastName: string;
    email: string;
    status: UserStatus;
    phoneNumber1?: string;
    phoneNumber2?: string;
    sites?: SiteResponseDto[];
}

export class GetPatientResponseDto {
    id: number;
    address?: string;
    createdAt?: Date;
    status?: PatientStatusEnum;
    user?: GetUserPatientResponseDto;
    isActive: boolean;
    sitesAssignments?: {
        id: number;
        siteId: number;
        protocolId: string;
        isActive: boolean;
    }[];
}