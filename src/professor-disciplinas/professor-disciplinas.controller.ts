import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import {
  ApiBadRequestResponse,
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
import { ProfessorDisciplinasService } from './professor-disciplinas.service';
import { CreateProfessorDisciplinaDto } from './dto/professor-disciplinas';

@ApiTags('Professor - Disciplinas')
@ApiBearerAuth()
@ApiCookieAuth('access_token')
@UseGuards(AuthGuard, RolesGuard)
@Controller('api/professores/:professorId/disciplinas')
export class ProfessorDisciplinasController {
  constructor(private readonly professorDisciplinasService: ProfessorDisciplinasService) {}

  @Post()
  @Roles(TipoUsuario.ADMINISTRADOR, TipoUsuario.PROFESSOR)
  @ApiOperation({ summary: 'Define que o professor leciona uma disciplina' })
  @ApiBadRequestResponse({ description: 'Professor não atua na instituição da disciplina' })
  @ApiNotFoundResponse({ description: 'Professor ou disciplina não encontrados' })
  @ApiConflictResponse({ description: 'Professor já leciona essa disciplina' })
  async create(
    @Param('professorId', ParseUUIDPipe) professorId: string,
    @Req() req,
    @Body() dto: CreateProfessorDisciplinaDto,
  ) {
    return this.professorDisciplinasService.create(professorId, req.user, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lista as disciplinas que o professor leciona' })
  @ApiNotFoundResponse({ description: 'Professor não encontrado' })
  async findAll(@Param('professorId', ParseUUIDPipe) professorId: string) {
    return this.professorDisciplinasService.findAll(professorId);
  }

  @Delete(':disciplinaId')
  @Roles(TipoUsuario.ADMINISTRADOR, TipoUsuario.PROFESSOR)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Tira a disciplina da lista do professor' })
  @ApiNoContentResponse({ description: 'Vínculo removido' })
  @ApiNotFoundResponse({ description: 'Professor ou vínculo não encontrados' })
  async remove(
    @Param('professorId', ParseUUIDPipe) professorId: string,
    @Param('disciplinaId', ParseUUIDPipe) disciplinaId: string,
    @Req() req,
  ) {
    await this.professorDisciplinasService.remove(professorId, disciplinaId, req.user);
  }
}
