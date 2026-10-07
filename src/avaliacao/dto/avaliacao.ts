import {
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from '@nestjs/class-validator';
import { Type } from '@nestjs/class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class NotaCriterioDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  criterioId!: string;

  @ApiProperty({ minimum: 1, maximum: 5, example: 4 })
  @IsInt()
  @Min(1)
  @Max(5)
  nota!: number;
}

export class CreateAvaliacaoDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  professorId!: string;

  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  disciplinaId!: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  anonima?: boolean;

  @ApiPropertyOptional({ example: 'Explica muito bem, as listas ajudam bastante.' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  comentario?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  recomendaria?: boolean;

  @ApiProperty({ type: [NotaCriterioDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayUnique((n: NotaCriterioDto) => n.criterioId)
  @ValidateNested({ each: true })
  @Type(() => NotaCriterioDto)
  notas!: NotaCriterioDto[];
}

export class UpdateAvaliacaoDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  anonima?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  comentario?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  recomendaria?: boolean;

  @ApiPropertyOptional({ type: [NotaCriterioDto] })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ArrayUnique((n: NotaCriterioDto) => n.criterioId)
  @ValidateNested({ each: true })
  @Type(() => NotaCriterioDto)
  notas?: NotaCriterioDto[];
}

export class ListAvaliacoesQueryDto {
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
  professorId?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  disciplinaId?: string;
}
