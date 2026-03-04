import { ApiProperty } from "@nestjs/swagger";
import {
  IsString,
  IsOptional,
  IsEmail,
  Matches,
  IsArray,
  IsNumber,
} from "class-validator";
import { Email } from "../../utils/value-objects/email.vo";

export class CreateSiteDto {
  @ApiProperty({
    description: "A valid email.",
    example: "myemail@gmail.com",
    required: false,
  })
  @IsEmail()
  @IsOptional()
  email?: Email;

  @ApiProperty({
    description: "Name of the site",
    example: "Example Site",
    required: false,
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: "Prefix of the site",
    example: "LDN",
    required: true,
  })
  @IsString()
  prefix: string;
  @ApiProperty({
    description: "Array of principal investigator user IDs",
    example: [1, 2, 3],
    required: false,
    type: [Number],
  })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  principalInvestigatorIds?: number[];

  @ApiProperty({
    description: " Indication of the site",
    example:"dermatology",
    required: true,
  })

  @IsString()
  indication?: string;

  @ApiProperty({
    description: "Site Number",
    example: "123",
    required: false,
  })
  @IsString()
  @IsOptional()
  siteNumber?: string;

  @ApiProperty({ description: "Phone Number", example: "+1-516-316-4146" })
  @IsOptional()
  phoneNumber?: string;

  @ApiProperty({
    description: "Street Address",
    example: "123 Main St",
    required: false,
  })
  @IsString()
  @IsOptional()
  streetAddress?: string;

  @ApiProperty({
    description: "City",
    example: "Springfield",
    required: false,
  })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiProperty({
    description: "State",
    example: "IL",
    required: false,
  })
  @IsString()
  @IsOptional()
  state?: string;

  @ApiProperty({
    description: "Zip Code",
    example: "62701",
    required: false,
  })
  @IsString()
  @Matches(/^\d{5}(?:-\d{4})?$/, {
    message: "zipCode must be a 5-digit number",
  })
  @IsOptional()
  zipCode?: string;

  @ApiProperty({
    description: "Website link",
    example: "http://www.example.com",
    required: false,
  })
  @IsString()
  @IsOptional()
  link?: string;

  @ApiProperty({
    description: "Image URL or path",
    example: "http://www.example.com/image.jpg",
    required: false,
  })
  @IsString()
  @IsOptional()
  image?: string;
}
