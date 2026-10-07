import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma, Usuario } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAvaliacaoDto, ListAvaliacoesProfessorQueryDto, UpdateAvaliacaoDto } from './dto/avaliacao';

const JANELA_PADRAO_HORAS = 24;

const INCLUIR_NOTAS = {
    notas: {
        include: { criterio: { select: { id: true, nome: true, ordem: true } } },
        orderBy: { criterio: { ordem: 'asc' } }
    }
} satisfies Prisma.AvaliacaoInclude;

@Injectable()
export class AvaliacaoService {
    constructor(
        private readonly prismaService: PrismaService,
        private readonly configService: ConfigService
    ) {}

    // quantas horas o aluno tem pra editar/apagar a avaliacao depois de criar (env AVALIACAO_JANELA_EDICAO_HORAS)
    private janelaEdicaoHoras() {
        const horas = Number(this.configService.get('AVALIACAO_JANELA_EDICAO_HORAS'));
        return horas > 0 ? horas : JANELA_PADRAO_HORAS;
    }

    private async validarNotas(notas: { criterioId: string, nota: number }[]) {
        const criteriosAtivos = await this.prismaService.criterioAvaliacao.findMany({
            where: { ativo: true },
            orderBy: { ordem: 'asc' }
        });

        const idsAtivos = new Set(criteriosAtivos.map(c => c.id));
        const idsInformados = new Set(notas.map(n => n.criterioId));

        if (notas.some(n => !idsAtivos.has(n.criterioId))) {
            throw new BadRequestException('Critério de avaliação inválido ou inativo');
        }

        const faltando = criteriosAtivos.filter(c => !idsInformados.has(c.id));

        if (faltando.length > 0) {
            throw new BadRequestException(
                `Faltam notas para os critérios: ${faltando.map(c => c.nome).join(', ')}`
            );
        }
    }

    private async buscarAvaliacaoEditavel(avaliacaoId: string, alunoId: string) {
        const avaliacao = await this.prismaService.avaliacao.findFirst({
            where: { id: avaliacaoId, deletedAt: null }
        });

        if (!avaliacao) {
            throw new NotFoundException('Avaliação não encontrada');
        }

        if (avaliacao.alunoId !== alunoId) {
            throw new ForbiddenException('Você só pode alterar as suas próprias avaliações');
        }

        const horas = this.janelaEdicaoHoras();
        const limite = avaliacao.createdAt.getTime() + horas * 60 * 60 * 1000;

        if (Date.now() > limite) {
            throw new ForbiddenException(`O prazo de ${horas}h para alterar essa avaliação já passou`);
        }

        return avaliacao;
    }

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

        await this.validarNotas(data.notas);

        const existente = await this.prismaService.avaliacao.findUnique({
            where: {
                alunoId_professorId_disciplinaId: {
                    alunoId,
                    professorId: professor.id,
                    disciplinaId: disciplina.id
                }
            }
        });

        if (existente && !existente.deletedAt) {
            throw new ConflictException('Você já avaliou esse professor nessa disciplina');
        }

        const notas = data.notas.map(nota => ({
            criterioId: nota.criterioId,
            nota: nota.nota
        }));

        try {
            // se o aluno apagou a avaliacao antes, a linha continua no banco (soft delete) e a
            // constraint unica nao deixa criar outra, entao a gente reaproveita ela
            if (existente) {
                return await this.prismaService.$transaction(async (tx) => {
                    await tx.notaCriterio.deleteMany({ where: { avaliacaoId: existente.id } });

                    return tx.avaliacao.update({
                        where: { id: existente.id },
                        data: {
                            anonima: data.anonima ?? false,
                            comentario: data.comentario ?? null,
                            recomendaria: data.recomendaria ?? null,
                            deletedAt: null,
                            createdAt: new Date(),
                            notas: { create: notas }
                        },
                        include: INCLUIR_NOTAS
                    });
                });
            }

            return await this.prismaService.avaliacao.create({
                data: {
                    alunoId,
                    professorId: professor.id,
                    disciplinaId: disciplina.id,
                    anonima: data.anonima ?? false,
                    comentario: data.comentario,
                    recomendaria: data.recomendaria,
                    notas: { create: notas }
                },
                include: INCLUIR_NOTAS
            });
        } catch (error) {
            // duas requisicoes ao mesmo tempo passam pela checagem de cima, o banco barra a segunda
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
                throw new ConflictException('Você já avaliou esse professor nessa disciplina');
            }

            throw error;
        }
    }

    /*
        lista as avaliacoes do professor, quem avaliou como anonima nao aparece (nem o id do aluno vai na resposta)
    */
    async getAvaliacoesByProfessor(professorId: string, query: ListAvaliacoesProfessorQueryDto, usuarioLogado: Usuario) {
        const { page, limit, disciplinaId } = query;

        const professor = await this.prismaService.professor.findFirst({
            where: { id: professorId, deletedAt: null }
        });

        if (!professor) {
            throw new NotFoundException('Professor não encontrado');
        }

        const where: Prisma.AvaliacaoWhereInput = {
            professorId,
            deletedAt: null,
            disciplinaId
        };

        const [lista, total] = await this.prismaService.$transaction([
            this.prismaService.avaliacao.findMany({
                where,
                orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
                skip: (page - 1) * limit,
                take: limit,
                select: {
                    id: true,
                    alunoId: true,
                    anonima: true,
                    comentario: true,
                    recomendaria: true,
                    createdAt: true,
                    updatedAt: true,
                    aluno: { select: { id: true, nome: true } },
                    disciplina: { select: { id: true, nome: true, codigo: true } },
                    notas: {
                        select: { nota: true, criterio: { select: { id: true, nome: true } } },
                        orderBy: { criterio: { ordem: 'asc' } }
                    }
                }
            }),
            this.prismaService.avaliacao.count({ where })
        ]);

        const avaliacoes = lista.map(({ alunoId, aluno, ...resto }) => ({
            ...resto,
            aluno: resto.anonima ? null : aluno,
            propria: alunoId === usuarioLogado.id
        }));

        return {
            avaliacoes,
            total
        };
    }

    async getAvaliacoesByAluno(alunoId: string) {
        return await this.prismaService.avaliacao.findMany({
            where: {
                alunoId,
                deletedAt: null
            },
            include: {
                notas: true
            }
        });
    }

    async getAvaliacaoById(avaliacaoId: string) {
        const avaliacao = await this.prismaService.avaliacao.findFirst({
            where: {
                id: avaliacaoId,
                deletedAt: null
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
                disciplinaId,
                deletedAt: null
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

        const media = await this.prismaService.notaCriterio.aggregate({
            where: { avaliacao: { professorId, deletedAt: null } },
            _avg: { nota: true }
        });

        return media._avg.nota;
    }

    async deleteAvaliacao(avaliacaoId: string, alunoId: string) {
        await this.buscarAvaliacaoEditavel(avaliacaoId, alunoId);

        // Ta ai oq tu pediu Vitor, tmj
        await this.prismaService.avaliacao.update({
            where: { id: avaliacaoId },
            data: { deletedAt: new Date() }
        });
    }

    async updateAvaliacao(avaliacaoId: string, alunoId: string, data: UpdateAvaliacaoDto) {
        await this.buscarAvaliacaoEditavel(avaliacaoId, alunoId);

        if (data.notas) {
            await this.validarNotas(data.notas);
        }

        return await this.prismaService.$transaction(async (tx) => {
            if (data.notas) {
                await tx.notaCriterio.deleteMany({ where: { avaliacaoId } });
            }

            return tx.avaliacao.update({
                where: { id: avaliacaoId },
                data: {
                    anonima: data.anonima,
                    comentario: data.comentario,
                    recomendaria: data.recomendaria,
                    notas: data.notas ? {
                        create: data.notas.map(nota => ({
                            criterioId: nota.criterioId,
                            nota: nota.nota
                        }))
                    } : undefined
                },
                include: INCLUIR_NOTAS
            });
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
