import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateDepartmentAddressDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ description: "'1' = ราชการ, '2' = เอกชน/นิติบุคคล เป็นต้น" })
  department_type!: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  private_office_certificate_no?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  department_adress_no?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  department_moo?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  department_alley?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  department_soi?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  department_road?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  department_tambon_seq?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  department_amphoe_seq?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  department_province_seq?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  department_postcode?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  department_telephone?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  department_fax?: string;
}
