import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { CreatePersonalDto } from '../user/create-personal.dto.js';
import { CreateAddressDto } from '../user/create-address.dto.js';
import { CreateDepartmentAddressDto } from './create-department-address.dto.js';

export class ExternalOrgAttachmentDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  file_name!: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  file_mime_type!: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ description: 'Base64-encoded file content' })
  buffer_base64!: string;
}

export class CreateExternalOrgUserDto {
  @IsNotEmpty()
  @IsObject()
  @ValidateNested()
  @Type(() => CreatePersonalDto)
  @ApiProperty({ type: CreatePersonalDto })
  personal!: CreatePersonalDto;

  @IsNotEmpty()
  @IsObject()
  @ValidateNested()
  @Type(() => CreateAddressDto)
  @ApiProperty({ type: CreateAddressDto })
  address!: CreateAddressDto;

  @IsNotEmpty()
  @IsObject()
  @ValidateNested()
  @Type(() => CreateDepartmentAddressDto)
  @ApiProperty({ type: CreateDepartmentAddressDto })
  departmentAddress!: CreateDepartmentAddressDto;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExternalOrgAttachmentDto)
  @ApiPropertyOptional({ type: [ExternalOrgAttachmentDto] })
  attachments?: ExternalOrgAttachmentDto[];
}
