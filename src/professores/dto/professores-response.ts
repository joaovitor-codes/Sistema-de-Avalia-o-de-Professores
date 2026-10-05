import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Titulacao } from '@prisma/client';

// Respostas da API de professores documentadas no Swagger.

export class ProfessorCriadoResponse {
  @ApiProperty({ format: 'uuid', description: 'ID do usuário criado' })
  id!: string;

  @ApiProperty({ example: 'maria.silva@email.com' })
  email!: string;
}

export class ProfessorResponse {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ format: 'uuid' })
  usuarioId!: string;

  @ApiPropertyOptional({ enum: Titulacao, enumName: 'Titulacao', nullable: true })
  titulacao!: Titulacao | null;

  @ApiPropertyOptional({ nullable: true })
  biografia!: string | null;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;

  @ApiPropertyOptional({ nullable: true })
  deletedAt!: Date | null;
}

class ContaEmailResponse {
  @ApiProperty({ example: 'maria.silva@email.com' })
  email!: string;
}

class UsuarioProfessorResponse {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ example: 'Maria Silva' })
  nome!: string;

  @ApiPropertyOptional({ type: ContaEmailResponse, nullable: true })
  conta!: ContaEmailResponse | null;
}

class InstituicaoResumoResponse {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ example: 'Universidade Federal de Pernambuco' })
  nome!: string;

  @ApiPropertyOptional({ example: 'UFPE', nullable: true })
  sigla!: string | null;
}

class ProfessorInstituicaoResumoResponse {
  @ApiPropertyOptional({ example: 'Centro de Informática', nullable: true })
  departamento!: string | null;

  @ApiProperty({ type: InstituicaoResumoResponse })
  instituicao!: InstituicaoResumoResponse;
}

class DisciplinaResumoResponse {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ example: 'Banco de Dados' })
  nome!: string;

  @ApiPropertyOptional({ example: 'CIN0002', nullable: true })
  codigo!: string | null;
}

class ProfessorDisciplinaResumoResponse {
  @ApiProperty({ type: DisciplinaResumoResponse })
  disciplina!: DisciplinaResumoResponse;
}

export class ProfessorComUsuarioResponse extends ProfessorResponse {
  @ApiProperty({ type: UsuarioProfessorResponse })
  usuario!: UsuarioProfessorResponse;

  @ApiProperty({ type: [ProfessorInstituicaoResumoResponse] })
  instituicoes!: ProfessorInstituicaoResumoResponse[];

  @ApiProperty({ type: [ProfessorDisciplinaResumoResponse] })
  disciplinas!: ProfessorDisciplinaResumoResponse[];
}

export class ListProfessoresResponse {
  @ApiProperty({ type: [ProfessorComUsuarioResponse] })
  professores!: ProfessorComUsuarioResponse[];

  @ApiProperty({ example: 42, description: 'Total de professores encontrados' })
  total!: number;
}
