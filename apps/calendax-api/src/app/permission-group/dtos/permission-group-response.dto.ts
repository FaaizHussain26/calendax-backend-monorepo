import { ApiProperty } from '@nestjs/swagger';
import { PermissionResponseDto } from '../../permission/dtos/permission-response.dto';

export class PermissionGroupResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  title: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  active: boolean;

  @ApiProperty()
  permissions: PermissionResponseDto[];
}
