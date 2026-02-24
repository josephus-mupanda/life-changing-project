import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ResendVerificationDto {
  @ApiProperty({ example: '+250788123456' })
  @IsNotEmpty()
  @IsString()
  phone: string;
}