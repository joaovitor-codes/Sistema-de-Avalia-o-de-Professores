import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { CacheModule } from './cache/cache.module';
import { ProfessoresModule } from './professores/professores.module';
import { InstituicoesModule } from './instituicoes/instituicoes.module';
import { CursosModule } from './cursos/cursos.module';
import { DisciplinasModule } from './disciplinas/disciplinas.module';

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
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
