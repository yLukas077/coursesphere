# CourseSphere

Aplicação full stack de gestão colaborativa de cursos online

**Stack:** Ruby on Rails 7 (API) · React 18 + Vite + TypeScript · PostgreSQL 15 · JWT · Tailwind CSS · TanStack Query · Docker · RSpec · Vitest

> 🔗 **Aplicação em produção:** [coursesphere-three.vercel.app](https://coursesphere-three.vercel.app)
> 🔌 **API backend:** [coursesphere-backend-yoeh.onrender.com](https://coursesphere-backend-yoeh.onrender.com/up)
> 🔑 **Login de teste:** `demo@coursesphere.dev` / `password123`

> ⏱️ **Sobre o cold start:** o backend está hospedado no plano free do Render, que coloca a aplicação em sleep após 15 minutos de inatividade. A primeira requisição após o sleep pode levar ~30-60 segundos para acordar. Requisições subsequentes são instantâneas. Se o login parecer "travado" ao testar, aguarde até um minuto e tente novamente — é o backend acordando, não um bug.

---

## Sumário

- [Visão geral](#visão-geral)
- [Como rodar com Docker](#como-rodar-com-docker)
- [Como rodar localmente sem Docker](#como-rodar-localmente-sem-docker)
- [Credenciais de teste](#credenciais-de-teste)
- [Endpoints da API](#endpoints-da-api)
- [Testes automatizados](#testes-automatizados)
- [Arquitetura e decisões técnicas](#arquitetura-e-decisões-técnicas)
- [Deploy](#deploy)
- [Checklist do desafio](#checklist-do-desafio)

---

## Visão geral

CourseSphere permite que usuários autenticados criem e gerenciem cursos online, organizando aulas dentro de cada curso. Apenas o criador de um curso pode editá-lo ou excluí-lo, bem como as aulas vinculadas a ele.

**Funcionalidades principais:**

- Registro, login e logout com autenticação JWT
- CRUD de cursos e aulas, com regras de autorização por criador
- Busca por nome de curso e filtro de aulas por status (`draft`/`published`)
- Paginação na listagem de cursos
- Integração com a [RandomUser API](https://randomuser.me/) para sugerir um "instrutor convidado" na tela de detalhes do curso

---

## Como rodar com Docker

Modo recomendado — sobe banco, backend e frontend com um único comando.

**Pré-requisitos:** Docker e Docker Compose.

```bash
git clone https://github.com/yLukas077/coursesphere.git
cd coursesphere
docker compose up --build
```

Na primeira execução o backend roda migrations + seeds automaticamente (porque o `docker-compose.yml` define `SEED_ON_BOOT=true` para dev). Aguarde a mensagem `Listening on http://0.0.0.0:3000`.

| Serviço      | URL                                  |
| ------------ | ------------------------------------ |
| Frontend     | http://localhost:5173                |
| API backend  | http://localhost:3000/api/v1         |
| Healthcheck  | http://localhost:3000/up             |

**Comandos úteis:**

```bash
docker compose down         # parar containers
docker compose down -v      # parar e apagar volumes (reseta o banco)
docker compose logs -f      # acompanhar logs em tempo real
```

---

## Como rodar localmente sem Docker

### Backend

Pré-requisitos: Ruby 3.2.2, PostgreSQL 15+, Bundler.

```bash
cd backend
bundle install
bin/rails db:create db:migrate db:seed
bin/rails server          # http://localhost:3000
```

Ajuste credenciais do banco em `config/database.yml` ou via variáveis `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_PORT`.

### Frontend

Pré-requisitos: Node 20+.

```bash
cd frontend
npm install
cp .env.example .env       # ajuste VITE_API_URL se necessário
npm run dev                # http://localhost:5173
```

---

## Credenciais de teste

Os seeds criam dois usuários:

| Email                       | Senha         |
| --------------------------- | ------------- |
| `demo@coursesphere.dev`     | `password123` |
| `ana@coursesphere.dev`      | `password123` |

A tela de login já vem pré-preenchida com as credenciais do `demo`. Você também pode criar uma conta nova em `/register`.

---

## Endpoints da API

Todos prefixados com `/api/v1`. Endpoints autenticados exigem header `Authorization: Bearer <token>`.

### Auth

| Método | Endpoint           | Body                                            | Resposta              |
| ------ | ------------------ | ----------------------------------------------- | --------------------- |
| POST   | `/auth/register`   | `{ user: { name, email, password } }`           | `{ user, token }`     |
| POST   | `/auth/login`      | `{ email, password }`                           | `{ user, token }`     |
| GET    | `/auth/me`         | —                                               | `{ user }`            |

### Courses

| Método | Endpoint           | Notas                                                |
| ------ | ------------------ | ---------------------------------------------------- |
| GET    | `/courses`         | Query params: `q`, `page`, `per_page`                |
| GET    | `/courses/:id`     | Inclui dados do criador                              |
| POST   | `/courses`         | `{ course: { name, description, start_date, end_date } }` |
| PUT    | `/courses/:id`     | Apenas o criador                                     |
| DELETE | `/courses/:id`     | Apenas o criador                                     |

### Lessons

| Método | Endpoint                          | Notas                                          |
| ------ | --------------------------------- | ---------------------------------------------- |
| GET    | `/courses/:course_id/lessons`     | Query param: `status` (`draft`/`published`)    |
| POST   | `/courses/:course_id/lessons`     | `{ lesson: { title, status, video_url } }` — apenas criador |
| GET    | `/lessons/:id`                    |                                                |
| PUT    | `/lessons/:id`                    | Apenas criador do curso                        |
| DELETE | `/lessons/:id`                    | Apenas criador do curso                        |

### API externa

O frontend consome a [RandomUser API](https://randomuser.me) na tela de detalhes do curso para exibir um "instrutor convidado". A chamada usa `seed=course-{id}` para garantir que o mesmo curso sempre exiba a mesma pessoa entre reloads.

---

## Testes automatizados

### Backend (RSpec)

```bash
# via Docker
docker compose exec backend bundle exec rspec

# local
cd backend && bundle exec rspec
```

Cobre validações dos models (`User`, `Course`, `Lesson`), regras de negócio (`editable_by?`, ordenação de datas) e endpoints principais com casos de autenticação e autorização.

### Frontend (Vitest + Testing Library)

```bash
cd frontend
npm test
```

Cobre formulários e interações de UI principais.

---

## Arquitetura e decisões técnicas

### Backend — Rails idiomático

```
backend/app/
├── controllers/
│   ├── application_controller.rb     # rescue_from para erros padronizados
│   ├── concerns/
│   │   └── authenticatable.rb        # JWT auth via before_action
│   └── api/v1/
│       ├── base_controller.rb        # inclui Authenticatable
│       ├── auth_controller.rb        # register, login, me
│       ├── courses_controller.rb     # CRUD + busca + paginação
│       └── lessons_controller.rb     # CRUD aninhado por curso
├── models/                           # User, Course, Lesson + validações + scopes
backend/lib/
└── json_web_token.rb                 # encode/decode JWT
```

**Por que Rails idiomático e não Clean Architecture / DDD?** Para um CRUD desse escopo, abstrações como entities, repositories ou use cases criariam ruído sem agregar valor. Optei pelo "Rails Way": controllers finos, models com validações e regras simples (`editable_by?`), `concerns` para reuso (autenticação) e versionamento de API (`/api/v1`) para evolução futura sem breaking changes.

**Autenticação.** JWT stateless via header `Authorization: Bearer`. O concern `Authenticatable` é incluído no `BaseController` da v1; o `AuthController` faz `skip_before_action` nas ações públicas. O segredo vem de `ENV["JWT_SECRET"]` com fallback para `secret_key_base`. Token expira em 7 dias.

**Authorization.** Decidida no controller via `before_action :authorize_owner!`, consultando o método `editable_by?` do modelo. Mantém o model agnóstico à camada HTTP, sem precisar de uma gem dedicada (Pundit/CanCanCan) para um escopo tão pequeno.

**Erros padronizados.** `rescue_from` no `ApplicationController` converte exceções em `{ errors: [...] }` com status code apropriado. O frontend confia nesse contrato e exibe os erros via toast.

### Frontend — feature-based + TanStack Query

```
frontend/src/
├── features/
│   ├── auth/        # AuthContext, ProtectedRoute, Login, Register
│   ├── courses/     # api.ts, CourseForm, ListPage, DetailPage, randomuser.ts
│   └── lessons/     # api.ts, LessonForm
├── components/
│   ├── Layout.tsx   # header + outlet
│   └── ui/          # Button, Card, Input, Modal, Select, Badge…
└── lib/
    ├── api.ts       # axios + interceptor JWT + handler 401
    ├── types.ts     # contratos TS espelhando a API
    └── utils.ts
```

**Por que feature-based.** Quando precisar mexer em "lessons", tudo está na mesma pasta. Escala melhor que o tradicional `pages/ hooks/ components/` à medida que o número de features cresce.

**Por que TanStack Query e não Redux/Zustand.** A maior parte do estado dessa aplicação é estado de servidor (cache, refetch, invalidação). Query resolve isso com um `useQuery`/`useMutation` por endpoint. Para estado local de UI, `useState`. Para auth, um Context simples basta.

**Componentes UI.** Estilo shadcn/ui (Tailwind + variantes via CVA), mas inline no projeto — sem dependência de uma CLI ou registro externo. Isso mantém o código transparente e zero acoplamento com versões de biblioteca.

### Infraestrutura — entrypoint inteligente

O `backend/bin/docker-entrypoint` detecta o ambiente:

- **Em desenvolvimento** (sem `DATABASE_URL`): aguarda o container do Postgres via `pg_isready` antes de prosseguir.
- **Em produção** (com `DATABASE_URL`): pula o wait, vai direto para `db:prepare` (cria o banco se não existir e roda as migrations pendentes).
- **Seed condicional:** `db:seed` só roda se `SEED_ON_BOOT=true` estiver setado. Em desenvolvimento o `docker-compose.yml` ativa isso; em produção fica desligado para não zerar o banco a cada deploy.

### Trade-offs assumidos

- **Sem refresh tokens.** JWT de 7 dias é suficiente para o escopo. Em produção real, access curto + refresh seria o ideal.
- **Sem rate limiting.** Em produção entraria Rack::Attack ou nível de proxy.
- **Sem soft delete.** `dependent: :destroy` apaga em cascata.
- **Sem testes E2E.** Cobertura de modelos + requests no backend e Vitest no frontend são suficientes para o escopo; Cypress/Playwright custariam tempo desproporcional.

---

## Deploy

Aplicação em produção:

- **Frontend** na Vercel ([coursesphere-three.vercel.app](https://coursesphere-three.vercel.app)) — build do Vite com `vercel.json` para rewrites SPA.
- **Backend + PostgreSQL** no Render, runtime Docker — o `Dockerfile` e o `bin/docker-entrypoint` cuidam de migrations e (opcionalmente) seeds no boot.

Configuração via variáveis de ambiente: `DATABASE_URL`, `JWT_SECRET`, `SECRET_KEY_BASE`, `CORS_ORIGINS`, `ALLOWED_HOSTS`.

---

## Checklist do desafio

- [x] Registro / login / logout com JWT
- [x] Rotas protegidas no frontend
- [x] CRUD de courses com autorização (apenas criador edita/exclui)
- [x] CRUD de lessons aninhado em course com autorização
- [x] Validações nos models (datas coerentes, status enum, formato de URL)
- [x] Frontend: Register, Login, Lista de cursos, Detalhe do curso, formulários
- [x] Consumo de API externa (RandomUser como instrutor convidado)
- [x] Busca por nome de curso
- [x] Filtro de aulas por status
- [x] Paginação na listagem de cursos
- [x] Feedback de loading e mensagens de erro/sucesso
- [x] Responsividade básica (mobile-first com Tailwind)
- [x] Docker + docker-compose
- [x] Testes automatizados (RSpec + Vitest)
- [x] JWT auth robusta
- [x] Deploy (Render + Vercel)
- [x] README completo

---