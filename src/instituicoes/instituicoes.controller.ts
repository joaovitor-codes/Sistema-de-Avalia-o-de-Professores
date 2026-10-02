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
import { InstituicoesService } from './instituicoes.service';

import {
  CreateInstituicaoDto,
  ListInstituicoesQueryDto,
  UpdateInstituicaoDto,
} from './dto/instituicoes';

@ApiTags('Instituições')
@ApiBearerAuth()
@ApiCookieAuth('access_token')
@UseGuards(AuthGuard, RolesGuard)
@Controller('api/instituicoes')
export class InstituicoesController {
  constructor(private readonly instituicoesService: InstituicoesService) {}

  @Post()
  @Roles(TipoUsuario.ADMINISTRADOR)
  @ApiOperation({ summary: 'Cria uma instituição' })
  @ApiBadRequestResponse({ description: 'Dados inválidos' })
  async create(@Body() dto: CreateInstituicaoDto) {
    return this.instituicoesService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lista instituições' })
  async findAll(@Query() query: ListInstituicoesQueryDto) {
    return this.instituicoesService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca uma instituição pelo ID' })
  @ApiNotFoundResponse({ description: 'Instituição não encontrada' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.instituicoesService.findOne(id);
  }

  @Patch(':id')
  @Roles(TipoUsuario.ADMINISTRADOR)
  @ApiOperation({ summary: 'Atualiza uma instituição' })
  @ApiBadRequestResponse({ description: 'Dados inválidos' })
  @ApiNotFoundResponse({ description: 'Instituição não encontrada' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateInstituicaoDto,
  ) {
    return this.instituicoesService.update(id, dto);
  }

  @Delete(':id')
  @Roles(TipoUsuario.ADMINISTRADOR)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove uma instituição (soft delete)' })
  @ApiNoContentResponse({ description: 'Instituição removida' })
  @ApiNotFoundResponse({ description: 'Instituição não encontrada' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.instituicoesService.remove(id);
  }
}
