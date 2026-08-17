import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class RegisterDataQueryDto {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  authorization?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: 'DD/MM/YYYY (Buddhist era) or YYYY-MM-DD' })
  start_date?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: 'DD/MM/YYYY (Buddhist era) or YYYY-MM-DD' })
  end_date?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  user_type?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  first_name?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  last_name?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @ApiPropertyOptional()
  method_id?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @ApiPropertyOptional()
  channel_id?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @ApiPropertyOptional({ default: 1 })
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @ApiPropertyOptional({ default: 20 })
  limit?: number;
}
