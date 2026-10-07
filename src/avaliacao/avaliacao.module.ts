import { Module } from '@nestjs/common';
import { AvaliacaoService } from './avaliacao.service';
import { AvaliacaoController } from './avaliacao.controller';

@Module({
  providers: [AvaliacaoService],
  controllers: [AvaliacaoController],
  exports: [AvaliacaoService],
})
export class AvaliacaoModule {}
