import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ThaidLoginDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    default: 'authorization-code-from-dopa',
  })
  code!: string;
}
