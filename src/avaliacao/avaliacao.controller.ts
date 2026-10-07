import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';

import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { TipoUsuario } from '@prisma/client';
import { AuthGuard } from '../auth/auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import type { AuthenticatedRequest } from '../auth/auth.types';
import { AvaliacaoService } from './avaliacao.service';
import { CreateAvaliacaoDto } from './dto/avaliacao';

@ApiTags('Avaliações')
@ApiBearerAuth()
@ApiCookieAuth('access_token')
@UseGuards(AuthGuard, RolesGuard)
@Controller('api/avaliacoes')
export class AvaliacaoController {
  constructor(private readonly avaliacaoService: AvaliacaoService) {}

  @Post()
  @Roles(TipoUsuario.ALUNO)
  @ApiOperation({ summary: 'Aluno avalia um professor numa disciplina' })
  @ApiCreatedResponse({ description: 'Avaliação criada' })
  @ApiBadRequestResponse({
    description: 'Dados inválidos, professor não leciona a disciplina ou faltam notas de critérios',
  })
  @ApiForbiddenResponse({ description: 'Usuário não é aluno' })
  @ApiNotFoundResponse({ description: 'Professor ou disciplina não encontrados' })
  @ApiConflictResponse({ description: 'Aluno já avaliou esse professor nessa disciplina' })
  async create(@Req() req: AuthenticatedRequest, @Body() dto: CreateAvaliacaoDto) {
    return this.avaliacaoService.avaliarProfessor(req.user.id, dto);
  }
}
