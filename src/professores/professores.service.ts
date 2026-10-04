import {
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, TipoUsuario, Usuario } from '@prisma/client';
import { CreateProfessorDto, UpdateProfessorDto } from './dto/professores';
import * as bcrypt from 'bcrypt';

@Injectable()
export class ProfessoresService {
  constructor(private readonly prismaService: PrismaService) {}

  /*
        administrador cria uma conta do tipo professor, retorna a conta
    */
  async create(userId: string, data: CreateProfessorDto) {
    try {
      return await this.prismaService.$transaction(async (tx) => {
        const usuario = await tx.usuario.findUnique({
          where: { id: userId },
        });

        if (usuario?.tipoUsuario !== TipoUsuario.ADMINISTRADOR) {
          throw new NotFoundException('Usuario não possui permissão');
        }

        const novaConta = await tx.usuario.create({
          data: {
            nome: data.name,
            tipoUsuario: TipoUsuario.PROFESSOR,
            conta: {
              create: {
                email: data.email,
                senhaHash: await bcrypt.hash(data.password, 10),
              },
            },
          },
          select: {
            id: true,
            nome: true,
            conta: {
              select: {
                email: true,
              },
            },
          },
        });

        await tx.professor.create({
          data: {
            usuarioId: novaConta.id,
          },
        });

        return {
          id: novaConta.id,
          email: novaConta.conta?.email,
        };
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('O email informado já está em uso.');
        }

        if (error.code === 'P2025') {
          throw new NotFoundException(
            'Registro pai não encontrado para realizar a operação.',
          );
        }
      }

      throw new InternalServerErrorException('Erro ao criar professor');
    }
  }

  async findOne(professorId: string) {
    const professor = await this.prismaService.professor.findUnique({
      where: { id: professorId },
    });

    if (!professor) {
      throw new NotFoundException('Professor não encontrado');
    }

    return professor;
  }

  /*
        desabilita o professor, retorna o usuario com o tipo comum, tirando o acesso a parte de professor
    */
  async remove(professorId: string, usuarioLogado: Usuario) {
    const professor = await this.prismaService.professor.findUnique({
      where: { id: professorId },
    });

    if (!professor || professor.deletedAt) {
      throw new NotFoundException('Professor não encontrado');
    }

    const isAdmin = usuarioLogado.tipoUsuario === TipoUsuario.ADMINISTRADOR;
    const isDono =
      usuarioLogado.tipoUsuario === TipoUsuario.PROFESSOR &&
      usuarioLogado.id === professor.usuarioId;

    if (!isAdmin && !isDono) {
      throw new ForbiddenException(
        'Você não tem permissão para editar este professor',
      );
    }

    return this.prismaService.$transaction(async (tx) => {
      const usuarioAtualizado = await tx.usuario.update({
        where: { id: professor.usuarioId },
        data: {
          tipoUsuario: TipoUsuario.COMUM,
        },
      });

      await tx.professor.update({
        where: { id: professor.id },
        data: {
          deletedAt: new Date(),
        },
      });
      return usuarioAtualizado;
    });
  }

  /*
        administrador edita qualquer professor; professor edita apenas o próprio perfil
    */
  async update(
    professorId: string,
    usuarioLogado: Usuario,
    data: UpdateProfessorDto,
  ) {
    const professor = await this.prismaService.professor.findUnique({
      where: { id: professorId },
    });

    if (!professor || professor.deletedAt) {
      throw new NotFoundException('Professor não encontrado');
    }

    const isAdmin = usuarioLogado.tipoUsuario === TipoUsuario.ADMINISTRADOR;
    const isDono =
      usuarioLogado.tipoUsuario === TipoUsuario.PROFESSOR &&
      usuarioLogado.id === professor.usuarioId;

    if (!isAdmin && !isDono) {
      throw new ForbiddenException(
        'Você não tem permissão para editar este professor',
      );
    }

    return this.prismaService.professor.update({
      where: { id: professor.id },
      data: {
        titulacao: data.titulacao,
        biografia: data.biografia,
      },
    });
  }

  async findAll(query: { page: number; limit: number; nome?: string }) {
    const { page, limit, nome } = query;

    const where: Prisma.ProfessorWhereInput = {
      deletedAt: null,
      usuario: {
        nome: nome ? { contains: nome, mode: 'insensitive' } : undefined,
      },
    };

    const [professores, total] = await this.prismaService.$transaction([
      this.prismaService.professor.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          usuario: {
            select: {
              id: true,
              nome: true,
              conta: {
                select: {
                  email: true,
                },
              },
            },
          },
        },
      }),
      this.prismaService.professor.count({ where }),
    ]);

    return {
      professores,
      total,
    };
  }
}
