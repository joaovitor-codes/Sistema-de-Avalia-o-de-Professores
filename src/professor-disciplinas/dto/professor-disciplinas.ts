import { IsUUID } from '@nestjs/class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProfessorDisciplinaDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  disciplinaId!: string;
}
