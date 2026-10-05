import { Module } from '@nestjs/common';
import { ProfessorInstituicoesService } from './professor-instituicoes.service';
import { ProfessorInstituicoesController } from './professor-instituicoes.controller';

@Module({
  providers: [ProfessorInstituicoesService],
  controllers: [ProfessorInstituicoesController],
})
export class ProfessorInstituicoesModule {}
