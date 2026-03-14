# Agent Architecture

## Pipeline

```
Issue URL / Webhook
       │
       ▼
┌─────────────────────┐
│ Issue Understanding │  Classifies issue type, severity, keywords
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Repo Exploration   │  Indexes codebase → pgvector embeddings
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Code Understanding │  Vector search → ranks relevant files
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Solution Planning   │  Designs fix strategy (2-3 options)
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Code Generation    │  Produces unified diff patch
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│    Validation       │  Linting, type check, logic review
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   Pull Request      │  Creates branch, commits, opens PR
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│     Learning        │  Records pattern for future use
└─────────────────────┘
```

## Communication
Agents share an `AgentContext` object (persisted in Supabase `agent_runs.context`).
Each agent reads from context, appends its output, and returns the enriched context.
The Orchestrator sequences agents and handles failures.
