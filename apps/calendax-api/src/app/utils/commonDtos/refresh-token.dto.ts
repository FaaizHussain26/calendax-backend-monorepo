import { ApiProperty } from '@nestjs/swagger';

export class RefreshTokenDto {
  @ApiProperty({
    description: 'Refresh token obtained from login',
    type: String,
  })
  refreshToken: string;
}