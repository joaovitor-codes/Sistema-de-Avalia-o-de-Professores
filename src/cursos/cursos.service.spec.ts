/// <reference types="jest" />

import { NotFoundException } from '@nestjs/common';
import { GrauAcademico } from '@prisma/client';
import { CursosService } from './cursos.service';

describe('CursosService', () => {
  const prismaService = {
    instituicao: {
      findFirst: jest.fn(),
    },
    curso: {
      create: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  let service: CursosService;

  beforeEach(() => {
    service = new CursosService(prismaService as never);
    jest.clearAllMocks();
  });

  it('deve criar um curso quando a instituição existir', async () => {
    const dto = {
      instituicaoId: '11111111-1111-1111-1111-111111111111',
      nome: 'Ciência da Computação',
      grau: GrauAcademico.BACHARELADO,
    };

    prismaService.instituicao.findFirst.mockResolvedValue({ id: dto.instituicaoId });
    prismaService.curso.create.mockResolvedValue({ id: 'curso-1', ...dto });

    await expect(service.create(dto as never)).resolves.toEqual({ id: 'curso-1', ...dto });
    expect(prismaService.instituicao.findFirst).toHaveBeenCalledWith({
      where: { id: dto.instituicaoId, deletedAt: null },
    });
    expect(prismaService.curso.create).toHaveBeenCalledWith({
      data: dto,
    });
  });

  it('deve lançar erro ao criar curso sem instituição', async () => {
    prismaService.instituicao.findFirst.mockResolvedValue(null);

    await expect(
      service.create({
        instituicaoId: '11111111-1111-1111-1111-111111111111',
        nome: 'Ciência da Computação',
        grau: GrauAcademico.BACHARELADO,
      } as never),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('deve buscar um curso por id', async () => {
    prismaService.curso.findFirst.mockResolvedValue({ id: 'curso-1' });

    await expect(service.findOne('curso-1')).resolves.toEqual({ id: 'curso-1' });
    expect(prismaService.curso.findFirst).toHaveBeenCalledWith({
      where: { id: 'curso-1', deletedAt: null },
    });
  });

  it('deve listar cursos com paginação e filtros', async () => {
    prismaService.$transaction.mockResolvedValue([[{ id: 'curso-1' }], 1]);

    await expect(
      service.findAll({
        page: 1,
        limit: 20,
        nome: 'computação',
        grau: GrauAcademico.BACHARELADO,
        instituicaoId: '11111111-1111-1111-1111-111111111111',
      } as never),
    ).resolves.toEqual({ cursos: [{ id: 'curso-1' }], total: 1 });

    expect(prismaService.$transaction).toHaveBeenCalledTimes(1);
    expect(prismaService.curso.findMany).toHaveBeenCalledWith({
      where: {
        deletedAt: null,
        instituicaoId: '11111111-1111-1111-1111-111111111111',
        grau: GrauAcademico.BACHARELADO,
        nome: { contains: 'computação', mode: 'insensitive' },
      },
      orderBy: { nome: 'asc' },
      skip: 0,
      take: 20,
    });
    expect(prismaService.curso.count).toHaveBeenCalledWith({
      where: {
        deletedAt: null,
        instituicaoId: '11111111-1111-1111-1111-111111111111',
        grau: GrauAcademico.BACHARELADO,
        nome: { contains: 'computação', mode: 'insensitive' },
      },
    });
  });

  it('deve atualizar um curso existente', async () => {
    prismaService.curso.findFirst.mockResolvedValue({ id: 'curso-1' });
    prismaService.curso.update.mockResolvedValue({ id: 'curso-1', nome: 'Novo nome' });

    await expect(service.update('curso-1', { nome: 'Novo nome' } as never)).resolves.toEqual({
      id: 'curso-1',
      nome: 'Novo nome',
    });
    expect(prismaService.curso.update).toHaveBeenCalledWith({
      where: { id: 'curso-1' },
      data: { nome: 'Novo nome', grau: undefined },
    });
  });

  it('deve remover um curso com soft delete', async () => {
    prismaService.curso.findFirst.mockResolvedValue({ id: 'curso-1' });
    prismaService.curso.update.mockResolvedValue({ id: 'curso-1' });

    await expect(service.remove('curso-1')).resolves.toBeUndefined();
    expect(prismaService.curso.update).toHaveBeenCalledWith({
      where: { id: 'curso-1' },
      data: { deletedAt: expect.any(Date) },
    });
  });
});