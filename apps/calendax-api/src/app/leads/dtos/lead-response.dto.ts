import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class LeadResponseDto {
    @ApiProperty({ example: 1, description: "Lead record id" })
    id: number;

    @ApiProperty({ example: "Facebook", description: "Lead source platform" })
    platform: string;

    @ApiProperty({ example: "https://example.com/lead-form", description: "Platform link" })
    link: string;

    @ApiPropertyOptional({ example: "123456789", description: "Platform page id" })
    pageId?: string;

    @ApiPropertyOptional({ example: "987654321", description: "Platform form id" })
    formId?: string;

    @ApiPropertyOptional({ example: "Spring Campaign", description: "Platform page name" })
    pageName?: string;

    @ApiPropertyOptional({ example: "2026-03-11T10:00:00.000Z", description: "Creation timestamp" })
    createdAt?: Date;

    @ApiPropertyOptional({ example: "2026-03-11T10:30:00.000Z", description: "Last update timestamp" })
    updatedAt?: Date;
}