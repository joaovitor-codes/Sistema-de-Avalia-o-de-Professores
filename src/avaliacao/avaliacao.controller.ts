import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { TipoUsuario } from '@prisma/client';
import { AuthGuard } from '../auth/auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import type { AuthenticatedRequest } from '../auth/auth.types';
import { AvaliacaoService } from './avaliacao.service';
import { CreateAvaliacaoDto, UpdateAvaliacaoDto } from './dto/avaliacao';

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

  @Patch(':id')
  @Roles(TipoUsuario.ALUNO)
  @ApiOperation({
    summary: 'Aluno edita a própria avaliação',
    description: 'Só dentro do prazo depois de criar a avaliação (padrão 24h, env AVALIACAO_JANELA_EDICAO_HORAS). Se mandar notas, tem que mandar todas.',
  })
  @ApiOkResponse({ description: 'Avaliação atualizada' })
  @ApiBadRequestResponse({ description: 'Dados inválidos ou faltam notas de critérios' })
  @ApiForbiddenResponse({ description: 'Avaliação de outro aluno ou prazo de edição vencido' })
  @ApiNotFoundResponse({ description: 'Avaliação não encontrada' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: AuthenticatedRequest,
    @Body() dto: UpdateAvaliacaoDto,
  ) {
    return this.avaliacaoService.updateAvaliacao(id, req.user.id, dto);
  }

  @Delete(':id')
  @Roles(TipoUsuario.ALUNO)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Aluno remove a própria avaliação (soft delete)',
    description: 'Mesmo prazo da edição. Depois de remover o aluno pode avaliar de novo.',
  })
  @ApiNoContentResponse({ description: 'Avaliação removida' })
  @ApiForbiddenResponse({ description: 'Avaliação de outro aluno ou prazo vencido' })
  @ApiNotFoundResponse({ description: 'Avaliação não encontrada' })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    await this.avaliacaoService.deleteAvaliacao(id, req.user.id);
  }
}
