import { UserResponseDto } from "../../user/dtos/user-response.dto";


export class SiteResponseDto {
  id: number;
  name: string;
  prefix: string;
  email: string;
  piName: string;
  siteNumber: string;
  phoneNumber: string;
  streetAddress: string;
  principalInvestigatorIds?: number[];
  principalInvestigators?: UserResponseDto[];
  indication:string;
  city?: string | null;
  state?: string | null;
  zipCode?: string | null;
  link?: string | null;
  image?: string | null;
}
