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
  Query,
  UseGuards,
} from '@nestjs/common';

import {
  ApiBadRequestResponse,
  ApiBearerAuth,
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
import { CursosService } from './cursos.service';
import { CreateCursoDto, ListCursosQueryDto, UpdateCursoDto } from './dto/cursos';
import { CursosDisciplinaService } from './cursos-disciplina/cursos-disciplina.service';

@ApiTags('Cursos')
@ApiBearerAuth()
@ApiCookieAuth('access_token')
@UseGuards(AuthGuard, RolesGuard)
@Controller('api/cursos')
export class CursosController {
  constructor(
    private readonly cursosService: CursosService,
    private readonly cursoDisciplinaService: CursosDisciplinaService
  ) {}

  @Post()
  @Roles(TipoUsuario.ADMINISTRADOR)
  @ApiOperation({ summary: 'Cria um curso numa instituição' })
  @ApiBadRequestResponse({ description: 'Dados inválidos ou grau fora do enum' })
  @ApiNotFoundResponse({ description: 'Instituição não encontrada' })
  async create(@Body() dto: CreateCursoDto) {
    return this.cursosService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lista cursos' })
  async findAll(@Query() query: ListCursosQueryDto) {
    return this.cursosService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca um curso pelo ID' })
  @ApiNotFoundResponse({ description: 'Curso não encontrado' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.cursosService.findOne(id);
  }

  @Patch(':id')
  @Roles(TipoUsuario.ADMINISTRADOR)
  @ApiOperation({ summary: 'Atualiza um curso' })
  @ApiBadRequestResponse({ description: 'Dados inválidos ou grau fora do enum' })
  @ApiNotFoundResponse({ description: 'Curso não encontrado' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCursoDto,
  ) {
    return this.cursosService.update(id, dto);
  }

  @Delete(':id')
  @Roles(TipoUsuario.ADMINISTRADOR)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove um curso (soft delete)' })
  @ApiNoContentResponse({ description: 'Curso removido' })
  @ApiNotFoundResponse({ description: 'Curso não encontrado' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.cursosService.remove(id);
  }

  @Get(':cursoId/disciplinas')
  @ApiOperation({ summary: 'Lista disciplinas de um curso' })
  @ApiNotFoundResponse({ description: 'Curso não encontrado' })
  async findAllDisciplinasByCursoId(@Param('cursoId', ParseUUIDPipe) cursoId: string) {
    return this.cursoDisciplinaService.findAllByCursoId(cursoId);
  }

  @Post(':cursoId/disciplinas/:disciplinaId')
  @Roles(TipoUsuario.ADMINISTRADOR)
  @ApiOperation({ summary: 'Vincula uma disciplina a um curso' })
  @ApiNotFoundResponse({ description: 'Curso ou disciplina não encontrados' })
  async createCursoDisciplina(@Param('cursoId', ParseUUIDPipe) cursoId: string, @Param('disciplinaId', ParseUUIDPipe) disciplinaId: string) {
    return this.cursoDisciplinaService.vincularCursoDisciplina(cursoId, disciplinaId);
  }

  @Delete(':cursoId/disciplinas/:disciplinaId')
  @Roles(TipoUsuario.ADMINISTRADOR)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Desvincula uma disciplina de um curso' })
  @ApiNoContentResponse({ description: 'Disciplina desvinculada do curso' })
  @ApiNotFoundResponse({ description: 'Vínculo não encontrado' })
  async removeCursoDisciplina(@Param('cursoId', ParseUUIDPipe) cursoId: string, @Param('disciplinaId', ParseUUIDPipe) disciplinaId: string) {
    await this.cursoDisciplinaService.desvincularCursoDisciplina(cursoId, disciplinaId);
  }

  @Patch(':cursoId/disciplinas/:disciplinaId/:newDisciplinaId')
  @Roles(TipoUsuario.ADMINISTRADOR)
  @ApiOperation({ summary: 'Atualiza o vínculo de uma disciplina a um curso' })
  @ApiNotFoundResponse({ description: 'Curso ou disciplina não encontrados' })
  async updateCursoDisciplina(
    @Param('cursoId', ParseUUIDPipe) cursoId: string,
    @Param('disciplinaId', ParseUUIDPipe) disciplinaId: string,
    @Param('newDisciplinaId', ParseUUIDPipe) newDisciplinaId: string,
  ) {
    return this.cursoDisciplinaService.updateCursoDisciplina(cursoId, disciplinaId, newDisciplinaId);
  }
}
