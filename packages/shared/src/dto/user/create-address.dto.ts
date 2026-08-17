import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateAddressDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @ApiPropertyOptional({
    default: '17',
  })
  user_home_no?: string;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  @ApiPropertyOptional({
    default: 'อ่อนนุช 17',
  })
  user_soi?: string;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  @ApiPropertyOptional({
    default: 'สุขุมวิท 77',
  })
  user_road?: string;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  @ApiPropertyOptional({
    default: '10',
  })
  user_moo?: string;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  province_seq?: string;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  province_name?: string;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  amphoe_seq?: string;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  amphoe_name?: string;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  tambol_seq?: string;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  tambol_name?: string;

  constructor(data: CreateAddressDto) {
    Object.assign(this, data);
  }
}
