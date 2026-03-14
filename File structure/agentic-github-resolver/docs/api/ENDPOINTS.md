# API Reference

## Supabase Edge Functions

### POST /functions/v1/resolve-issue
Trigger an AI agent run for an issue.

**Request:**
```json
{ "issue_id": "uuid" }
```
**Response:**
```json
{ "run_id": "uuid" }
```

### POST /functions/v1/github-webhook
Receives GitHub webhook events. Validates HMAC-SHA256 signature.

### POST /functions/v1/generate-embeddings
Generates and stores vector embeddings for code chunks.

**Request:**
```json
{
  "repository_id": "uuid",
  "file_path": "src/utils/auth.ts",
  "chunks": [{ "content": "...", "type": "function", "startLine": 1, "endLine": 25 }]
}
```

### POST /functions/v1/orchestrate-agents
Internal function. Runs the full 8-agent pipeline for a run.

## Realtime Subscriptions

### agent_steps changes
```typescript
supabase.channel('run-steps-{run_id}')
  .on('postgres_changes', { event: '*', table: 'agent_steps', filter: `run_id=eq.{id}` }, handler)
  .subscribe()
```

### agent_runs status updates
```typescript
supabase.channel('run-status-{run_id}')
  .on('postgres_changes', { event: 'UPDATE', table: 'agent_runs', filter: `id=eq.{id}` }, handler)
  .subscribe()
```
