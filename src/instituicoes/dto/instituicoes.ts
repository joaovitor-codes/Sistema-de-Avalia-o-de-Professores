import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Length,
  Max,
  Min,
} from '@nestjs/class-validator';
import { Type } from '@nestjs/class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateInstituicaoDto {
  @ApiProperty({ example: 'Universidade Federal de Pernambuco' })
  @IsNotEmpty()
  nome!: string;

  @ApiPropertyOptional({ example: 'UFPE' })
  @IsOptional()
  @IsString()
  sigla?: string;

  @ApiPropertyOptional({ example: 'Recife' })
  @IsOptional()
  @IsString()
  cidade?: string;

  @ApiPropertyOptional({ example: 'PE' })
  @IsOptional()
  @Length(2, 2, { message: 'estado deve ser a UF com 2 letras' })
  estado?: string;

  @ApiPropertyOptional({ example: 'https://site.com/logo.png' })
  @IsOptional()
  @IsUrl()
  logoUrl?: string;
}

export class UpdateInstituicaoDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsNotEmpty()
  nome?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sigla?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  cidade?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Length(2, 2, { message: 'estado deve ser a UF com 2 letras' })
  estado?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  logoUrl?: string;
}

export class ListInstituicoesQueryDto {
  @ApiPropertyOptional({ minimum: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({ minimum: 1, maximum: 100, default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 20;

  @ApiPropertyOptional({ description: 'Filtra pelo nome' })
  @IsOptional()
  @IsString()
  nome?: string;
}
