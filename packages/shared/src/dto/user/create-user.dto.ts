import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEmail,
  IsIdentityCard,
  IsNotEmpty,
  IsNumber,
  // IsObject,
  IsOptional,
  IsPhoneNumber,
  IsString,
  Length,
  MaxLength,
  // ValidateNested,
} from 'class-validator';
// import { Type } from 'class-transformer';
// import { CreatePersonalDto } from './create-personal.dto.js';
// import { CreateAddressDto } from './create-address.dto.js';

export class CreateUserDto {
  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({
    default: 1,
  })
  user_type_id!: number;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({
    default: 1,
  })
  method_id!: number;

  @IsNotEmpty()
  @IsIdentityCard('TH')
  @Length(13, 13)
  @ApiProperty({
    default: '1100732983123',
  })
  person_id!: string;

  // @IsNotEmpty()
  // @IsNumber()
  // @ApiProperty({
  //   default: 515,
  // })
  // title_id!: number;

  @IsNotEmpty()
  @IsString()
  @MaxLength(20)
  @ApiProperty({
    default: 'เจ้าฟ้า',
  })
  title_name_th!: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  @ApiProperty({
    default: 'นุกูล',
  })
  first_name_th!: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  @ApiPropertyOptional({
    default: 'ชื่อกลาง',
  })
  middle_name_th?: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  @ApiProperty({
    default: 'เพิ่มสุทธิ',
  })
  last_name_th!: string;

  @IsOptional()
  @IsDateString()
  @ApiPropertyOptional({
    default: new Date('1999-09-09'),
  })
  birth_date?: Date;

  @IsOptional()
  @IsDateString()
  @ApiPropertyOptional({
    default: new Date('2030-09-17'),
  })
  date_of_expiry?: Date;

  @IsNotEmpty()
  @IsEmail()
  @MaxLength(100)
  @ApiProperty({
    default: 'jaruwanno1991@gmail.com',
  })
  register_email!: string;

  @IsNotEmpty()
  @IsPhoneNumber('TH')
  @MaxLength(10)
  @ApiProperty({
    default: '0611436644',
  })
  register_mobile_no!: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  @ApiPropertyOptional({
    default: '17',
  })
  user_home_no?: string;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  @ApiPropertyOptional({
    default: 'อ่อนนุช 17',
  })
  user_soi?: string;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  @ApiPropertyOptional({
    default: 'สุขุมวิท 77',
  })
  user_road?: string;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  @MaxLength(10)
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
  @MaxLength(100)
  province_name?: string;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  amphoe_seq?: string;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  amphoe_name?: string;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  tambol_seq?: string;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  tambol_name?: string;

  // @ApiProperty({
  //   type: CreatePersonalDto,
  //   required: true,
  //   example: {
  //     user_type_id: 1,
  //     method_id: 1,
  //     person_id: '1100732983123',
  //     title_id: 515,
  //     title_name_th: 'เจ้าฟ้า',
  //     first_name_th: 'นุกูล',
  //     middle_name_th: 'ชื่อกลาง',
  //     last_name_th: 'เพิ่มสุทธิ',
  //     birth_date: '1999-09-09',
  //     date_of_expiry: '2030-09-17',
  //     register_email: 'example@email.com',
  //     register_mobile_no: '0611448844',
  //   },
  // })
  // @IsNotEmpty()
  // @IsObject()
  // @ValidateNested()
  // @Type(() => CreatePersonalDto)
  // personal!: CreatePersonalDto;
  // @ApiProperty({
  //   type: CreateAddressDto,
  //   required: true,
  //   example: {
  //     user_home_no: '17',
  //     user_soi: 'อ่อนนุช 17',
  //     user_road: 'สุขุมวิท 77',
  //     user_moo: '10',
  //   },
  // })
  // @IsNotEmpty()
  // @IsObject()
  // @ValidateNested()
  // @Type(() => CreateAddressDto)
  // address!: CreateAddressDto;
}
