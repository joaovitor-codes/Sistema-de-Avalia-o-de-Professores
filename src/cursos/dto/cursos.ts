import {
  IsEnum,
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
import { GrauAcademico } from '@prisma/client';

const graus = Object.values(GrauAcademico).join(', ');

export class CreateCursoDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  instituicaoId!: string;

  @ApiProperty({ example: 'Ciência da Computação' })
  @IsNotEmpty()
  nome!: string;

  @ApiProperty({ enum: GrauAcademico, enumName: 'GrauAcademico' })
  @IsEnum(GrauAcademico, { message: `grau inválido, use um desses: ${graus}` })
  grau!: GrauAcademico;
}

export class UpdateCursoDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsNotEmpty()
  nome?: string;

  @ApiPropertyOptional({ enum: GrauAcademico, enumName: 'GrauAcademico' })
  @IsOptional()
  @IsEnum(GrauAcademico, { message: `grau inválido, use um desses: ${graus}` })
  grau?: GrauAcademico;
}

export class ListCursosQueryDto {
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

  @ApiPropertyOptional({ enum: GrauAcademico, enumName: 'GrauAcademico' })
  @IsOptional()
  @IsEnum(GrauAcademico, { message: `grau inválido, use um desses: ${graus}` })
  grau?: GrauAcademico;

  @ApiPropertyOptional({ description: 'Filtra pelo nome' })
  @IsOptional()
  @IsString()
  nome?: string;
}
