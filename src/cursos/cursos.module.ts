import { Module } from '@nestjs/common';
import { CursosService } from './cursos.service';
import { CursosController } from './cursos.controller';
import { CursosDisciplinaService } from './cursos-disciplina/cursos-disciplina.service';

@Module({
  providers: [CursosService, CursosDisciplinaService],
  controllers: [CursosController],
  exports: [CursosService, CursosDisciplinaService],
})
export class CursosModule {}
