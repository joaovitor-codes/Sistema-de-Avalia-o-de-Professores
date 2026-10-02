import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from '@nestjs/class-validator';
import { Type } from '@nestjs/class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDisciplinaDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  instituicaoId!: string;

  @ApiProperty({ example: 'Estruturas de Dados' })
  @IsNotEmpty()
  nome!: string;

  @ApiPropertyOptional({ example: 'INF0123' })
  @IsOptional()
  @IsString()
  codigo?: string;

  @ApiPropertyOptional({ example: 60 })
  @IsOptional()
  @IsInt()
  @Min(1)
  cargaHoraria?: number;
}

export class UpdateDisciplinaDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsNotEmpty()
  nome?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  codigo?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  cargaHoraria?: number;
}

export class ListDisciplinasQueryDto {
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

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  instituicaoId?: string;

  @ApiPropertyOptional({ description: 'Filtra pelo nome' })
  @IsOptional()
  @IsString()
  nome?: string;
}
