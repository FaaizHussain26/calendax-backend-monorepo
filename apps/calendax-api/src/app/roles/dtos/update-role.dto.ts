import { CreateRoleRequestDto } from './create-role-dto';
import { IsBoolean, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateRoleRequestDto extends CreateRoleRequestDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsBoolean()
  active: boolean;
}
