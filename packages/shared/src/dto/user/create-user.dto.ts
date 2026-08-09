import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsObject,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreatePersonalDto } from './create-personal.dto.js';
import { CreateAddressDto } from './create-address.dto.js';

export class CreateUserDto {
  @ApiProperty({
    type: CreatePersonalDto,
    required: true,
  })
  @IsNotEmpty()
  @IsObject()
  @ValidateNested()
  @Type(() => CreatePersonalDto)
  personal!: CreatePersonalDto;

  @ApiProperty({
    type: CreateAddressDto,
    required: true,
  })
  @IsNotEmpty()
  @IsObject()
  @ValidateNested()
  @Type(() => CreateAddressDto)
  address!: CreateAddressDto;

  @ApiPropertyOptional({
    description: 'true ถ้าผู้ใช้ยืนยันตัวตนผ่าน ThaID มาก่อนแล้ว',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  is_thaid_verified?: boolean;
}
