import { Module } from '@nestjs/common';
import { ProfessorDisciplinasService } from './professor-disciplinas.service';
import { ProfessorDisciplinasController } from './professor-disciplinas.controller';

@Module({
  providers: [ProfessorDisciplinasService],
  controllers: [ProfessorDisciplinasController],
})
export class ProfessorDisciplinasModule {}
