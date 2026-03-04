import { CreatePermissionGroupRequestDto } from './create-permission-group-response.dto';
import { ArrayMinSize, IsArray, IsBoolean, IsOptional, Length, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePermissionGroupRequestDto extends CreatePermissionGroupRequestDto {
  @ApiProperty({ description: 'Name of the permission group', example: 'User Management' })
  @IsOptional()
  @MaxLength(60)
  override title: string;

  @ApiProperty({ description: 'Description of the permission group', example: 'User Management permission group' })
  @IsOptional()
  @Length(1, 160)
  override description: string;

  @ApiProperty({ description: 'Is the permission group active?', example: true })
  @IsOptional()
  @IsBoolean()
  active: boolean;

  @ApiProperty({ example: [1, 2] })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  override permissions?: number[];
}
