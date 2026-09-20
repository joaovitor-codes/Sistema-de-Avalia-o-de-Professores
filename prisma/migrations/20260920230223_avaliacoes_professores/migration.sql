-- CreateEnum
CREATE TYPE "grau_academico_enum" AS ENUM ('TECNICO', 'TECNOLOGO', 'LICENCIATURA', 'BACHARELADO', 'POS_GRADUACAO', 'MESTRADO', 'DOUTORADO');

-- CreateEnum
CREATE TYPE "titulacao_enum" AS ENUM ('GRADUADO', 'ESPECIALISTA', 'MESTRE', 'DOUTOR', 'POS_DOUTOR');

-- CreateTable
CREATE TABLE "instituicoes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "nome" VARCHAR(255) NOT NULL,
    "sigla" VARCHAR(20),
    "cidade" VARCHAR(100),
    "estado" VARCHAR(2),
    "logo_url" VARCHAR(500),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "instituicoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cursos" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "instituicao_id" UUID NOT NULL,
    "nome" VARCHAR(255) NOT NULL,
    "grau" "grau_academico_enum" NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "cursos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "disciplinas" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "instituicao_id" UUID NOT NULL,
    "nome" VARCHAR(255) NOT NULL,
    "codigo" VARCHAR(30),
    "carga_horaria" INTEGER,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "disciplinas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "curso_disciplinas" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "curso_id" UUID NOT NULL,
    "disciplina_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "curso_disciplinas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "professores" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "usuario_id" UUID NOT NULL,
    "titulacao" "titulacao_enum",
    "biografia" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "professores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "professor_instituicoes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "professor_id" UUID NOT NULL,
    "instituicao_id" UUID NOT NULL,
    "departamento" VARCHAR(150),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "professor_instituicoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "professor_disciplinas" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "professor_id" UUID NOT NULL,
    "disciplina_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "professor_disciplinas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "criterios_avaliacao" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "nome" VARCHAR(100) NOT NULL,
    "descricao" VARCHAR(255),
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "criterios_avaliacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "avaliacoes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "aluno_id" UUID NOT NULL,
    "professor_id" UUID NOT NULL,
    "disciplina_id" UUID NOT NULL,
    "anonima" BOOLEAN NOT NULL DEFAULT false,
    "comentario" TEXT,
    "recomendaria" BOOLEAN,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "avaliacoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notas_criterio" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "avaliacao_id" UUID NOT NULL,
    "criterio_id" UUID NOT NULL,
    "nota" SMALLINT NOT NULL,

    CONSTRAINT "notas_criterio_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "cursos_instituicao_id_idx" ON "cursos"("instituicao_id");

-- CreateIndex
CREATE INDEX "disciplinas_instituicao_id_idx" ON "disciplinas"("instituicao_id");

-- CreateIndex
CREATE INDEX "curso_disciplinas_disciplina_id_idx" ON "curso_disciplinas"("disciplina_id");

-- CreateIndex
CREATE UNIQUE INDEX "curso_disciplinas_curso_id_disciplina_id_key" ON "curso_disciplinas"("curso_id", "disciplina_id");

-- CreateIndex
CREATE UNIQUE INDEX "professores_usuario_id_key" ON "professores"("usuario_id");

-- CreateIndex
CREATE INDEX "professor_instituicoes_instituicao_id_idx" ON "professor_instituicoes"("instituicao_id");

-- CreateIndex
CREATE UNIQUE INDEX "professor_instituicoes_professor_id_instituicao_id_key" ON "professor_instituicoes"("professor_id", "instituicao_id");

-- CreateIndex
CREATE INDEX "professor_disciplinas_disciplina_id_idx" ON "professor_disciplinas"("disciplina_id");

-- CreateIndex
CREATE UNIQUE INDEX "professor_disciplinas_professor_id_disciplina_id_key" ON "professor_disciplinas"("professor_id", "disciplina_id");

-- CreateIndex
CREATE UNIQUE INDEX "criterios_avaliacao_nome_key" ON "criterios_avaliacao"("nome");

-- CreateIndex
CREATE INDEX "avaliacoes_professor_id_idx" ON "avaliacoes"("professor_id");

-- CreateIndex
CREATE INDEX "avaliacoes_disciplina_id_idx" ON "avaliacoes"("disciplina_id");

-- CreateIndex
CREATE UNIQUE INDEX "avaliacoes_aluno_id_professor_id_disciplina_id_key" ON "avaliacoes"("aluno_id", "professor_id", "disciplina_id");

-- CreateIndex
CREATE INDEX "notas_criterio_criterio_id_idx" ON "notas_criterio"("criterio_id");

-- CreateIndex
CREATE UNIQUE INDEX "notas_criterio_avaliacao_id_criterio_id_key" ON "notas_criterio"("avaliacao_id", "criterio_id");

-- AddForeignKey
ALTER TABLE "cursos" ADD CONSTRAINT "cursos_instituicao_id_fkey" FOREIGN KEY ("instituicao_id") REFERENCES "instituicoes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disciplinas" ADD CONSTRAINT "disciplinas_instituicao_id_fkey" FOREIGN KEY ("instituicao_id") REFERENCES "instituicoes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "curso_disciplinas" ADD CONSTRAINT "curso_disciplinas_curso_id_fkey" FOREIGN KEY ("curso_id") REFERENCES "cursos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "curso_disciplinas" ADD CONSTRAINT "curso_disciplinas_disciplina_id_fkey" FOREIGN KEY ("disciplina_id") REFERENCES "disciplinas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "professores" ADD CONSTRAINT "professores_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "professor_instituicoes" ADD CONSTRAINT "professor_instituicoes_professor_id_fkey" FOREIGN KEY ("professor_id") REFERENCES "professores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "professor_instituicoes" ADD CONSTRAINT "professor_instituicoes_instituicao_id_fkey" FOREIGN KEY ("instituicao_id") REFERENCES "instituicoes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "professor_disciplinas" ADD CONSTRAINT "professor_disciplinas_professor_id_fkey" FOREIGN KEY ("professor_id") REFERENCES "professores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "professor_disciplinas" ADD CONSTRAINT "professor_disciplinas_disciplina_id_fkey" FOREIGN KEY ("disciplina_id") REFERENCES "disciplinas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avaliacoes" ADD CONSTRAINT "avaliacoes_aluno_id_fkey" FOREIGN KEY ("aluno_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avaliacoes" ADD CONSTRAINT "avaliacoes_professor_id_fkey" FOREIGN KEY ("professor_id") REFERENCES "professores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avaliacoes" ADD CONSTRAINT "avaliacoes_disciplina_id_fkey" FOREIGN KEY ("disciplina_id") REFERENCES "disciplinas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notas_criterio" ADD CONSTRAINT "notas_criterio_avaliacao_id_fkey" FOREIGN KEY ("avaliacao_id") REFERENCES "avaliacoes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notas_criterio" ADD CONSTRAINT "notas_criterio_criterio_id_fkey" FOREIGN KEY ("criterio_id") REFERENCES "criterios_avaliacao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
