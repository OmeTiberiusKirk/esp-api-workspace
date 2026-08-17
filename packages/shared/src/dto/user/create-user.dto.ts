import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreatePersonalDto } from './create-personal.dto.js';
import { CreateAddressDto } from './create-address.dto.js';

export class CreateUserDto {
  @ApiProperty({
    type: CreatePersonalDto,
    required: true,
    example: {
      user_type_id: 1,
      method_id: 1,
      person_id: '1100732983123',
      title_id: 515,
      title_name_th: 'เจ้าฟ้า',
      first_name_th: 'นุกูล',
      middle_name_th: 'ชื่อกลาง',
      last_name_th: 'เพิ่มสุทธิ',
      birth_date: '1999-09-09',
      date_of_expiry: '2030-09-17',
      register_email: 'example@email.com',
      register_mobile_no: '0611448844',
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
      user_home_no: '17',
      user_soi: 'อ่อนนุช 17',
      user_road: 'สุขุมวิท 77',
      user_moo: '10',
    },
  })
  @IsNotEmpty()
  @IsObject()
  @ValidateNested()
  @Type(() => CreateAddressDto)
  address!: CreateAddressDto;
}
