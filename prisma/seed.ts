import { GrauAcademico, PrismaClient, TipoUsuario, Titulacao } from '@prisma/client';
import * as bcrypt from 'bcrypt';

// Rode com `npx prisma db seed`; pode executar de novo sem duplicar os dados.

const prisma = new PrismaClient();

const SENHA = 'senha123';

const instituicoes = [
    { nome: 'Universidade Federal de Pernambuco', sigla: 'UFPE', cidade: 'Recife', estado: 'PE' },
    { nome: 'Universidade de Pernambuco', sigla: 'UPE', cidade: 'Recife', estado: 'PE' },
    { nome: 'Instituto Federal de Pernambuco', sigla: 'IFPE', cidade: 'Recife', estado: 'PE' },
];

const cursos = [
    { inst: 'UFPE', nome: 'Ciência da Computação', grau: GrauAcademico.BACHARELADO },
    { inst: 'UFPE', nome: 'Sistemas de Informação', grau: GrauAcademico.BACHARELADO },
    { inst: 'UFPE', nome: 'Matemática', grau: GrauAcademico.LICENCIATURA },
    { inst: 'UPE', nome: 'Engenharia de Software', grau: GrauAcademico.BACHARELADO },
    { inst: 'UPE', nome: 'Análise e Desenvolvimento de Sistemas', grau: GrauAcademico.TECNOLOGO },
    { inst: 'IFPE', nome: 'Técnico em Informática', grau: GrauAcademico.TECNICO },
];

const disciplinas = [
    { inst: 'UFPE', codigo: 'CIN0001', nome: 'Algoritmos e Estruturas de Dados', cargaHoraria: 90 },
    { inst: 'UFPE', codigo: 'CIN0002', nome: 'Banco de Dados', cargaHoraria: 60 },
    { inst: 'UFPE', codigo: 'CIN0003', nome: 'Engenharia de Software', cargaHoraria: 60 },
    { inst: 'UFPE', codigo: 'MAT0101', nome: 'Cálculo 1', cargaHoraria: 90 },
    { inst: 'UPE', codigo: 'POO001', nome: 'Programação Orientada a Objetos', cargaHoraria: 60 },
    { inst: 'UPE', codigo: 'BD001', nome: 'Banco de Dados', cargaHoraria: 60 },
    { inst: 'UPE', codigo: 'RC001', nome: 'Redes de Computadores', cargaHoraria: 60 },
    { inst: 'IFPE', codigo: 'LP001', nome: 'Lógica de Programação', cargaHoraria: 45 },
    { inst: 'IFPE', codigo: 'BD101', nome: 'Banco de Dados', cargaHoraria: 60 },
];

// Disciplinas de cada curso.
const grade = [
    { inst: 'UFPE', curso: 'Ciência da Computação', codigos: ['CIN0001', 'CIN0002', 'CIN0003', 'MAT0101'] },
    { inst: 'UFPE', curso: 'Sistemas de Informação', codigos: ['CIN0001', 'CIN0002', 'CIN0003'] },
    { inst: 'UFPE', curso: 'Matemática', codigos: ['MAT0101'] },
    { inst: 'UPE', curso: 'Engenharia de Software', codigos: ['POO001', 'BD001', 'RC001'] },
    { inst: 'UPE', curso: 'Análise e Desenvolvimento de Sistemas', codigos: ['POO001', 'BD001'] },
    { inst: 'IFPE', curso: 'Técnico em Informática', codigos: ['LP001', 'BD101'] },
];

const criterios = [
    { nome: 'Didática', descricao: 'Consegue explicar o conteúdo de um jeito que dá pra entender', ordem: 1 },
    { nome: 'Clareza', descricao: 'Objetividade nas aulas e nas cobranças', ordem: 2 },
    { nome: 'Assiduidade', descricao: 'Aparece nas aulas e cumpre o cronograma', ordem: 3 },
    { nome: 'Domínio do conteúdo', descricao: 'Segurança com a matéria', ordem: 4 },
];

const alunos = [
    { nome: 'Joana Almeida', email: 'joana.aluna@teste.com' },
    { nome: 'Pedro Lima', email: 'pedro.aluno@teste.com' },
];

const professores = [
    {
        nome: 'Carlos Menezes',
        email: 'carlos.menezes@teste.com',
        titulacao: Titulacao.DOUTOR,
        biografia: 'Doutor em Ciência da Computação, trabalha com estruturas de dados e engenharia de software.',
        atuacao: [
            { inst: 'UFPE', departamento: 'Centro de Informática' },
            { inst: 'UPE', departamento: 'Escola Politécnica' },
        ],
        leciona: ['CIN0001', 'CIN0003', 'POO001'],
    },
    {
        nome: 'Fernanda Souza',
        email: 'fernanda.souza@teste.com',
        titulacao: Titulacao.MESTRE,
        biografia: 'Mestre em Banco de Dados, dá aula há 8 anos.',
        atuacao: [{ inst: 'UFPE', departamento: 'Centro de Informática' }],
        leciona: ['CIN0002'],
    },
    {
        nome: 'Ricardo Barros',
        email: 'ricardo.barros@teste.com',
        titulacao: Titulacao.ESPECIALISTA,
        biografia: null,
        atuacao: [{ inst: 'UPE', departamento: null }],
        leciona: ['BD001', 'RC001'],
    },
    {
        nome: 'Helena Costa',
        email: 'helena.costa@teste.com',
        titulacao: Titulacao.DOUTOR,
        biografia: 'Doutora em Matemática Aplicada.',
        atuacao: [
            { inst: 'UFPE', departamento: 'Departamento de Matemática' },
            { inst: 'IFPE', departamento: null },
        ],
        leciona: ['MAT0101', 'LP001'],
    },
];

// As notas seguem a ordem dos critérios acima.
const avaliacoes = [
    {
        aluno: 'joana.aluna@teste.com',
        professor: 'carlos.menezes@teste.com',
        codigo: 'CIN0001',
        anonima: false,
        comentario: 'Explica muito bem, as listas de exercício ajudam bastante.',
        recomendaria: true,
        notas: [5, 4, 5, 5],
    },
    {
        aluno: 'pedro.aluno@teste.com',
        professor: 'carlos.menezes@teste.com',
        codigo: 'CIN0001',
        anonima: true,
        comentario: 'Prova pesada, mas justa.',
        recomendaria: true,
        notas: [4, 4, 5, 5],
    },
    {
        aluno: 'joana.aluna@teste.com',
        professor: 'fernanda.souza@teste.com',
        codigo: 'CIN0002',
        anonima: false,
        comentario: null,
        recomendaria: true,
        notas: [5, 5, 4, 4],
    },
    {
        aluno: 'pedro.aluno@teste.com',
        professor: 'helena.costa@teste.com',
        codigo: 'MAT0101',
        anonima: true,
        comentario: 'Conteúdo puxado e pouco tempo de revisão antes das provas.',
        recomendaria: false,
        notas: [3, 3, 4, 5],
    },
];

async function criarUsuario(nome: string, email: string, tipoUsuario: TipoUsuario, senhaHash: string) {
    const conta = await prisma.conta.upsert({
        where: { email },
        update: {},
        create: {
            email,
            senhaHash,
            emailVerificado: true,
            emailVerificadoEm: new Date(),
            usuario: { create: { nome, tipoUsuario } },
        },
        include: { usuario: true },
    });

    return conta.usuario!;
}

async function main() {
    const senhaHash = await bcrypt.hash(SENHA, 10);

    // Como não há campos únicos, procura os registros antes de criar.
    const instMap: Record<string, string> = {};
    for (const i of instituicoes) {
        const existente = await prisma.instituicao.findFirst({ where: { sigla: i.sigla, deletedAt: null } });
        const inst = existente ?? (await prisma.instituicao.create({ data: i }));
        instMap[i.sigla] = inst.id;
    }

    const cursoMap: Record<string, string> = {};
    for (const c of cursos) {
        const instituicaoId = instMap[c.inst];
        const existente = await prisma.curso.findFirst({ where: { instituicaoId, nome: c.nome, deletedAt: null } });
        const curso = existente ?? (await prisma.curso.create({ data: { instituicaoId, nome: c.nome, grau: c.grau } }));
        cursoMap[`${c.inst}:${c.nome}`] = curso.id;
    }

    const discMap: Record<string, string> = {};
    for (const d of disciplinas) {
        const instituicaoId = instMap[d.inst];
        const existente = await prisma.disciplina.findFirst({ where: { instituicaoId, codigo: d.codigo, deletedAt: null } });
        const disciplina =
            existente ??
            (await prisma.disciplina.create({
                data: { instituicaoId, codigo: d.codigo, nome: d.nome, cargaHoraria: d.cargaHoraria },
            }));
        discMap[d.codigo] = disciplina.id;
    }

    for (const g of grade) {
        const cursoId = cursoMap[`${g.inst}:${g.curso}`];
        for (const codigo of g.codigos) {
            const disciplinaId = discMap[codigo];
            await prisma.cursoDisciplina.upsert({
                where: { cursoId_disciplinaId: { cursoId, disciplinaId } },
                update: {},
                create: { cursoId, disciplinaId },
            });
        }
    }

    const criterioMap: string[] = [];
    for (const c of criterios) {
        const criterio = await prisma.criterioAvaliacao.upsert({
            where: { nome: c.nome },
            update: {},
            create: c,
        });
        criterioMap.push(criterio.id);
    }

    await criarUsuario('Administrador', 'admin@teste.com', TipoUsuario.ADMINISTRADOR, senhaHash);

    const alunoMap: Record<string, string> = {};
    for (const a of alunos) {
        const usuario = await criarUsuario(a.nome, a.email, TipoUsuario.ALUNO, senhaHash);
        alunoMap[a.email] = usuario.id;
    }

    const profMap: Record<string, string> = {};
    for (const p of professores) {
        const usuario = await criarUsuario(p.nome, p.email, TipoUsuario.PROFESSOR, senhaHash);

        const professor = await prisma.professor.upsert({
            where: { usuarioId: usuario.id },
            update: {},
            create: { usuarioId: usuario.id, titulacao: p.titulacao, biografia: p.biografia },
        });
        profMap[p.email] = professor.id;

        for (const a of p.atuacao) {
            const instituicaoId = instMap[a.inst];
            await prisma.professorInstituicao.upsert({
                where: { professorId_instituicaoId: { professorId: professor.id, instituicaoId } },
                update: { departamento: a.departamento },
                create: { professorId: professor.id, instituicaoId, departamento: a.departamento },
            });
        }

        for (const codigo of p.leciona) {
            const disciplinaId = discMap[codigo];
            await prisma.professorDisciplina.upsert({
                where: { professorId_disciplinaId: { professorId: professor.id, disciplinaId } },
                update: {},
                create: { professorId: professor.id, disciplinaId },
            });
        }
    }

    for (const a of avaliacoes) {
        const alunoId = alunoMap[a.aluno];
        const professorId = profMap[a.professor];
        const disciplinaId = discMap[a.codigo];

        const avaliacao = await prisma.avaliacao.upsert({
            where: { alunoId_professorId_disciplinaId: { alunoId, professorId, disciplinaId } },
            update: {},
            create: {
                alunoId,
                professorId,
                disciplinaId,
                anonima: a.anonima,
                comentario: a.comentario,
                recomendaria: a.recomendaria,
            },
        });

        for (let i = 0; i < a.notas.length; i++) {
            const criterioId = criterioMap[i];
            await prisma.notaCriterio.upsert({
                where: { avaliacaoId_criterioId: { avaliacaoId: avaliacao.id, criterioId } },
                update: { nota: a.notas[i] },
                create: { avaliacaoId: avaliacao.id, criterioId, nota: a.notas[i] },
            });
        }
    }

    console.log('Seed ok.');
    console.log(`Instituições: ${instituicoes.length} | Cursos: ${cursos.length} | Disciplinas: ${disciplinas.length}`);
    console.log(`Professores: ${professores.length} | Alunos: ${alunos.length} | Avaliações: ${avaliacoes.length}`);
    console.log(`Logins (senha ${SENHA}): admin@teste.com, joana.aluna@teste.com, carlos.menezes@teste.com ...`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
