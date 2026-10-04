import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Titulacao } from '@prisma/client';

// Classes usadas apenas para documentar as respostas no Swagger

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

  @ApiPropertyOptional({
    enum: Titulacao,
    enumName: 'Titulacao',
    nullable: true,
  })
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

export class ProfessorComUsuarioResponse extends ProfessorResponse {
  @ApiProperty({ type: UsuarioProfessorResponse })
  usuario!: UsuarioProfessorResponse;
}

export class ListProfessoresResponse {
  @ApiProperty({ type: [ProfessorComUsuarioResponse] })
  professores!: ProfessorComUsuarioResponse[];

  @ApiProperty({ example: 42, description: 'Total de professores encontrados' })
  total!: number;
}
