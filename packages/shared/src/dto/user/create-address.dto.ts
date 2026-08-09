import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateAddressDto {
  @IsOptional()
  @IsNumber()
  @ApiPropertyOptional({
    default: 1,
  })
  address_type?: number;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @ApiPropertyOptional({
    default: '17',
  })
  home_no?: string;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  @ApiPropertyOptional({
    default: 'อ่อนนุช 29',
  })
  soi?: string;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  @ApiPropertyOptional({
    default: 'สุขุมวิท 77',
  })
  road?: string;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  @ApiPropertyOptional({
    default: '5',
  })
  moo?: string;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  @ApiPropertyOptional({
    default: 'บางนา',
  })
  tambol_name?: string;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  @ApiPropertyOptional({
    default: 'บางนา',
  })
  amphur_name?: string;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  @ApiPropertyOptional({
    default: 'กรุงเทพมหานคร',
  })
  province_name?: string;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  @ApiPropertyOptional({
    default: '01',
    description: 'รหัสตำบล/แขวง จาก dol-esp-master-service',
  })
  tambol_code?: string;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  @ApiPropertyOptional({
    default: '01',
    description: 'รหัสอำเภอ/เขต จาก dol-esp-master-service',
  })
  amphur_code?: string;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  @ApiPropertyOptional({
    default: '10',
    description: 'รหัสจังหวัด จาก dol-esp-master-service',
  })
  province_code?: string;

  constructor(data: CreateAddressDto) {
    Object.assign(this, data);
  }
}
