# Agentic AI GitHub Issue Resolver

An autonomous multi-agent AI system that reads GitHub issues, explores the codebase, generates fixes, and creates pull requests automatically.

## Architecture

```
frontend/          # React + TypeScript UI (Vite)
backend/
  agents/          # 8 specialized AI agents
  supabase/        # Edge Functions, migrations, DB schema
  lib/             # Shared GitHub, AI, embedding utilities
docs/              # Architecture & API documentation
```

## Quick Start

### 1. Frontend
```bash
cd frontend
npm install
cp ../.env.example .env.local
npm run dev
```

### 2. Backend (Supabase)
```bash
npm install -g supabase
supabase login
supabase init
supabase db push
supabase functions deploy
```

## Tech Stack
- **Frontend**: React 18, TypeScript, Tailwind CSS, Zustand, TanStack Query
- **Backend**: Supabase (Postgres + pgvector + Edge Functions + Realtime)
- **AI**: OpenAI GPT-4o, Claude Sonnet, text-embedding-3-large
- **GitHub**: REST API, GraphQL, Webhooks
- **Sandbox**: E2B for isolated code execution

## Agents
1. Issue Understanding Agent
2. Repository Exploration Agent
3. Code Understanding Agent
4. Solution Planning Agent
5. Code Generation Agent
6. Validation Agent
7. Pull Request Agent
8. Learning Agent
