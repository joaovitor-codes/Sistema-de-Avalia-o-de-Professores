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
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { TipoUsuario } from '@prisma/client';
import { AuthGuard } from '../auth/auth.guard';
import { ProfessoresService } from './professores.service';

import {
  CreateProfessorDto,
  ListProfessoresQueryDto,
  UpdateProfessorDto,
} from './dto/professores';

import {
  ListProfessoresResponse,
  ProfessorCriadoResponse,
  ProfessorResponse,
} from './dto/professores-response';

import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@ApiTags('Professores')
@ApiBearerAuth()
@ApiCookieAuth('access_token')
@ApiUnauthorizedResponse({ description: 'Token ausente ou inválido' })
@ApiForbiddenResponse({ description: 'Usuário sem permissão para esta operação' })
@UseGuards(AuthGuard, RolesGuard)
@Controller('api/professores')
export class ProfessoresController {
  constructor(private readonly professoresService: ProfessoresService) {}

  @Post()
  @Roles(TipoUsuario.ADMINISTRADOR)
  @ApiOperation({
    summary: 'Cria um professor',
    description: 'Cria um usuário do tipo PROFESSOR com conta de acesso. Apenas ADMINISTRADOR.',
  })
  @ApiCreatedResponse({ type: ProfessorCriadoResponse })
  @ApiBadRequestResponse({ description: 'Dados inválidos' })
  @ApiConflictResponse({ description: 'O email informado já está em uso' })
  async create(
    @Req() req,
    @Body() dto: CreateProfessorDto,
  ) {
    return this.professoresService.create(req.user.id, dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Lista e busca professores',
    description: 'Lista paginada de professores ativos, com filtros opcionais por nome, instituição, curso e disciplina. O email só aparece para ADMINISTRADOR.',
  })
  @ApiOkResponse({ type: ListProfessoresResponse })
  @ApiBadRequestResponse({ description: 'Parâmetros inválidos' })
  async findAll(
    @Query() query: ListProfessoresQueryDto,
    @Req() req,
  ) {
    return this.professoresService.findAll(query, req.user);
  }

  @Get(':id')
  @Roles(TipoUsuario.ADMINISTRADOR)
  @ApiOperation({ summary: 'Busca um professor pelo ID', description: 'Apenas ADMINISTRADOR.' })
  @ApiParam({ name: 'id', format: 'uuid', description: 'ID do professor' })
  @ApiOkResponse({ type: ProfessorResponse })
  @ApiBadRequestResponse({ description: 'ID não é um UUID válido' })
  @ApiNotFoundResponse({ description: 'Professor não encontrado' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.professoresService.findOne(id);
  }

  @Patch(':id')
  @Roles(TipoUsuario.ADMINISTRADOR, TipoUsuario.PROFESSOR)
  @ApiOperation({
    summary: 'Atualiza um professor',
    description: 'ADMINISTRADOR pode editar qualquer professor; PROFESSOR apenas o próprio perfil.',
  })
  @ApiParam({ name: 'id', format: 'uuid', description: 'ID do professor' })
  @ApiOkResponse({ type: ProfessorResponse })
  @ApiBadRequestResponse({ description: 'Dados inválidos ou ID não é um UUID válido' })
  @ApiNotFoundResponse({ description: 'Professor não encontrado' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req,
    @Body() dto: UpdateProfessorDto,
  ) {
    return this.professoresService.update(id, req.user, dto);
  }

  @Delete(':id')
  @Roles(TipoUsuario.ADMINISTRADOR)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Desativa um professor',
    description: 'Marca o professor como removido e converte o usuário para o tipo COMUM. Apenas ADMINISTRADOR.',
  })
  @ApiParam({ name: 'id', format: 'uuid', description: 'ID do professor' })
  @ApiNoContentResponse({ description: 'Professor desativado' })
  @ApiBadRequestResponse({ description: 'ID não é um UUID válido' })
  @ApiNotFoundResponse({ description: 'Professor não encontrado' })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req,
  ) {
    await this.professoresService.remove(id, req.user);
  }
}
