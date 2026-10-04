import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateDisciplinaDto,
  ListDisciplinasQueryDto,
  UpdateDisciplinaDto,
} from './dto/disciplinas';

@Injectable()
export class DisciplinasService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(data: CreateDisciplinaDto) {
    const instituicao = await this.prismaService.instituicao.findFirst({
      where: { id: data.instituicaoId, deletedAt: null },
    });

    if (!instituicao) {
      throw new NotFoundException('Instituição não encontrada');
    }

    return this.prismaService.disciplina.create({ data });
  }

  async findAll(query: ListDisciplinasQueryDto) {
    const { page, limit, nome, instituicaoId } = query;

    const where: Prisma.DisciplinaWhereInput = {
      deletedAt: null,
      instituicaoId,
      nome: nome ? { contains: nome, mode: 'insensitive' } : undefined,
    };

    const [disciplinas, total] = await this.prismaService.$transaction([
      this.prismaService.disciplina.findMany({
        where,
        orderBy: { nome: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prismaService.disciplina.count({ where }),
    ]);

    return {
      disciplinas,
      total,
    };
  }

  async findOne(id: string) {
    const disciplina = await this.prismaService.disciplina.findFirst({
      where: { id, deletedAt: null },
    });

    if (!disciplina) {
      throw new NotFoundException('Disciplina não encontrada');
    }

    return disciplina;
  }

  async update(id: string, data: UpdateDisciplinaDto) {
    await this.findOne(id);

    return this.prismaService.disciplina.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    // Ta ai oq tu pediu Vitor, tmj
    await this.prismaService.disciplina.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
