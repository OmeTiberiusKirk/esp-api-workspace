import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    default: 'username',
  })
  username!: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    default: 'password',
  })
  password!: string;
}
