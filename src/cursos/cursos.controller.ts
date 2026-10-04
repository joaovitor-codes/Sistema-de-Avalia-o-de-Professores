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

@ApiTags('Cursos')
@ApiBearerAuth()
@ApiCookieAuth('access_token')
@UseGuards(AuthGuard, RolesGuard)
@Controller('api/cursos')
export class CursosController {
  constructor(private readonly cursosService: CursosService) {}

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
}
