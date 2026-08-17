import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class VerifyUserDto {
  @IsNotEmpty()
  @IsUUID()
  @ApiProperty()
  user_id!: string;

  @IsNotEmpty()
  @IsIn([1, 2])
  @ApiProperty({
    default: 1,
    description: '1 = approve, 2 = reject',
  })
  verify_flag!: number;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'Required when verify_flag = 2 (reject)',
  })
  reason?: string;
}
