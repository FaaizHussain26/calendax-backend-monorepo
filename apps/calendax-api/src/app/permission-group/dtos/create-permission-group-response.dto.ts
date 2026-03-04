import { ArrayMinSize, IsArray, IsNotEmpty, IsOptional, Length, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class CreatePermissionGroupRequestDto {
  @ApiProperty({ description: 'Name of the permission group', example: 'User Management' })
  @IsNotEmpty()
  @MaxLength(60)
  title: string;

  @ApiProperty({ description: 'Description of the permission group', example: 'User Management permission group' })
  @IsOptional()
  @Length(1, 160)
  description: string;

  @ApiProperty({ example: [1, 2] })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  permissions?: number[];
}
