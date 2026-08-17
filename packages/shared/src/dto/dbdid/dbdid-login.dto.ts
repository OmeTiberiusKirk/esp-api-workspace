import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class DbdidLoginDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    default: 'authorization-code-from-dbdid',
  })
  code!: string;
}
