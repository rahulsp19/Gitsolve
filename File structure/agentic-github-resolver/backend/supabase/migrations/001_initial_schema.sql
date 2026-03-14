-- Enable vector extension
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ─── USERS ────────────────────────────────────────────────────────────────
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  github_id     BIGINT UNIQUE NOT NULL,
  login         TEXT NOT NULL,
  email         TEXT,
  avatar_url    TEXT,
  github_token  TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own" ON users FOR ALL USING (auth.uid()::text = id::text);

-- ─── REPOSITORIES ─────────────────────────────────────────────────────────
CREATE TABLE repositories (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
  github_id       BIGINT UNIQUE NOT NULL,
  full_name       TEXT NOT NULL,
  default_branch  TEXT DEFAULT 'main',
  language        TEXT,
  is_indexed      BOOLEAN DEFAULT FALSE,
  last_indexed_at TIMESTAMPTZ,
  webhook_id      BIGINT,
  settings        JSONB DEFAULT '{"auto_pr": false, "confidence_threshold": 0.75}',
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE repositories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "repos_own" ON repositories FOR ALL USING (
  user_id = (SELECT id FROM users WHERE id::text = auth.uid()::text)
);

-- ─── ISSUES ───────────────────────────────────────────────────────────────
CREATE TABLE issues (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repository_id   UUID REFERENCES repositories(id) ON DELETE CASCADE,
  github_number   INTEGER NOT NULL,
  title           TEXT NOT NULL,
  body            TEXT,
  state           TEXT DEFAULT 'open'
                  CHECK (state IN ('open','in_progress','resolved','failed')),
  labels          TEXT[] DEFAULT '{}',
  author          TEXT,
  classification  TEXT CHECK (classification IN ('bug','feature','docs','perf','security')),
  priority        INTEGER DEFAULT 0,
  github_url      TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(repository_id, github_number)
);

ALTER TABLE issues ENABLE ROW LEVEL SECURITY;
CREATE POLICY "issues_via_repo" ON issues FOR ALL USING (
  EXISTS (
    SELECT 1 FROM repositories r
    WHERE r.id = issues.repository_id
    AND r.user_id = (SELECT id FROM users WHERE id::text = auth.uid()::text)
  )
);

-- ─── AGENT RUNS ───────────────────────────────────────────────────────────
CREATE TABLE agent_runs (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_id         UUID REFERENCES issues(id) ON DELETE CASCADE,
  status           TEXT DEFAULT 'pending'
                   CHECK (status IN ('pending','running','success','failed','review')),
  started_at       TIMESTAMPTZ,
  completed_at     TIMESTAMPTZ,
  confidence_score DECIMAL(5,4),
  total_tokens     INTEGER DEFAULT 0,
  total_cost_usd   DECIMAL(10,6),
  error_message    TEXT,
  context          JSONB,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE agent_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "runs_via_issue" ON agent_runs FOR ALL USING (
  EXISTS (
    SELECT 1 FROM issues i
    JOIN repositories r ON r.id = i.repository_id
    WHERE i.id = agent_runs.issue_id
    AND r.user_id = (SELECT id FROM users WHERE id::text = auth.uid()::text)
  )
);

-- ─── AGENT STEPS ──────────────────────────────────────────────────────────
CREATE TABLE agent_steps (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id         UUID REFERENCES agent_runs(id) ON DELETE CASCADE,
  agent_name     TEXT NOT NULL,
  status         TEXT DEFAULT 'pending'
                 CHECK (status IN ('pending','running','success','failed')),
  input          JSONB,
  output         JSONB,
  reasoning      TEXT,
  tokens_used    INTEGER,
  duration_ms    INTEGER,
  step_order     INTEGER NOT NULL,
  started_at     TIMESTAMPTZ,
  completed_at   TIMESTAMPTZ
);

ALTER TABLE agent_steps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "steps_via_run" ON agent_steps FOR ALL USING (
  EXISTS (
    SELECT 1 FROM agent_runs ar
    JOIN issues i ON i.id = ar.issue_id
    JOIN repositories r ON r.id = i.repository_id
    WHERE ar.id = agent_steps.run_id
    AND r.user_id = (SELECT id FROM users WHERE id::text = auth.uid()::text)
  )
);

-- ─── CODE EMBEDDINGS ──────────────────────────────────────────────────────
CREATE TABLE code_embeddings (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repository_id  UUID REFERENCES repositories(id) ON DELETE CASCADE,
  file_path      TEXT NOT NULL,
  chunk_index    INTEGER NOT NULL,
  chunk_type     TEXT,
  content        TEXT NOT NULL,
  start_line     INTEGER,
  end_line       INTEGER,
  language       TEXT,
  sha            TEXT,
  embedding      vector(3072),
  metadata       JSONB,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(repository_id, file_path, chunk_index)
);

CREATE INDEX ON code_embeddings
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

CREATE INDEX ON code_embeddings (repository_id);

ALTER TABLE code_embeddings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "embeddings_via_repo" ON code_embeddings FOR ALL USING (
  EXISTS (
    SELECT 1 FROM repositories r
    WHERE r.id = code_embeddings.repository_id
    AND r.user_id = (SELECT id FROM users WHERE id::text = auth.uid()::text)
  )
);

-- ─── PULL REQUESTS ────────────────────────────────────────────────────────
CREATE TABLE pull_requests (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id           UUID REFERENCES agent_runs(id),
  issue_id         UUID REFERENCES issues(id),
  github_pr_number INTEGER,
  github_pr_url    TEXT,
  branch_name      TEXT,
  title            TEXT,
  body             TEXT,
  diff             TEXT,
  files_changed    TEXT[] DEFAULT '{}',
  state            TEXT DEFAULT 'open' CHECK (state IN ('open','merged','closed')),
  merged_at        TIMESTAMPTZ,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE pull_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "prs_via_issue" ON pull_requests FOR ALL USING (
  EXISTS (
    SELECT 1 FROM issues i
    JOIN repositories r ON r.id = i.repository_id
    WHERE i.id = pull_requests.issue_id
    AND r.user_id = (SELECT id FROM users WHERE id::text = auth.uid()::text)
  )
);

-- ─── LEARNING PATTERNS ────────────────────────────────────────────────────
CREATE TABLE learning_patterns (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_type      TEXT,
  language        TEXT,
  pattern_summary TEXT,
  fix_template    TEXT,
  success_count   INTEGER DEFAULT 0,
  failure_count   INTEGER DEFAULT 0,
  avg_confidence  DECIMAL(5,4),
  embedding       vector(3072),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── VECTOR SEARCH FUNCTION ───────────────────────────────────────────────
CREATE OR REPLACE FUNCTION search_code_embeddings(
  query_embedding vector(3072),
  repo_id         UUID,
  match_count     INT DEFAULT 20
)
RETURNS TABLE (
  file_path   TEXT,
  chunk_type  TEXT,
  content     TEXT,
  start_line  INTEGER,
  end_line    INTEGER,
  similarity  FLOAT
)
LANGUAGE sql STABLE AS $$
  SELECT
    file_path, chunk_type, content, start_line, end_line,
    1 - (embedding <=> query_embedding) AS similarity
  FROM code_embeddings
  WHERE repository_id = repo_id
  ORDER BY embedding <=> query_embedding
  LIMIT match_count;
$$;
