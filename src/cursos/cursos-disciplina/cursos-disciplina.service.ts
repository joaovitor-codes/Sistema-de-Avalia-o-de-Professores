import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CursosDisciplinaService {
    constructor(
        private readonly prismaService: PrismaService,
    ){}

    async findAllByCursoId(cursoId: string){
        const disciplinas = await this.prismaService.cursoDisciplina.findMany({
            where: { cursoId },
            include: { curso: true, disciplina: true },

        })

        if(!disciplinas || disciplinas.length === 0){
            throw new NotFoundException('Nenhuma disciplina encontrada para este curso')
        }

        return disciplinas;
    }

    async vincularCursoDisciplina(cursoId: string, disciplinaId: string){
        const disciplina = await this.prismaService.disciplina.findUnique({
            where: { id: disciplinaId, deletedAt: null }
        })

        if(!disciplina){
            throw new NotFoundException('Disciplina não encontrada')
        }

        const curso = await this.prismaService.curso.findUnique({
            where: { id: cursoId, deletedAt: null }
        })

        if(!curso){
            throw new NotFoundException('Curso não encontrado')
        }
        
        const cursoDisciplina = await this.prismaService.cursoDisciplina.create({
            data: {
                cursoId,
                disciplinaId
            }
        })

        return cursoDisciplina;
    }

    async desvincularCursoDisciplina(cursoId: string, disciplinaId: string){
        const cursoDisciplina = await this.prismaService.cursoDisciplina.findFirst({
            where: { cursoId, disciplinaId }
        })
        
        if(!cursoDisciplina){
            throw new NotFoundException('Vinculo não encontrado')
        }

        await this.prismaService.cursoDisciplina.delete({
            where: { id: cursoDisciplina.id }
        })
    }

    async findAllByDisciplinaId(disciplinaId: string){
        const cursos = await this.prismaService.cursoDisciplina.findMany({
            where: { disciplinaId },
            include: { curso: true, disciplina: true },
        })

        if(!cursos || cursos.length === 0){
            throw new NotFoundException('Nenhum curso encontrado para esta disciplina')
        }

        return cursos;
    }

}
