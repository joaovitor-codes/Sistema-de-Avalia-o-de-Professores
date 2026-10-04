import {
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
} from '@nestjs/class-validator';
import { Type } from '@nestjs/class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Titulacao } from '@prisma/client';

export class CreateProfessorDto {
  @ApiProperty({ example: 'Maria Silva' })
  @IsNotEmpty()
  name!: string;
  @ApiProperty({ example: 'maria.silva@email.com', format: 'email' })
  @IsEmail()
  email!: string;
  @ApiProperty({ example: 'senhaSegura123', format: 'password' })
  @IsNotEmpty()
  password!: string;
}

export class UpdateProfessorDto {
  @ApiPropertyOptional({
    example: 'Professora de Engenharia de Software há 10 anos.',
  })
  @IsOptional()
  @IsString()
  biografia?: string;

  @ApiPropertyOptional({ enum: Titulacao, enumName: 'Titulacao' })
  @IsOptional()
  @IsEnum(Titulacao)
  titulacao?: Titulacao;
}

export class ListProfessoresQueryDto {
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

  @ApiPropertyOptional({
    description:
      'Filtra pelo nome do professor (sem diferenciar maiúsculas/minúsculas)',
  })
  @IsOptional()
  @IsString()
  nome?: string;
}
