import { UserResponseDto } from "../../user/dtos/user-response.dto";
import { BestTimeToCallEnum, PatientStatusEnum } from "../../utils/value-objects/patient-status.enum";

export class PatientResponseDto {
  id: number;
  dob?: Date;
  notes?: string;
  address?: string;
  smsCode?: string;
  createdAt: Date;
  streetAddress?: string;
  apartmentNumber?: string;
  state?: string;
  city?: string;
  zipCode?: string;
  status?: PatientStatusEnum;
  indication?: string;
  bestTimeToCall?: BestTimeToCallEnum;
  source?: string;
  age?: number;
  user?: UserResponseDto;
  isActive: boolean;
}
