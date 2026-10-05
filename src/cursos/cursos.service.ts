import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCursoDto, ListCursosQueryDto, UpdateCursoDto } from './dto/cursos';

@Injectable()
export class CursosService {
    constructor(
        private readonly prismaService: PrismaService,
    ){}

    async create(dto: CreateCursoDto){
        const instituicao = await this.prismaService.instituicao.findFirst({
            where: { id: dto.instituicaoId, deletedAt: null }
        })

        if(!instituicao){
            throw new NotFoundException('Instituição não encontrada')
        }

        return this.prismaService.curso.create({
            data: {
                instituicaoId: dto.instituicaoId,
                nome: dto.nome,
                grau: dto.grau,
            }
        })
    }

    async findOne(id: string){
        const curso = await this.prismaService.curso.findFirst({
            where: { id, deletedAt: null }
        })

        if(!curso){
            throw new NotFoundException('Curso não encontrado')
        }

        return curso;
    }

    async findAll(query: ListCursosQueryDto){
        const { page, limit, nome, grau, instituicaoId } = query;

        const where: Prisma.CursoWhereInput = {
            deletedAt: null,
            instituicaoId,
            grau,
            nome: nome ? { contains: nome, mode: 'insensitive' } : undefined
        }

        const [cursos, total] = await this.prismaService.$transaction([
            this.prismaService.curso.findMany({
                where,
                orderBy: { nome: 'asc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            this.prismaService.curso.count({ where })
        ]);

        return {
            cursos,
            total
        };
    }

    async update(id: string, dto: UpdateCursoDto){
        await this.findOne(id);

        return this.prismaService.curso.update({
            where: { id },
            data: {
                nome: dto.nome,
                grau: dto.grau,
            }
        })
    }

    async remove(id: string){
        await this.findOne(id);

        await this.prismaService.curso.update({
            where: { id },
            data: { deletedAt: new Date() }
        })
    }
}
