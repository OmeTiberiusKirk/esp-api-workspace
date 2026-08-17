import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  authorization?: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ default: '0611448844' })
  mobile_no!: string;
}
