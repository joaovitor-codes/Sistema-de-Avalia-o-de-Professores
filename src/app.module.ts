import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { CacheModule } from './cache/cache.module';
import { ProfessoresModule } from './professores/professores.module';
import { InstituicoesModule } from './instituicoes/instituicoes.module';
import { CursosModule } from './cursos/cursos.module';
import { DisciplinasModule } from './disciplinas/disciplinas.module';
import { ProfessorInstituicoesModule } from './professor-instituicoes/professor-instituicoes.module';
import { ProfessorDisciplinasModule } from './professor-disciplinas/professor-disciplinas.module';
import { AvaliacaoModule } from './avaliacao/avaliacao.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    PrismaModule,
    CacheModule,
    ProfessoresModule,
    InstituicoesModule,
    CursosModule,
    DisciplinasModule,
    ProfessorInstituicoesModule,
    ProfessorDisciplinasModule,
    AvaliacaoModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
