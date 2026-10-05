import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, Professor, TipoUsuario, Usuario } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProfessorDisciplinaDto } from './dto/professor-disciplinas';

@Injectable()
export class ProfessorDisciplinasService {
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

    async create(professorId: string, usuarioLogado: Usuario, data: CreateProfessorDisciplinaDto){
        const professor = await this.buscarProfessor(professorId);
        this.checarPermissao(professor, usuarioLogado);

        const disciplina = await this.prismaService.disciplina.findFirst({
            where: { id: data.disciplinaId, deletedAt: null }
        })

        if(!disciplina){
            throw new NotFoundException('Disciplina não encontrada')
        }

        // Só pode lecionar disciplinas de uma instituição onde já atua.
        const atuaNaInstituicao = await this.prismaService.professorInstituicao.findUnique({
            where: {
                professorId_instituicaoId: {
                    professorId,
                    instituicaoId: disciplina.instituicaoId
                }
            }
        })

        if(!atuaNaInstituicao){
            throw new BadRequestException('O professor não atua na instituição dessa disciplina')
        }

        try{
            return await this.prismaService.professorDisciplina.create({
                data: { professorId, disciplinaId: disciplina.id },
                include: { disciplina: true }
            })
        }catch(error){
            if(error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002'){
                throw new ConflictException('O professor já leciona essa disciplina')
            }

            throw error
        }
    }

    async findAll(professorId: string){
        await this.buscarProfessor(professorId);

        return this.prismaService.professorDisciplina.findMany({
            where: {
                professorId,
                disciplina: { deletedAt: null }
            },
            include: { disciplina: true },
            orderBy: { disciplina: { nome: 'asc' } }
        })
    }

    async remove(professorId: string, disciplinaId: string, usuarioLogado: Usuario){
        const professor = await this.buscarProfessor(professorId);
        this.checarPermissao(professor, usuarioLogado);

        const vinculo = await this.prismaService.professorDisciplina.findUnique({
            where: { professorId_disciplinaId: { professorId, disciplinaId } }
        })

        if(!vinculo){
            throw new NotFoundException('O professor não leciona essa disciplina')
        }

        await this.prismaService.professorDisciplina.delete({
            where: { id: vinculo.id }
        })
    }
}
