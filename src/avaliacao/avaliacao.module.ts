import { Module } from '@nestjs/common';
import { AvaliacaoService } from './avaliacao.service';
import { AvaliacaoController } from './avaliacao.controller';
import { ProfessorAvaliacoesController } from './professor-avaliacoes.controller';

@Module({
  providers: [AvaliacaoService],
  controllers: [AvaliacaoController, ProfessorAvaliacoesController],
  exports: [AvaliacaoService],
})
export class AvaliacaoModule {}
