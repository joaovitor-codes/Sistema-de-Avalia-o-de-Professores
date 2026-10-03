import { Test, TestingModule } from '@nestjs/testing';
import { CursosDisciplinaService } from './cursos-disciplina.service';

describe('CursosDisciplinaService', () => {
  let service: CursosDisciplinaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CursosDisciplinaService],
    }).compile();

    service = module.get<CursosDisciplinaService>(CursosDisciplinaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
