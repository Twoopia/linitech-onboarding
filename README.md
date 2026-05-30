# Onboarding Corporativo

Sistema full-stack de automação de onboarding corporativo. Cadastro de colaboradores, checklist automatizado, controle de equipamentos, geração de credenciais e logs completos.

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Backend | Python 3.11 · FastAPI · SQLAlchemy · SQLite |
| Frontend | React 18 · Vite · TailwindCSS · React Router |
| Deploy | Vercel (serverless) |
| Local | Docker Compose |

## Funcionalidades

- **Colaboradores** — Cadastro completo com geração automática de usuário e senha temporária
- **Checklist** — 12 itens padrão criados automaticamente ao cadastrar um colaborador, agrupados por categoria (TI, RH, Facilities, Gestor)
- **Equipamentos** — Inventário com atribuição/devolução para colaboradores
- **Dashboard** — KPIs em tempo real, progresso geral, atividade recente
- **Logs** — Histórico completo de todas as ações do sistema
- **API REST** — Documentação automática via Swagger em `/api/docs`

## Desenvolvimento local (sem Docker)

### Backend

```bash
# Instalar dependências
pip install -r requirements.txt

# Iniciar servidor (porta 8000)
uvicorn backend.app.main:app --reload
```

A API estará em `http://localhost:8000`  
Swagger: `http://localhost:8000/api/docs`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

O frontend estará em `http://localhost:5173`  
O Vite proxy redireciona `/api/*` → `http://localhost:8000`

## Desenvolvimento local (com Docker)

```bash
docker-compose up --build
```

| Serviço | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:8000 |
| Swagger | http://localhost:8000/api/docs |

## Deploy no Vercel

### Pré-requisitos
- Conta no [Vercel](https://vercel.com)
- CLI do Vercel: `npm i -g vercel`

### Passos

```bash
# 1. Login
vercel login

# 2. Deploy (primeira vez)
vercel

# 3. Deploy de produção
vercel --prod
```

O `vercel.json` já está configurado com:
- Build do frontend: `cd frontend && npm install && npm run build`
- Função Python serverless em `api/index.py` (runtime Python 3.9)
- Rewrite: `/api/*` → função Python

### Variáveis de ambiente (produção)

| Variável | Descrição | Padrão |
|----------|-----------|--------|
| `DATABASE_URL` | URL de conexão do banco | SQLite em `/tmp` |

> **Atenção:** O SQLite em `/tmp` no Vercel é **efêmero** — os dados são perdidos entre cold starts. Para produção com persistência, use um banco gerenciado como [Turso](https://turso.tech) (SQLite remoto) ou [Supabase](https://supabase.com) (PostgreSQL).

### Banco de dados em produção (recomendado)

**Turso (SQLite serverless):**
```bash
turso db create onboarding
turso db show onboarding --url
# Setar no Vercel:
vercel env add DATABASE_URL
# Valor: libsql://seu-banco.turso.io?authToken=SEU_TOKEN
```

Instalar driver adicional:
```
pip install libsql-experimental
```

## API REST

Endpoints principais:

```
GET    /api/employees/                     Lista colaboradores
POST   /api/employees/                     Cadastrar colaborador
GET    /api/employees/{id}                 Buscar colaborador
PUT    /api/employees/{id}                 Atualizar colaborador
DELETE /api/employees/{id}                 Remover colaborador
POST   /api/employees/{id}/regenerate-credentials  Novas credenciais

GET    /api/checklist/{employee_id}        Checklist do colaborador
GET    /api/checklist/{employee_id}/progress  Progresso
PUT    /api/checklist/item/{item_id}       Marcar item

GET    /api/equipment/                     Lista equipamentos
POST   /api/equipment/                     Cadastrar equipamento
POST   /api/equipment/{id}/assign          Atribuir a colaborador
POST   /api/equipment/{id}/return          Devolver equipamento

GET    /api/dashboard/stats                KPIs
GET    /api/dashboard/recent               Atividade recente

GET    /api/logs/                          Logs (filtro: ?entity=employee)
```

## Estrutura do projeto

```
.
├── api/
│   └── index.py              # Entry point Vercel (importa FastAPI app)
├── backend/
│   └── app/
│       ├── main.py           # App FastAPI + CORS + rotas
│       ├── database.py       # SQLAlchemy engine + session
│       ├── models/           # Modelos ORM (Employee, ChecklistItem, Equipment, Log)
│       ├── schemas/          # Schemas Pydantic (request/response)
│       ├── services/         # Lógica de negócio
│       └── routes/           # Endpoints REST
├── frontend/
│   └── src/
│       ├── components/       # Sidebar, Topbar, StatCard, Badge, Modal
│       ├── pages/            # Dashboard, Employees, Checklist, Equipment, Logs
│       └── services/api.js   # Cliente Axios
├── docker-compose.yml
├── Dockerfile.backend
├── requirements.txt
└── vercel.json
```

## Geração automática de credenciais

Ao cadastrar um colaborador, o sistema gera automaticamente:
- **Usuário:** primeira letra do nome + sobrenome (ex: `jsantos`, `msantos2`)
- **Senha:** 14 caracteres aleatórios com letras, números e símbolos
- **Checklist:** 12 itens padrão categorizados por área responsável
