import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAvaliacaoDto } from './dto/avaliacao';

@Injectable()
export class AvaliacaoService {
    constructor(
        private readonly prismaService: PrismaService
    ) {}

    async avaliarProfessor(alunoId: string, data: CreateAvaliacaoDto) {
        const professor = await this.prismaService.professor.findFirst({
            where: { id: data.professorId, deletedAt: null }
        });

        if (!professor) {
            throw new NotFoundException('Professor não encontrado');
        }

        const disciplina = await this.prismaService.disciplina.findFirst({
            where: { id: data.disciplinaId, deletedAt: null }
        });

        if (!disciplina) {
            throw new NotFoundException('Disciplina não encontrada');
        }

        const leciona = await this.prismaService.professorDisciplina.findUnique({
            where: {
                professorId_disciplinaId: {
                    professorId: professor.id,
                    disciplinaId: disciplina.id
                }
            }
        });

        if (!leciona) {
            throw new BadRequestException('O professor não leciona essa disciplina');
        }

        const criteriosAtivos = await this.prismaService.criterioAvaliacao.findMany({
            where: { ativo: true },
            orderBy: { ordem: 'asc' }
        });

        const idsAtivos = new Set(criteriosAtivos.map(c => c.id));
        const idsInformados = new Set(data.notas.map(n => n.criterioId));

        if (data.notas.some(n => !idsAtivos.has(n.criterioId))) {
            throw new BadRequestException('Critério de avaliação inválido ou inativo');
        }

        const faltando = criteriosAtivos.filter(c => !idsInformados.has(c.id));
        
        if (faltando.length > 0) {
            throw new BadRequestException(
                `Faltam notas para os critérios: ${faltando.map(c => c.nome).join(', ')}`
            );
        }

        try {
            return await this.prismaService.avaliacao.create({
                data: {
                    alunoId,
                    professorId: professor.id,
                    disciplinaId: disciplina.id,
                    anonima: data.anonima ?? false,
                    comentario: data.comentario,
                    recomendaria: data.recomendaria,
                    notas: {
                        create: data.notas.map(nota => ({
                            criterioId: nota.criterioId,
                            nota: nota.nota
                        }))
                    }
                },
                include: {
                    notas: {
                        include: { criterio: { select: { id: true, nome: true, ordem: true } } },
                        orderBy: { criterio: { ordem: 'asc' } }
                    }
                }
            });
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
                throw new ConflictException('Você já avaliou esse professor nessa disciplina');
            }

            throw error;
        }
    }

    async getAvaliacoesByProfessor(professorId: string) {
        const professor = await this.prismaService.professor.findUnique({
            where: {
                id: professorId
            }
        });

        if (!professor) {
            throw new NotFoundException('Professor não encontrado');
        }

        return await this.prismaService.avaliacao.findMany({
            where: {
                professorId
            },
            include: {
                notas: true
            }
        });
    }

    async getAvaliacoesByAluno(alunoId: string) {
        return await this.prismaService.avaliacao.findMany({
            where: {
                alunoId
            },
            include: {
                notas: true
            }
        });
    }

    async getAvaliacaoById(avaliacaoId: string) {
        const avaliacao = await this.prismaService.avaliacao.findUnique({
            where: {
                id: avaliacaoId
            },
            include: {
                notas: true
            }
        });

        if (!avaliacao) {
            throw new NotFoundException('Avaliação não encontrada');
        }

        return avaliacao;
    }

    async getAvaliacoesByDisciplina(disciplinaId: string) {
        const disciplina = await this.prismaService.disciplina.findUnique({
            where: {
                id: disciplinaId
            }
        });

        if (!disciplina) {
            throw new NotFoundException('Disciplina não encontrada');
        }

        return await this.prismaService.avaliacao.findMany({
            where: {
                disciplinaId
            },
            include: {
                notas: true
            }
        });
    }

    async getMediaAvaliacoesByProfessor(professorId: string) {
        const professor = await this.prismaService.professor.findUnique({
            where: {
                id: professorId
            }
        });

        if (!professor) {
            throw new NotFoundException('Professor não encontrado');
        }

        const avaliacoes = await this.prismaService.avaliacao.findMany({
            where: {
                professorId
            },
            include: {
                notas: true
            }
        });

        if (avaliacoes.length === 0) {
            return null;
        }

        const mediaNotas = avaliacoes.reduce((acc, avaliacao) => {
            const somaNotas = avaliacao.notas.reduce((soma, nota) => soma + nota.nota, 0);
            return acc + (somaNotas / avaliacao.notas.length);
        }, 0) / avaliacoes.length;

        return mediaNotas;
    }

    async deleteAvaliacao(avaliacaoId: string) {
        const avaliacao = await this.prismaService.avaliacao.findUnique({
            where: {
                id: avaliacaoId
            }
        });

        if (!avaliacao) {
            throw new NotFoundException('Avaliação não encontrada');
        }

        return await this.prismaService.avaliacao.delete({
            where: {
                id: avaliacaoId
            }
        });
    }

    async updateAvaliacao(avaliacaoId: string, data: Partial<CreateAvaliacaoDto>) {
        const avaliacao = await this.prismaService.avaliacao.findUnique({
            where: {
                id: avaliacaoId
            }
        });

        if (!avaliacao) {
            throw new NotFoundException('Avaliação não encontrada');
        }

        return await this.prismaService.avaliacao.update({
            where: {
                id: avaliacaoId
            },
            data: {
                anonima: data.anonima,
                comentario: data.comentario,
                recomendaria: data.recomendaria,
                notas: data.notas ? {
                    deleteMany: {},
                    create: data.notas.map(nota => ({
                        criterioId: nota.criterioId,
                        nota: nota.nota
                    }))
                } : undefined
            },
            include: {
                notas: true
            }
        });
    }

    async getAllCriterios() {
        return await this.prismaService.criterioAvaliacao.findMany();
    }

    async getCriterioById(criterioId: string) {
        const criterio = await this.prismaService.criterioAvaliacao.findUnique({
            where: {
                id: criterioId
            }
        });

        if (!criterio) {
            throw new NotFoundException('Critério não encontrado');
        }

        return criterio;
    }

    async createCriterio(data: { nome: string, descricao?: string }) {
        return await this.prismaService.criterioAvaliacao.create({
            data: {
                nome: data.nome,
                descricao: data.descricao
            }
        });
    }

    async updateCriterio(criterioId: string, data: { nome?: string, descricao?: string }) {
        const criterio = await this.prismaService.criterioAvaliacao.findUnique({
            where: {
                id: criterioId
            }
        });

        if (!criterio) {
            throw new NotFoundException('Critério não encontrado');
        }

        return await this.prismaService.criterioAvaliacao.update({
            where: {
                id: criterioId
            },
            data: {
                nome: data.nome,
                descricao: data.descricao
            }
        });
    }

    async deleteCriterio(criterioId: string) {
        const criterio = await this.prismaService.criterioAvaliacao.findUnique({
            where: {
                id: criterioId
            }
        });

        if (!criterio) {
            throw new NotFoundException('Critério não encontrado');
        }

        return await this.prismaService.criterioAvaliacao.delete({
            where: {
                id: criterioId
            }
        });
    }
}
