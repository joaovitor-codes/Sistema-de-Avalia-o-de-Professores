import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, Professor, TipoUsuario, Usuario } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProfessorInstituicaoDto, UpdateProfessorInstituicaoDto } from './dto/professor-instituicoes';

@Injectable()
export class ProfessorInstituicoesService {
    constructor(
        private readonly prismaService: PrismaService,
    ){}

    private async buscarProfessor(professorId: string){
        const professor = await this.prismaService.professor.findFirst({
            where: { id: professorId, deletedAt: null }
        })

        if(!professor){
            throw new NotFoundException('Professor não encontrado')
        }

        return professor;
    }

    private checarPermissao(professor: Professor, usuarioLogado: Usuario){
        const isAdmin = usuarioLogado.tipoUsuario === TipoUsuario.ADMINISTRADOR;
        const isDono =
            usuarioLogado.tipoUsuario === TipoUsuario.PROFESSOR &&
            usuarioLogado.id === professor.usuarioId;

        if(!isAdmin && !isDono){
            throw new ForbiddenException('Você não tem permissão para editar este professor')
        }
    }

    async create(professorId: string, usuarioLogado: Usuario, data: CreateProfessorInstituicaoDto){
        const professor = await this.buscarProfessor(professorId);
        this.checarPermissao(professor, usuarioLogado);

        const instituicao = await this.prismaService.instituicao.findFirst({
            where: { id: data.instituicaoId, deletedAt: null }
        })

        if(!instituicao){
            throw new NotFoundException('Instituição não encontrada')
        }

        try{
            return await this.prismaService.professorInstituicao.create({
                data: {
                    professorId,
                    instituicaoId: data.instituicaoId,
                    departamento: data.departamento,
                },
                include: { instituicao: true }
            })
        }catch(error){
            if(error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002'){
                throw new ConflictException('O professor já está vinculado a essa instituição')
            }

            throw error
        }
    }

    async findAll(professorId: string){
        await this.buscarProfessor(professorId);

        return this.prismaService.professorInstituicao.findMany({
            where: {
                professorId,
                instituicao: { deletedAt: null }
            },
            include: { instituicao: true },
            orderBy: { createdAt: 'asc' }
        })
    }

    async update(professorId: string, instituicaoId: string, usuarioLogado: Usuario, data: UpdateProfessorInstituicaoDto){
        const professor = await this.buscarProfessor(professorId);
        this.checarPermissao(professor, usuarioLogado);

        const vinculo = await this.prismaService.professorInstituicao.findUnique({
            where: { professorId_instituicaoId: { professorId, instituicaoId } }
        })

        if(!vinculo){
            throw new NotFoundException('Vínculo não encontrado')
        }

        return this.prismaService.professorInstituicao.update({
            where: { id: vinculo.id },
            data: { departamento: data.departamento },
            include: { instituicao: true }
        })
    }

    // Ao tirar o professor da instituição, tiramos também as disciplinas de lá.
    async remove(professorId: string, instituicaoId: string, usuarioLogado: Usuario){
        const professor = await this.buscarProfessor(professorId);
        this.checarPermissao(professor, usuarioLogado);

        const vinculo = await this.prismaService.professorInstituicao.findUnique({
            where: { professorId_instituicaoId: { professorId, instituicaoId } }
        })

        if(!vinculo){
            throw new NotFoundException('Vínculo não encontrado')
        }

        await this.prismaService.$transaction([
            this.prismaService.professorDisciplina.deleteMany({
                where: { professorId, disciplina: { instituicaoId } }
            }),
            this.prismaService.professorInstituicao.delete({
                where: { id: vinculo.id }
            })
        ])
    }
}
