import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateInstituicaoDto,
  ListInstituicoesQueryDto,
  UpdateInstituicaoDto,
} from './dto/instituicoes';

@Injectable()
export class InstituicoesService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(data: CreateInstituicaoDto) {
    return this.prismaService.instituicao.create({
      data: {
        ...data,
        estado: data.estado?.toUpperCase(),
      },
    });
  }

  async findAll(query: ListInstituicoesQueryDto) {
    const { page, limit, nome } = query;

    const where: Prisma.InstituicaoWhereInput = {
      deletedAt: null,
      nome: nome ? { contains: nome, mode: 'insensitive' } : undefined,
    };

    const [instituicoes, total] = await this.prismaService.$transaction([
      this.prismaService.instituicao.findMany({
        where,
        orderBy: { nome: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prismaService.instituicao.count({ where }),
    ]);

    return {
      instituicoes,
      total,
    };
  }

  async findOne(id: string) {
    const instituicao = await this.prismaService.instituicao.findFirst({
      where: { id, deletedAt: null },
    });

    if (!instituicao) {
      throw new NotFoundException('Instituição não encontrada');
    }

    return instituicao;
  }

  async update(id: string, data: UpdateInstituicaoDto) {
    await this.findOne(id);

    return this.prismaService.instituicao.update({
      where: { id },
      data: {
        ...data,
        estado: data.estado?.toUpperCase(),
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    // Ta ai oq tu pediu Vitor, tmj
    const agora = new Date();

    await this.prismaService.$transaction([
      this.prismaService.curso.updateMany({
        where: { instituicaoId: id, deletedAt: null },
        data: { deletedAt: agora },
      }),
      this.prismaService.disciplina.updateMany({
        where: { instituicaoId: id, deletedAt: null },
        data: { deletedAt: agora },
      }),
      this.prismaService.instituicao.update({
        where: { id },
        data: { deletedAt: agora },
      }),
    ]);
  }
}
