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
import { DisciplinasService } from './disciplinas.service';
import {
  CreateDisciplinaDto,
  ListDisciplinasQueryDto,
  UpdateDisciplinaDto,
} from './dto/disciplinas';

@ApiTags('Disciplinas')
@ApiBearerAuth()
@ApiCookieAuth('access_token')
@UseGuards(AuthGuard, RolesGuard)
@Controller('api/disciplinas')
export class DisciplinasController {
  constructor(private readonly disciplinasService: DisciplinasService) {}

  @Post()
  @Roles(TipoUsuario.ADMINISTRADOR)
  @ApiOperation({ summary: 'Cria uma disciplina numa instituição' })
  @ApiBadRequestResponse({ description: 'Dados inválidos' })
  @ApiNotFoundResponse({ description: 'Instituição não encontrada' })
  async create(@Body() dto: CreateDisciplinaDto) {
    return this.disciplinasService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lista disciplinas' })
  async findAll(@Query() query: ListDisciplinasQueryDto) {
    return this.disciplinasService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca uma disciplina pelo ID' })
  @ApiNotFoundResponse({ description: 'Disciplina não encontrada' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.disciplinasService.findOne(id);
  }

  @Patch(':id')
  @Roles(TipoUsuario.ADMINISTRADOR)
  @ApiOperation({ summary: 'Atualiza uma disciplina' })
  @ApiBadRequestResponse({ description: 'Dados inválidos' })
  @ApiNotFoundResponse({ description: 'Disciplina não encontrada' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateDisciplinaDto,
  ) {
    return this.disciplinasService.update(id, dto);
  }

  @Delete(':id')
  @Roles(TipoUsuario.ADMINISTRADOR)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove uma disciplina (soft delete)' })
  @ApiNoContentResponse({ description: 'Disciplina removida' })
  @ApiNotFoundResponse({ description: 'Disciplina não encontrada' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.disciplinasService.remove(id);
  }
}
