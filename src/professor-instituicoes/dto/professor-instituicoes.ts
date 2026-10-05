import { IsOptional, IsString, IsUUID } from '@nestjs/class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProfessorInstituicaoDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  instituicaoId!: string;

  @ApiPropertyOptional({ example: 'Centro de Informática' })
  @IsOptional()
  @IsString()
  departamento?: string;
}

export class UpdateProfessorInstituicaoDto {
  @ApiPropertyOptional({ example: 'Departamento de Matemática', description: 'Mande null pra limpar' })
  @IsOptional()
  @IsString()
  departamento?: string;
}
