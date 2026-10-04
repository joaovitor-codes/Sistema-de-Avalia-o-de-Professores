import { NotFoundException } from '@nestjs/common';
import { CursosDisciplinaService } from './cursos-disciplina.service';

describe('CursosDisciplinaService', () => {
  const prismaService = {
    cursoDisciplina: {
      findMany: jest.fn(),
      create: jest.fn(),
      findFirst: jest.fn(),
      delete: jest.fn(),
      update: jest.fn(),
    },
    disciplina: {
      findUnique: jest.fn(),
    },
    curso: {
      findUnique: jest.fn(),
    },
  };

  let service: CursosDisciplinaService;

  beforeEach(() => {
    service = new CursosDisciplinaService(prismaService as never);
    jest.clearAllMocks();
  });

  it('deve listar disciplinas de um curso', async () => {
    prismaService.cursoDisciplina.findMany.mockResolvedValue([{ id: 'vinculo-1' }]);

    await expect(service.findAllByCursoId('curso-1')).resolves.toEqual([{ id: 'vinculo-1' }]);
    expect(prismaService.cursoDisciplina.findMany).toHaveBeenCalledWith({
      where: { cursoId: 'curso-1' },
      include: { curso: true, disciplina: true },
    });
  });

  it('deve lançar erro quando não houver disciplinas no curso', async () => {
    prismaService.cursoDisciplina.findMany.mockResolvedValue([]);

    await expect(service.findAllByCursoId('curso-1')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('deve vincular disciplina a curso quando ambos existirem', async () => {
    prismaService.disciplina.findUnique.mockResolvedValue({ id: 'disc-1' });
    prismaService.curso.findUnique.mockResolvedValue({ id: 'curso-1' });
    prismaService.cursoDisciplina.create.mockResolvedValue({ id: 'vinculo-1' });

    await expect(service.vincularCursoDisciplina('curso-1', 'disc-1')).resolves.toEqual({ id: 'vinculo-1' });
    expect(prismaService.cursoDisciplina.create).toHaveBeenCalledWith({
      data: { cursoId: 'curso-1', disciplinaId: 'disc-1' },
    });
  });

  it('deve remover vínculo existente', async () => {
    prismaService.cursoDisciplina.findFirst.mockResolvedValue({ id: 'vinculo-1' });
    prismaService.cursoDisciplina.delete.mockResolvedValue({});

    await expect(service.desvincularCursoDisciplina('curso-1', 'disc-1')).resolves.toBeUndefined();
    expect(prismaService.cursoDisciplina.delete).toHaveBeenCalledWith({
      where: { id: 'vinculo-1' },
    });
  });

  it('deve atualizar o vínculo de disciplina', async () => {
    prismaService.cursoDisciplina.findFirst.mockResolvedValue({ id: 'vinculo-1' });
    prismaService.disciplina.findUnique.mockResolvedValue({ id: 'disc-2' });
    prismaService.cursoDisciplina.update.mockResolvedValue({ id: 'vinculo-1', disciplinaId: 'disc-2' });

    await expect(service.updateCursoDisciplina('curso-1', 'disc-1', 'disc-2')).resolves.toEqual({
      id: 'vinculo-1',
      disciplinaId: 'disc-2',
    });
    expect(prismaService.cursoDisciplina.update).toHaveBeenCalledWith({
      where: { id: 'vinculo-1' },
      data: { disciplinaId: 'disc-2' },
    });
  });
});