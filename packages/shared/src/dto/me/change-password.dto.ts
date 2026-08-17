import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ChangePasswordDto {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  authorization?: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  current_password!: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  new_password!: string;
}
