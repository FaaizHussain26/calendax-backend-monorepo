import { ApiProperty } from '@nestjs/swagger';
import { PermissionResponseDto } from '../../permission/dtos/permission-response.dto';

export class RoleResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty({ type: [PermissionResponseDto] })
  permissions: PermissionResponseDto[];

  @ApiProperty()
  active: boolean;
}
