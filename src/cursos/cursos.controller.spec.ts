import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';

jest.mock('../auth/auth.guard', () => ({
  AuthGuard: class AuthGuard {},
}));

jest.mock('../auth/roles.guard', () => ({
  RolesGuard: class RolesGuard {},
}));

jest.mock('../auth/roles.decorator', () => ({
  Roles: () => () => undefined,
}));

import { CursosController } from './cursos.controller';
import { CursosService } from './cursos.service';

describe('CursosController', () => {
  let controller: CursosController;
  const cursosService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [CursosController],
      providers: [
        { provide: CursosService, useValue: cursosService },
      ],
    }).compile();

    controller = moduleRef.get(CursosController);
    jest.clearAllMocks();
  });

  it('deve encaminhar a criação de curso para o service', async () => {
    const dto = {
      instituicaoId: '11111111-1111-1111-1111-111111111111',
      nome: 'Ciência da Computação',
      grau: 'BACHARELADO',
    };

    cursosService.create.mockResolvedValue({ id: 'curso-1', ...dto });

    await expect(controller.create(dto as never)).resolves.toEqual({
      id: 'curso-1',
      ...dto,
    });
    expect(cursosService.create).toHaveBeenCalledWith(dto);
  });

  it('deve listar cursos repassando a query', async () => {
    const query = { page: 2, limit: 10, nome: 'computação' };
    cursosService.findAll.mockResolvedValue({ cursos: [], total: 0 });

    await expect(controller.findAll(query as never)).resolves.toEqual({
      cursos: [],
      total: 0,
    });
    expect(cursosService.findAll).toHaveBeenCalledWith(query);
  });

  it('deve buscar um curso pelo id', async () => {
    cursosService.findOne.mockResolvedValue({ id: 'curso-1' });

    await expect(controller.findOne('curso-1')).resolves.toEqual({
      id: 'curso-1',
    });
    expect(cursosService.findOne).toHaveBeenCalledWith('curso-1');
  });

  it('deve atualizar e remover um curso', async () => {
    cursosService.update.mockResolvedValue({
      id: 'curso-1',
      nome: 'Novo nome',
    });
    cursosService.remove.mockResolvedValue(undefined);

    await expect(
      controller.update('curso-1', { nome: 'Novo nome' }),
    ).resolves.toEqual({
      id: 'curso-1',
      nome: 'Novo nome',
    });
    expect(cursosService.update).toHaveBeenCalledWith('curso-1', {
      nome: 'Novo nome',
    });

    await expect(controller.remove('curso-1')).resolves.toBeUndefined();
    expect(cursosService.remove).toHaveBeenCalledWith('curso-1');
  });

  it('deve propagar erros do service', async () => {
    cursosService.findOne.mockRejectedValue(
      new NotFoundException('Curso não encontrado'),
    );

    await expect(
      controller.findOne('curso-inexistente'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
