import { UserStatus } from "../../utils/value-objects/user-status.vo";

export class UserResponseDto {
  id: number;
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  emailVerifiedAt?: Date;
  phoneNumber1?: string;
  phoneNumber2?: string;
  failedAttempts: number;
  isPasswordReset: boolean;
  isNotificationEnabled: boolean;
  lastFailedAttempt?: Date;
  lockedUntil?: Date;
  status: UserStatus;
  isPatient: boolean | undefined;
  isAdmin: boolean;
  isPrincipalInvestigator: boolean;
  isSuperUser: boolean;
}
