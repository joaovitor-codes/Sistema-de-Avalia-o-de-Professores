import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { CursosModule } from '../src/cursos/cursos.module';
import { AuthGuard } from '../src/auth/auth.guard';
import { RolesGuard } from '../src/auth/roles.guard';
import { CursosService } from '../src/cursos/cursos.service';
import { CursosDisciplinaService } from '../src/cursos/cursos-disciplina/cursos-disciplina.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { ValidationPipe } from '../src/common/pipes/validation.pipe';

jest.mock('../src/auth/auth.guard', () => ({
  AuthGuard: class AuthGuard {},
}));

jest.mock('../src/auth/roles.guard', () => ({
  RolesGuard: class RolesGuard {},
}));

jest.mock('../src/auth/roles.decorator', () => ({
  Roles: () => () => undefined,
}));

describe('Application (e2e)', () => {
  let app: INestApplication;

  const prismaMock = {
    $connect: jest.fn(),
    $disconnect: jest.fn(),
  };

  const cursosServiceMock = {
    findAll: jest.fn(),
    findOne: jest.fn(),
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [CursosModule],
    })
      .overrideProvider(PrismaService)
      .useValue(prismaMock)
      .overrideProvider(CursosService)
      .useValue(cursosServiceMock)
      .overrideProvider(CursosDisciplinaService)
      .useValue({})
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should list cursos through the HTTP layer', async () => {
    cursosServiceMock.findAll.mockResolvedValue({
      cursos: [{ id: 'curso-1' }],
      total: 1,
    });
    const httpServer = app.getHttpServer() as unknown as import('http').Server;

    await request(httpServer)
      .get('/api/cursos?page=1&limit=20')
      .expect(200)
      .expect(({ body }) => {
        expect(body).toEqual({ cursos: [{ id: 'curso-1' }], total: 1 });
      });

    expect(cursosServiceMock.findAll).toHaveBeenCalledWith({
      page: 1,
      limit: 20,
    });
  });

  it('should fetch a curso by id through the HTTP layer', async () => {
    cursosServiceMock.findOne.mockResolvedValue({
      id: '11111111-1111-1111-1111-111111111111',
    });
    const httpServer = app.getHttpServer() as unknown as import('http').Server;

    await request(httpServer)
      .get('/api/cursos/11111111-1111-1111-1111-111111111111')
      .expect(200)
      .expect(({ body }) => {
        expect(body).toEqual({ id: '11111111-1111-1111-1111-111111111111' });
      });

    expect(cursosServiceMock.findOne).toHaveBeenCalledWith(
      '11111111-1111-1111-1111-111111111111',
    );
  });
});
