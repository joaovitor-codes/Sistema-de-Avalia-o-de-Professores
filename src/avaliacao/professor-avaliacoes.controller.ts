import { Controller, Get, Param, ParseUUIDPipe, Query, Req, UseGuards } from '@nestjs/common';

import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCookieAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import type { AuthenticatedRequest } from '../auth/auth.types';
import { AvaliacaoService } from './avaliacao.service';
import { ListAvaliacoesProfessorQueryDto } from './dto/avaliacao';

@ApiTags('Avaliações')
@ApiBearerAuth()
@ApiCookieAuth('access_token')
@UseGuards(AuthGuard, RolesGuard)
@Controller('api/professores/:professorId/avaliacoes')
export class ProfessorAvaliacoesController {
  constructor(private readonly avaliacaoService: AvaliacaoService) {}

  @Get()
  @ApiOperation({
    summary: 'Lista as avaliações de um professor',
    description: 'Paginada, mais recentes primeiro, com filtro opcional por disciplina. Quando a avaliação é anônima o aluno vem null.',
  })
  @ApiOkResponse({ description: 'Lista de avaliações e total' })
  @ApiBadRequestResponse({ description: 'Parâmetros inválidos' })
  @ApiNotFoundResponse({ description: 'Professor não encontrado' })
  async findAll(
    @Param('professorId', ParseUUIDPipe) professorId: string,
    @Query() query: ListAvaliacoesProfessorQueryDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.avaliacaoService.getAvaliacoesByProfessor(professorId, query, req.user);
  }
}
