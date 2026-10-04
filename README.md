# Avaliador de Professores

API em [NestJS](https://nestjs.com/) para uma plataforma de avaliação de professores: instituições, cursos, disciplinas, professores e avaliações de alunos, com autenticação própria (contas, sessões, verificação de e-mail e reset de senha).

## Stack

- **NestJS 11** + TypeScript
- **PostgreSQL** via **Prisma ORM** (`prisma/schema.prisma`)
- **JWT** (access + refresh token) com sessões persistidas no banco
- **Cache** em memória (`@nestjs/cache-manager`)
- **E-mail** via `@nestjs-modules/mailer` (SMTP)

## Pré-requisitos

- [Node.js](https://nodejs.org/) 22+ e npm
- [Docker](https://www.docker.com/) e Docker Compose (para o PostgreSQL local)

## 1. Instalar dependências

```bash
npm install
```

## 2. Configurar variáveis de ambiente

Copie o arquivo de exemplo e ajuste os valores:

```bash
cp .env.example .env
```

Variáveis usadas:

| Variável | Descrição | Padrão |
|---|---|---|
| `DATABASE_URL` | String de conexão do PostgreSQL | — |
| `JWT_SECRET` | Segredo usado para assinar access/refresh tokens | — |
| `JWT_EXPIRES_IN` | Validade do access token | `1h` |
| `JWT_REFRESH_EXPIRES_IN` | Validade do refresh token | `7d` |
| `MAIL_HOST`, `MAIL_PORT`, `MAIL_SECURE`, `MAIL_USER`, `MAIL_PASSWORD`, `MAIL_FROM` | Configuração SMTP para envio de e-mails (verificação de conta e reset de senha) | — |
| `EMAIL_VERIFICATION_CODE_EXPIRES_MINUTES` | Validade do código de verificação de e-mail | `15` |
| `EMAIL_VERIFICATION_MAX_RESEND_ATTEMPTS` | Máximo de reenvios de código dentro da janela abaixo | `3` |
| `EMAIL_VERIFICATION_RESEND_WINDOW_MINUTES` | Janela (em minutos) usada no limite de reenvio | `15` |

> **Importante:** `JWT_SECRET` deve ser um valor aleatório e forte em qualquer ambiente além do local. Para gerar um:
> ```bash
> node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
> ```

> Sem credenciais de SMTP reais, o cadastro (`sign-up`) continua funcionando normalmente (o envio do e-mail de verificação falha silenciosamente), mas `request-password-reset` e `resend-email-verification` retornam `503`, pois dependem do envio ter sucesso.

## 3. Subir o banco de dados

O `docker-compose.yml` já está configurado para bater com o `DATABASE_URL` do `.env.example`:

```bash
docker compose up -d
```

Isso sobe um PostgreSQL 15 em `localhost:5456`, com dados persistidos no volume `pgdata`.

## 4. Rodar as migrations do Prisma

```bash
npx prisma migrate dev
```

Isso aplica as migrations em `prisma/migrations/` e gera o Prisma Client (`@prisma/client`). Sempre que o `schema.prisma` for alterado, repita este passo para criar uma nova migration.

Outros comandos úteis do Prisma:

```bash
npx prisma generate   # regenera o client sem criar migration
npx prisma studio      # abre uma UI para inspecionar os dados
npx prisma format      # formata e valida o schema.prisma
```

### Dados de exemplo (seed)

Pra popular o banco com instituições, cursos, disciplinas, professores e algumas avaliações fictícias:

```bash
npx prisma db seed
```

Pode rodar mais de uma vez que não duplica. Todos os usuários criados usam a senha `senha123`:

| Email | Tipo |
|---|---|
| `admin@teste.com` | ADMINISTRADOR |
| `joana.aluna@teste.com`, `pedro.aluno@teste.com` | ALUNO |
| `carlos.menezes@teste.com`, `fernanda.souza@teste.com`, `ricardo.barros@teste.com`, `helena.costa@teste.com` | PROFESSOR |

## 5. Rodar a aplicação

```bash
# desenvolvimento (sem watch)
npm run start

# desenvolvimento com watch (recomendado)
npm run start:dev

# produção (requer `npm run build` antes)
npm run build
npm run start:prod
```

Por padrão a API sobe em `http://localhost:3000` (ajustável via `PORT`).

## 6. Testes

```bash
npm run test        # testes unitários
npm run test:e2e    # testes end-to-end
npm run test:cov    # com cobertura
```

## Endpoints de autenticação

Todas as rotas abaixo estão sob o prefixo `/auth`. As rotas marcadas com 🔒 exigem um access token válido, enviado via cookie `access_token` (`httpOnly`, setado automaticamente pelas rotas de login/refresh) ou header `Authorization: Bearer <token>`.

| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/auth/sign-up` | Cria conta + usuário (papel `ALUNO`) e retorna tokens |
| `POST` | `/auth/sign-in` | Autentica com e-mail/senha e retorna tokens |
| `POST` | `/auth/refresh` | Gera novo par de tokens a partir de um refresh token válido |
| `POST` | `/auth/logout` | Revoga a sessão associada ao refresh token |
| `GET` | `/auth/me` 🔒 | Retorna os dados do usuário autenticado |
| `POST` | `/auth/reset-password` 🔒 | Troca a senha do usuário autenticado |
| `POST` | `/auth/request-password-reset` | Envia e-mail com token para redefinir senha |
| `POST` | `/auth/confirm-password-reset` | Confirma a redefinição de senha usando o token recebido por e-mail |
| `POST` | `/auth/verify-email` | Confirma o código de verificação enviado por e-mail |
| `POST` | `/auth/resend-email-verification` | Reenvia o código de verificação de e-mail |

Exemplo rápido com `curl`:

```bash
# cadastro
curl -X POST http://localhost:3000/auth/sign-up \
  -H "Content-Type: application/json" \
  -d '{"name":"Maria","email":"maria@example.com","password":"senha12345"}'

# login (salva cookies para reaproveitar em outras chamadas)
curl -c cookies.txt -X POST http://localhost:3000/auth/sign-in \
  -H "Content-Type: application/json" \
  -d '{"email":"maria@example.com","password":"senha12345"}'

# rota protegida usando o cookie salvo
curl -b cookies.txt http://localhost:3000/auth/me
```

## Modelo de dados

O schema Prisma (`prisma/schema.prisma`) cobre dois domínios:

- **Autenticação**: `Conta`, `Usuario`, `Telefone`, `Endereco`, tokens de verificação/reset, `Sessao` e `TentativaLogin`.
- **Avaliação de professores**: `Instituicao`, `Curso`, `Disciplina` (com grade curricular via `CursoDisciplina`), `Professor` (com vínculos `ProfessorInstituicao`/`ProfessorDisciplina`), `CriterioAvaliacao` (catálogo de critérios como didática, clareza, assiduidade) e `Avaliacao` + `NotaCriterio` (nota por critério, avaliação anônima opcional).

## Estrutura do projeto

```
src/
  auth/       # controller, service, guards, DTOs e decorator de roles
  cache/      # wrapper do cache-manager
  common/     # pipes e utilitários compartilhados
  lib/        # configuração de módulos de infraestrutura (mailer)
  prisma/     # PrismaService/PrismaModule (client global)
prisma/
  schema.prisma
  migrations/
```
