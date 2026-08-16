import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

export class VerifyOtpDto {
  @IsNotEmpty()
  @IsEmail()
  @ApiProperty({
    default: 'example@gmail.com',
  })
  email!: string;

  @IsNotEmpty()
  @IsString()
  @Length(6, 6)
  @ApiProperty({
    default: '123456',
  })
  otp!: string;
}
