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
    example: {
      user_type_id: 1,
      person_id: '1100732983123',
      title: 'ศาสตราจารย์',
      given_name: 'นุกูล',
      middle_name: 'ชื่อกลาง',
      family_name: 'เพิ่มสุทธิ',
      birth_date: '1999-09-09',
      date_of_expiry: '2030-09-17',
      email: 'jaruwanno1991@gmail.com',
      mobile_no: '0611436644',
    },
  })
  @IsNotEmpty()
  @IsObject()
  @ValidateNested()
  @Type(() => CreatePersonalDto)
  personal!: CreatePersonalDto;

  @ApiProperty({
    type: CreateAddressDto,
    required: true,
    example: {
      address_type: 1,
      home_no: '17',
      soi: 'อ่อนนุช 29',
      road: 'สุขุมวิท 77',
      moo: '5',
      tambol_name: 'บางนา',
      amphur_name: 'บางนา',
      province_name: 'กรุงเทพมหานคร',
      tambol_code: '01',
      amphur_code: '01',
      province_code: '10',
    },
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
