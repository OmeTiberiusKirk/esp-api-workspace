import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateAddressDto {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  authorization?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  user_home_no?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  user_moo?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  user_soi?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  user_road?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  tambol_seq?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  amphoe_seq?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  province_seq?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  tambol_name?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  amphoe_name?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  province_name?: string;
}
