import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class OpenidLoginDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    default: 'authorization-code-from-openid',
  })
  code!: string;
}
