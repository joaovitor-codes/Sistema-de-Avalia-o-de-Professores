import {
  Body,
  Controller,
  Delete,
  Get,
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
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCookieAuth,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { TipoUsuario } from '@prisma/client';
import { AuthGuard } from '../auth/auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { ProfessorInstituicoesService } from './professor-instituicoes.service';
import {
  CreateProfessorInstituicaoDto,
  UpdateProfessorInstituicaoDto,
} from './dto/professor-instituicoes';

@ApiTags('Professor - Instituições')
@ApiBearerAuth()
@ApiCookieAuth('access_token')
@UseGuards(AuthGuard, RolesGuard)
@Controller('api/professores/:professorId/instituicoes')
export class ProfessorInstituicoesController {
  constructor(private readonly professorInstituicoesService: ProfessorInstituicoesService) {}

  @Post()
  @Roles(TipoUsuario.ADMINISTRADOR, TipoUsuario.PROFESSOR)
  @ApiOperation({ summary: 'Vincula o professor a uma instituição' })
  @ApiNotFoundResponse({ description: 'Professor ou instituição não encontrados' })
  @ApiConflictResponse({ description: 'Professor já vinculado a essa instituição' })
  async create(
    @Param('professorId', ParseUUIDPipe) professorId: string,
    @Req() req,
    @Body() dto: CreateProfessorInstituicaoDto,
  ) {
    return this.professorInstituicoesService.create(professorId, req.user, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lista as instituições onde o professor atua' })
  @ApiNotFoundResponse({ description: 'Professor não encontrado' })
  async findAll(@Param('professorId', ParseUUIDPipe) professorId: string) {
    return this.professorInstituicoesService.findAll(professorId);
  }

  @Patch(':instituicaoId')
  @Roles(TipoUsuario.ADMINISTRADOR, TipoUsuario.PROFESSOR)
  @ApiOperation({ summary: 'Altera o departamento do vínculo' })
  @ApiNotFoundResponse({ description: 'Professor ou vínculo não encontrados' })
  async update(
    @Param('professorId', ParseUUIDPipe) professorId: string,
    @Param('instituicaoId', ParseUUIDPipe) instituicaoId: string,
    @Req() req,
    @Body() dto: UpdateProfessorInstituicaoDto,
  ) {
    return this.professorInstituicoesService.update(professorId, instituicaoId, req.user, dto);
  }

  @Delete(':instituicaoId')
  @Roles(TipoUsuario.ADMINISTRADOR, TipoUsuario.PROFESSOR)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove o vínculo (e as disciplinas do professor nessa instituição)' })
  @ApiNoContentResponse({ description: 'Vínculo removido' })
  @ApiNotFoundResponse({ description: 'Professor ou vínculo não encontrados' })
  async remove(
    @Param('professorId', ParseUUIDPipe) professorId: string,
    @Param('instituicaoId', ParseUUIDPipe) instituicaoId: string,
    @Req() req,
  ) {
    await this.professorInstituicoesService.remove(professorId, instituicaoId, req.user);
  }
}
