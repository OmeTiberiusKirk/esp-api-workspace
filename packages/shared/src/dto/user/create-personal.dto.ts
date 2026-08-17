import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEmail,
  IsIdentityCard,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPhoneNumber,
  IsString,
} from 'class-validator';

export class CreatePersonalDto {
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
  @ApiProperty({
    default: '1100732983123',
  })
  person_id!: string;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({
    default: 515,
  })
  title_id!: number;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    default: 'เจ้าฟ้า',
  })
  title_name_th!: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    default: 'นุกูล',
  })
  first_name_th!: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    default: 'ชื่อกลาง',
  })
  middle_name_th?: string;

  @IsNotEmpty()
  @IsString()
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
  @ApiProperty({
    default: 'jaruwanno1991@gmail.com',
  })
  email!: string;

  @IsNotEmpty()
  @IsPhoneNumber('TH')
  @ApiProperty({
    default: '0611436644',
  })
  mobile_no!: string;

  constructor(data: CreatePersonalDto) {
    Object.assign(this, data);
  }
}
