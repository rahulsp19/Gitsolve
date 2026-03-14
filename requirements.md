**PRODUCT REQUIREMENTS DOCUMENT**

**Agentic AI GitHub Issue Resolver**

Autonomous Multi-Agent Developer Platform

Version 1.0 | Hackathon Edition | 2025

_Classification: Internal Technical Specification_

# **1\. Executive Summary**

The Agentic AI GitHub Issue Resolver is a next-generation autonomous developer platform that fundamentally reimagines how software bugs and feature requests are addressed. By deploying a coordinated fleet of specialized AI agents, the system autonomously ingests GitHub issues, explores and comprehends complex codebases, synthesizes targeted fixes, and submits well-documented pull requests - all with minimal human intervention.

This document serves as the comprehensive technical specification for the Hackathon MVP and establishes the architectural blueprint for a production-grade product.

| **Field**           | **Value**                                         |
| ------------------- | ------------------------------------------------- |
| **Project Name**    | Agentic AI GitHub Issue Resolver                  |
| **Version**         | 1.0 (Hackathon MVP)                               |
| **Target Timeline** | 24-Hour Hackathon Sprint                          |
| **Tech Stack**      | React + TypeScript, Supabase, LLM API, GitHub API |
| **Agent Framework** | Multi-Agent Orchestration with Tool Use           |
| **Primary Goal**    | Autonomous Issue → Fix → PR Pipeline              |
| **Secondary Goal**  | AI Decision Visualization Dashboard               |
| **Success Metric**  | End-to-end PR creation from a real GitHub issue   |

## **1.1 Key Value Propositions**

- Autonomous resolution of GitHub issues without manual developer intervention
- Multi-agent coordination for accurate understanding and reliable code generation
- Full audit trail and AI reasoning transparency via real-time visualization
- Semantic code search using embeddings for precise bug localization
- Self-improving system through pattern learning from past resolutions

# **2\. Problem Statement**

## **2.1 The Software Maintenance Crisis**

Modern software development teams are overwhelmed by issue backlogs. The average open-source repository accumulates hundreds of unresolved issues, while enterprise codebases face thousands. Developers spend an estimated 30-50% of their productive time on bug investigation and repetitive fixes - time that could be redirected to innovation.

The core challenges are:

- Issue Triage Overload: Teams lack bandwidth to assess, prioritize, and assign every issue
- Context Switching Cost: Debugging requires deep codebase familiarity - expensive to re-acquire per issue
- Slow Resolution Cycles: Average time-to-fix for non-critical bugs exceeds 2 weeks
- Knowledge Silos: Codebase understanding locked in individual developers' heads
- PR Quality Variance: Fix quality and documentation vary widely across contributors

## **2.2 Opportunity**

Large Language Models have demonstrated extraordinary capability in code understanding, generation, and reasoning. Combined with tool use and multi-agent orchestration, AI systems can now autonomously navigate codebases, understand semantic relationships between components, and generate production-quality patches. The Agentic AI GitHub Issue Resolver operationalizes this capability into a practical, integrated developer tool.

# **3\. Product Vision**

## **3.1 Vision Statement**

To build the world's first fully autonomous AI developer that resolves GitHub issues end-to-end - from problem understanding to pull request - dramatically reducing the cost and time of software maintenance while improving code quality and developer experience.

## **3.2 Target Users**

| **User Segment**        | **Pain Point**              | **Solution**                             |
| ----------------------- | --------------------------- | ---------------------------------------- |
| Open Source Maintainers | Overwhelmed by issue volume | Automate triage and first-response fixes |
| Engineering Teams       | Slow bug resolution cycles  | 10x faster time-to-fix on routine bugs   |
| Solo Developers         | Limited bandwidth           | AI pair programmer handling fixes        |
| DevOps / SRE Teams      | Production incidents        | Rapid automated patch generation         |
| Technical Leads         | Code review bottlenecks     | AI-generated PRs with full explanations  |

## **3.3 Product Principles**

- Transparency First: Every AI decision must be explainable and visible
- Developer Trust: All PRs are human-reviewable before merge
- Security by Design: No raw code execution without sandboxing
- Graceful Degradation: If confidence is low, escalate to human
- Minimal Permission: Request only what is needed from GitHub OAuth

# **4\. System Architecture**

## **4.1 High-Level Architecture Overview**

The system is composed of four primary layers: the Frontend Application, Backend Services, AI Agent Pipeline, and External Integrations. Each layer communicates through well-defined APIs and event streams.

| **Layer** | **Technology**              | **Responsibility**                                    |
| --------- | --------------------------- | ----------------------------------------------------- |
| Layer 1   | Frontend (React/TypeScript) | Dashboard, OAuth, Issue Viewer, AI Reasoning UI       |
| Layer 2   | Backend (Supabase)          | Auth, Database, Realtime, Storage, Edge Functions     |
| Layer 3   | AI Pipeline                 | Multi-agent orchestration, LLM calls, embeddings, RAG |
| Layer 4   | Integrations                | GitHub REST, GraphQL, Webhooks, Code Sandbox          |

## **4.2 Event Flow**

The system operates on an event-driven architecture. Below is the canonical flow for a complete issue resolution cycle:

- User authenticates via GitHub OAuth and connects a repository
- GitHub Webhook fires on new issue creation (or user selects existing issue)
- Supabase Edge Function receives webhook, creates an agent_run record
- Issue Understanding Agent extracts structured problem representation
- Repository Exploration Agent indexes and chunks the codebase into vector store
- Code Understanding Agent performs semantic search to locate relevant files
- Solution Planning Agent designs a fix strategy with multiple options
- Code Generation Agent writes the patch against identified files
- Validation Agent runs linting, type checking, and test simulation
- Pull Request Agent creates the PR via GitHub API with full explanation
- Learning Agent records pattern, confidence score, and outcome for future use
- Realtime subscription pushes status updates to the frontend dashboard

## **4.3 Backend Architecture (Supabase)**

Supabase serves as the unified backend platform, providing authentication, relational database, vector storage, real-time communication, file storage, and serverless compute through Edge Functions.

- Supabase Auth: GitHub OAuth provider, JWT management, Row Level Security (RLS)
- Supabase Postgres: Primary relational database with pgvector extension for embeddings
- Supabase Realtime: WebSocket-based live updates for agent step progress
- Supabase Storage: Repository snapshot archives, diff files, generated patches
- Supabase Edge Functions: Deno-based serverless functions for webhook ingestion and agent orchestration

## **4.4 Async Job Handling**

Agent runs are inherently long-running operations (30 seconds to several minutes). The system uses a hybrid approach:

- Edge Functions handle initial webhook ingestion and job creation synchronously
- Agent orchestration runs asynchronously, updating agent_steps records in real-time
- Supabase Realtime channels broadcast step-by-step progress to connected clients
- Retry logic with exponential backoff handles transient LLM API failures
- Job queue implemented using Postgres-backed task table with claimed_at locking

# **5\. Agent Architecture**

## **5.1 Multi-Agent Orchestration Design**

The system employs eight specialized agents, each with a clearly scoped responsibility, a defined toolset, and structured input/output contracts. The Orchestrator Agent coordinates execution, manages state, and handles inter-agent communication through a shared context object stored in Supabase.

## **5.2 Agent Definitions**

<div class="joplin-table-wrapper"><table><tbody><tr><th><p><strong>1. Issue Understanding Agent</strong></p></th><th><ul><li>Reads raw GitHub issue title, body, labels, and comments</li><li>Extracts structured problem representation: error type, affected component, reproduction steps</li><li>Classifies issue as: bug, feature request, documentation, performance, security</li><li>Identifies keywords, file hints, and error messages embedded in issue text</li><li>Outputs: IssueAnalysis JSON object with confidence score</li></ul></th></tr></tbody></table></div>

<div class="joplin-table-wrapper"><table><tbody><tr><th><p><strong>2. Repository Exploration Agent</strong></p></th><th><ul><li>Fetches repository file tree via GitHub REST API</li><li>Prioritizes files based on issue keywords and relevance scoring</li><li>Reads file contents in batches using GitHub Contents API</li><li>Chunks code into semantic units (function/class level) using Tree-sitter AST</li><li>Triggers embedding generation pipeline for vector storage in pgvector</li><li>Outputs: indexed_files list and embedding_batch_id</li></ul></th></tr></tbody></table></div>

<div class="joplin-table-wrapper"><table><tbody><tr><th><p><strong>3. Code Understanding Agent</strong></p></th><th><ul><li>Performs vector similarity search using issue embedding vs code chunk embeddings</li><li>Re-ranks results using cross-encoder model for precision</li><li>Reads full context windows around highest-scoring code chunks</li><li>Traces call graphs and import dependencies for identified files</li><li>Outputs: relevant_files ranked list with relevance scores and code context</li></ul></th></tr></tbody></table></div>

<div class="joplin-table-wrapper"><table><tbody><tr><th><p><strong>4. Solution Planning Agent</strong></p></th><th><ul><li>Receives issue analysis and relevant code context</li><li>Generates 2-3 candidate fix strategies with tradeoff analysis</li><li>Evaluates strategies by: correctness, minimal diff, test compatibility</li><li>Selects optimal strategy with confidence score</li><li>Outputs: fix_plan JSON with strategy, affected_files, and change_description</li></ul></th></tr></tbody></table></div>

<div class="joplin-table-wrapper"><table><tbody><tr><th><p><strong>5. Code Generation Agent</strong></p></th><th><ul><li>Reads full content of affected files</li><li>Generates unified diff patch implementing the fix_plan</li><li>Ensures adherence to existing code style (indentation, naming conventions)</li><li>Handles multiple file modifications in a single coherent patch</li><li>Outputs: patch_diff string, modified_files list, test_suggestions</li></ul></th></tr></tbody></table></div>

<div class="joplin-table-wrapper"><table><tbody><tr><th><p><strong>6. Validation Agent</strong></p></th><th><ul><li>Applies patch to in-memory file representation</li><li>Runs static analysis: ESLint/Pylint rules via sandboxed execution</li><li>Checks for syntax errors, undefined references, type violations</li><li>Verifies patch does not break existing test patterns</li><li>Outputs: validation_result (pass/fail), issues_found list, confidence_score</li></ul></th></tr></tbody></table></div>

<div class="joplin-table-wrapper"><table><tbody><tr><th><p><strong>7. Pull Request Agent</strong></p></th><th><ul><li>Creates feature branch via GitHub API with auto-generated branch name</li><li>Commits patched files with structured commit message</li><li>Creates PR via GitHub REST API with comprehensive description</li><li>Attaches diff, root cause analysis, and fix explanation to PR body</li><li>Links PR to original issue via closing keyword</li><li>Outputs: pr_url, pr_number, branch_name</li></ul></th></tr></tbody></table></div>

<div class="joplin-table-wrapper"><table><tbody><tr><th><p><strong>8. Learning Agent</strong></p></th><th><ul><li>Records complete agent run metadata, decisions, and confidence scores</li><li>Extracts issue-fix pattern for future retrieval</li><li>Updates code embedding index with new file versions post-merge</li><li>Analyzes PR review comments to improve future generations</li><li>Outputs: pattern_id stored in learning_patterns table</li></ul></th></tr></tbody></table></div>

## **5.3 Agent Communication Protocol**

Agents communicate through a shared AgentContext object, persisted in Supabase Postgres and passed between agents as structured JSON. Each agent reads its input from context, appends its output, and the Orchestrator advances the pipeline.

AgentContext = {

run_id: string,

issue: IssueAnalysis,

repo: RepositoryMetadata,

indexed_files: FileIndex\[\],

relevant_files: RankedFile\[\],

fix_plan: FixPlan,

patch_diff: string,

validation_result: ValidationResult,

pr_result: PRResult,

step_logs: AgentStep\[\]

}

# **6\. API Integrations**

## **6.1 GitHub API Suite**

### **6.1.1 GitHub REST API**

Base URL: <https://api.github.com>. Used for core repository operations.

| **Endpoint**                                              | **Purpose**                        |
| --------------------------------------------------------- | ---------------------------------- |
| **GET /repos/{owner}/{repo}**                             | Fetch repository metadata          |
| **GET /repos/{owner}/{repo}/issues**                      | List open issues with pagination   |
| **GET /repos/{owner}/{repo}/contents/{path}**             | Read file content (Base64 encoded) |
| **GET /repos/{owner}/{repo}/git/trees/{sha}?recursive=1** | Full recursive file tree           |
| **POST /repos/{owner}/{repo}/git/refs**                   | Create branch reference            |
| **PUT /repos/{owner}/{repo}/contents/{path}**             | Create/update file with commit     |
| **POST /repos/{owner}/{repo}/pulls**                      | Create pull request                |
| **POST /repos/{owner}/{repo}/issues/{n}/comments**        | Comment on issue                   |

### **6.1.2 GitHub GraphQL API**

Base URL: <https://api.github.com/graphql>. Used for complex nested queries that would require multiple REST calls.

query IssueWithContext(\$owner: String!, \$repo: String!, \$number: Int!) {

repository(owner: \$owner, name: \$repo) {

issue(number: \$number) {

title body state labels(first: 10) { nodes { name } }

comments(first: 20) { nodes { body author { login } } }

timelineItems(first: 5, itemTypes: \[CROSS_REFERENCED_EVENT\]) {

nodes { ... on CrossReferencedEvent { source { ... on PullRequest { url } } } }

}

}

}

}

### **6.1.3 GitHub Webhooks**

Webhooks enable real-time event ingestion. Configure at repo level or organization level.

| **Event**                         | **Action**                           |
| --------------------------------- | ------------------------------------ |
| **issues.opened**                 | Trigger agent run on new issue       |
| **issues.labeled**                | Trigger on 'ai-fix' label addition   |
| **pull_request.closed**           | Track PR merge for learning agent    |
| **pull_request_review.submitted** | Capture review feedback for learning |

Webhook payloads are received by Supabase Edge Functions at: https://{project}.supabase.co/functions/v1/github-webhook

HMAC-SHA256 signature validation is applied using the webhook secret stored in Supabase Vault.

## **6.2 AI API Integrations**

| **API / Model**                   | **Use Case**                                       |
| --------------------------------- | -------------------------------------------------- |
| **OpenAI GPT-4o / o1**            | Primary reasoning, code generation, plan synthesis |
| **Anthropic Claude Sonnet**       | Long-context code comprehension, PR writing        |
| **Groq / Together (Mixtral)**     | Fast, low-cost classification tasks                |
| **OpenAI text-embedding-3-large** | Code chunk embeddings (3072 dimensions)            |
| **Cohere Rerank**                 | Cross-encoder reranking of search results          |
| **E2B Code Interpreter**          | Sandboxed code execution for validation            |

## **6.3 Supabase API Usage**

| **API**                | **Usage**                                            |
| ---------------------- | ---------------------------------------------------- |
| **Supabase Auth**      | GitHub OAuth, JWT refresh, RLS policy enforcement    |
| **Supabase JS Client** | CRUD operations on all tables from Edge Functions    |
| **Supabase Realtime**  | agent_steps channel subscription for live UI updates |
| **Supabase Storage**   | Store repo snapshots, diffs, patch files             |
| **Supabase Vault**     | Encrypted secrets: GitHub tokens, LLM API keys       |
| **pgvector**           | Vector similarity search on code_embeddings table    |

## **6.4 Developer Tool APIs**

| **Tool**                | **Purpose**                                        |
| ----------------------- | -------------------------------------------------- |
| **Tree-sitter (WASM)**  | AST-based code chunking by function/class boundary |
| **@babel/parser**       | JavaScript/TypeScript AST parsing                  |
| **ast (Python stdlib)** | Python AST parsing for code analysis               |
| **diff / unified-diff** | Patch generation and application                   |
| **E2B SDK**             | Secure sandbox for lint/test execution             |
| **linguist**            | Language detection from file extensions            |

# **7\. Tech Stack**

## **7.1 Frontend**

| **Technology**       | **Purpose**                                       |
| -------------------- | ------------------------------------------------- |
| **React 18**         | Component framework with concurrent rendering     |
| **TypeScript 5.x**   | Type safety and IDE intelligence                  |
| **React Bits**       | Pre-built component system for developer UIs      |
| **Stitch (via MCP)** | AI-generated frontend scaffolding                 |
| **TanStack Query**   | Async data fetching, caching, and synchronization |
| **Zustand**          | Lightweight global state management               |
| **Framer Motion**    | Agent step animations and transitions             |
| **Prism.js**         | Syntax-highlighted code diff rendering            |
| **Mermaid.js**       | Agent flow diagram visualization                  |
| **Tailwind CSS**     | Utility-first styling                             |
| **Radix UI**         | Accessible headless component primitives          |
| **Vite**             | Fast build tooling and HMR                        |

## **7.2 Backend**

| **Technology**                     | **Purpose**                                       |
| ---------------------------------- | ------------------------------------------------- |
| **Supabase**                       | Unified backend platform                          |
| **Supabase Edge Functions (Deno)** | Serverless compute for webhooks and orchestration |
| **Supabase Postgres 15**           | Primary database with pgvector and pg_cron        |
| **Supabase Realtime (Phoenix)**    | WebSocket event broadcasting                      |
| **Supabase Storage**               | File object storage (S3-compatible)               |
| **Supabase Vault**                 | Encrypted secrets management                      |

## **7.3 AI Infrastructure**

| **Technology**               | **Purpose**                                 |
| ---------------------------- | ------------------------------------------- |
| **OpenAI SDK**               | Primary LLM and embeddings client           |
| **Anthropic SDK**            | Claude API for long-context tasks           |
| **LangChain.js / LangGraph** | Agent orchestration and tool use            |
| **pgvector**                 | Native vector similarity search in Postgres |
| **E2B**                      | Sandboxed code execution environment        |
| **Cohere Rerank API**        | Search result re-ranking                    |

# **8\. Database Schema**

## **8.1 Core Tables**

### **8.1.1 users**

CREATE TABLE users (

id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

github_id BIGINT UNIQUE NOT NULL,

login TEXT NOT NULL,

email TEXT,

avatar_url TEXT,

github_token TEXT, -- encrypted via Supabase Vault

created_at TIMESTAMPTZ DEFAULT NOW(),

updated_at TIMESTAMPTZ DEFAULT NOW()

);

### **8.1.2 repositories**

CREATE TABLE repositories (

id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

user_id UUID REFERENCES users(id) ON DELETE CASCADE,

github_id BIGINT UNIQUE NOT NULL,

full_name TEXT NOT NULL, -- 'owner/repo'

default_branch TEXT DEFAULT 'main',

language TEXT,

is_indexed BOOLEAN DEFAULT FALSE,

last_indexed_at TIMESTAMPTZ,

webhook_id BIGINT,

settings JSONB DEFAULT '{}', -- auto_pr, confidence_threshold

created_at TIMESTAMPTZ DEFAULT NOW()

);

### **8.1.3 issues**

CREATE TABLE issues (

id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

repository_id UUID REFERENCES repositories(id) ON DELETE CASCADE,

github_number INTEGER NOT NULL,

title TEXT NOT NULL,

body TEXT,

state TEXT DEFAULT 'open', -- open, in_progress, resolved, failed

labels TEXT\[\] DEFAULT '{}',

author TEXT,

classification TEXT, -- bug, feature, docs, perf, security

priority INTEGER DEFAULT 0,

github_url TEXT,

created_at TIMESTAMPTZ DEFAULT NOW(),

updated_at TIMESTAMPTZ DEFAULT NOW()

);

### **8.1.4 agent_runs**

CREATE TABLE agent_runs (

id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

issue_id UUID REFERENCES issues(id) ON DELETE CASCADE,

status TEXT DEFAULT 'pending', -- pending, running, success, failed, review

started_at TIMESTAMPTZ,

completed_at TIMESTAMPTZ,

confidence_score DECIMAL(5,4), -- 0.0000 to 1.0000

total_tokens INTEGER DEFAULT 0,

total_cost_usd DECIMAL(10,6),

error_message TEXT,

context JSONB, -- full AgentContext snapshot

created_at TIMESTAMPTZ DEFAULT NOW()

);

### **8.1.5 agent_steps**

CREATE TABLE agent_steps (

id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

run_id UUID REFERENCES agent_runs(id) ON DELETE CASCADE,

agent_name TEXT NOT NULL, -- 'issue_understanding', 'code_generation', etc

status TEXT DEFAULT 'pending', -- pending, running, success, failed

input JSONB,

output JSONB,

reasoning TEXT, -- chain-of-thought from LLM

tokens_used INTEGER,

duration_ms INTEGER,

step_order INTEGER NOT NULL,

started_at TIMESTAMPTZ,

completed_at TIMESTAMPTZ

);

### **8.1.6 code_embeddings**

CREATE TABLE code_embeddings (

id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

repository_id UUID REFERENCES repositories(id) ON DELETE CASCADE,

file_path TEXT NOT NULL,

chunk_index INTEGER NOT NULL,

chunk_type TEXT, -- 'function', 'class', 'module', 'block'

content TEXT NOT NULL,

start_line INTEGER,

end_line INTEGER,

language TEXT,

embedding vector(3072), -- OpenAI text-embedding-3-large

metadata JSONB,

created_at TIMESTAMPTZ DEFAULT NOW(),

UNIQUE(repository_id, file_path, chunk_index)

);

CREATE INDEX ON code_embeddings USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

### **8.1.7 pull_requests**

CREATE TABLE pull_requests (

id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

run_id UUID REFERENCES agent_runs(id),

issue_id UUID REFERENCES issues(id),

github_pr_number INTEGER,

github_pr_url TEXT,

branch_name TEXT,

title TEXT,

body TEXT,

diff TEXT,

files_changed TEXT\[\],

state TEXT DEFAULT 'open', -- open, merged, closed

merged_at TIMESTAMPTZ,

created_at TIMESTAMPTZ DEFAULT NOW()

);

### **8.1.8 learning_patterns**

CREATE TABLE learning_patterns (

id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

issue_type TEXT,

language TEXT,

pattern_summary TEXT,

fix_template TEXT,

success_count INTEGER DEFAULT 0,

failure_count INTEGER DEFAULT 0,

avg_confidence DECIMAL(5,4),

embedding vector(3072),

created_at TIMESTAMPTZ DEFAULT NOW(),

updated_at TIMESTAMPTZ DEFAULT NOW()

);

# **9\. AI Pipeline**

## **9.1 Vector Search Implementation**

Semantic code search is the backbone of accurate bug localization. The system uses a two-stage retrieval approach: ANN (Approximate Nearest Neighbor) search via pgvector's IVFFlat index, followed by cross-encoder reranking.

### **9.1.1 Code Chunking Strategy**

Raw source files are chunked at semantic boundaries rather than arbitrary token limits. This preserves the full context of functions, classes, and logical blocks.

| **Chunking Level**           | **Strategy**                                                     |
| ---------------------------- | ---------------------------------------------------------------- |
| **Level 1: Function/Method** | Each function body becomes one chunk (preferred)                 |
| **Level 2: Class**           | Small classes chunked as a unit; large classes chunked by method |
| **Level 3: Block**           | Logical code blocks (if/for/try) for languages without functions |
| **Level 4: Module**          | Small files (< 50 lines) chunked as a single unit                |
| **Overlap Strategy**         | ±5 lines of context before/after each chunk boundary             |
| **Max Chunk Size**           | 1500 tokens (leaves room for metadata in embedding context)      |
| **Min Chunk Size**           | 20 tokens (skip trivial one-liners)                              |

### **9.1.2 Embedding Generation**

// Edge Function: generate-embeddings

const chunks = await chunkCodeWithTreeSitter(fileContent, language);

const embeddings = await openai.embeddings.create({

model: 'text-embedding-3-large',

input: chunks.map(c => \`File: \${filePath}\\nType: \${c.type}\\n\\n\${c.content}\`),

dimensions: 3072

});

// Store in pgvector

await supabase.from('code_embeddings').upsert(

chunks.map((chunk, i) => ({

repository_id, file_path,

chunk_index: i, chunk_type: chunk.type,

content: chunk.content, start_line: chunk.startLine,

end_line: chunk.endLine, language,

embedding: embeddings.data\[i\].embedding

}))

);

### **9.1.3 Vector Similarity Search**

\-- Semantic search query

SELECT file_path, chunk_type, content, start_line, end_line,

1 - (embedding &lt;=&gt; \$1::vector) AS similarity

FROM code_embeddings

WHERE repository_id = \$2

ORDER BY embedding &lt;=&gt; \$1::vector

LIMIT 20;

The query embedding is generated from the issue text enriched with extracted keywords. Results are then reranked using Cohere Rerank API for precision retrieval.

# **10\. Prompt Engineering**

## **10.1 Issue Analysis Prompt**

**System:**

You are an expert software engineer analyzing a GitHub issue. Extract structured information from the issue and output valid JSON only.

**User:**

Analyze this GitHub issue and extract: issue_type (bug|feature|docs|perf|security), severity (critical|high|medium|low), affected_components (list), error_messages (list), reproduction_steps (list), keywords (list of technical terms), and confidence (0-1).

Issue Title: {{title}}

Issue Body: {{body}}

Labels: {{labels}}

## **10.2 Bug Localization Prompt**

**System:**

You are an expert code reviewer. Given a bug description and relevant code chunks, identify the exact location and root cause of the bug.

**User:**

Bug Report: {{issue_analysis}}

Relevant Code Chunks (ranked by semantic similarity):

{{code_chunks}}

Identify: primary_file, line_range, root_cause, affected_functions, fix_approach. Output JSON.

## **10.3 Patch Generation Prompt**

**System:**

You are a senior software engineer generating a minimal, correct patch to fix a bug. Preserve code style. Return unified diff format only.

**User:**

Fix Plan: {{fix_plan}}

Current File Content ({{file_path}}):{{file_content}}

Rules: (1) Minimal diff - change only what is necessary. (2) Preserve indentation and naming. (3) Add brief inline comment explaining the fix. (4) Output unified diff only.

## **10.4 PR Description Prompt**

**System:**

You are a technical writer generating a professional pull request description. Be concise, accurate, and helpful for human reviewers.

**User:**

Issue: {{issue_title}} (#{{issue_number}})

Root Cause: {{root_cause}}

Fix Applied: {{fix_description}}

Generate: ## Summary, ## Root Cause, ## Changes Made, ## Testing, ## Notes. Closes #{{issue_number}}.

# **11\. UI/UX Design**

## **11.1 Application Screens**

### **Screen 1: Authentication & Onboarding**

- GitHub OAuth login button (prominent, primary CTA)
- Hero section explaining the product in one sentence
- Permission scope explanation (repos, issues, pull_requests)
- Social proof: 'Connect in 30 seconds, resolve issues autonomously'

### **Screen 2: Dashboard**

- Stats bar: Total issues processed, PRs created, Success rate, Avg resolution time
- Repository list with connection status, indexing progress, issue count
- Recent activity feed with real-time updates via Supabase Realtime
- Quick action: 'Resolve Issue' button with issue number input
- Agent health status indicators (all 8 agents with online/busy/error states)

### **Screen 3: Repository Connection**

- GitHub repo search with OAuth-scoped repository list
- Repository settings: auto-resolve toggle, confidence threshold slider (0.7-1.0)
- Webhook registration status and manual re-trigger button
- Indexing progress: file count, chunk count, embedding progress bar
- Language distribution chart for indexed codebase

### **Screen 4: Issue Viewer**

- Issue detail with rendered Markdown body
- Labels, author, created date, comment thread preview
- 'Resolve with AI' button with one-click agent run trigger
- Agent run history for this issue with status and PR link
- Classification badge: Bug / Feature / Docs / Security / Performance

### **Screen 5: AI Reasoning Visualization**

This is the signature differentiating screen - a real-time visualization of the agent pipeline.

- Vertical step-by-step agent pipeline with animated progress
- Each agent card shows: status icon, agent name, duration, token count
- Expandable reasoning panel: LLM chain-of-thought and tool call details
- Code diff viewer (split view) showing generated patch with syntax highlighting
- Confidence score meter with color gradient (red/yellow/green)
- Mermaid.js flow diagram showing agent decision path
- Live log stream via Realtime subscription

### **Screen 6: PR Preview & Approval**

- Rendered PR description with Markdown preview
- Files changed list with diff statistics (+/- lines)
- Syntax-highlighted unified diff viewer
- Approval workflow: Auto-submit / Review First / Reject
- One-click GitHub PR link after creation

# **12\. Security**

## **12.1 Authentication & Authorization**

| **Mechanism**            | **Implementation**                                                 |
| ------------------------ | ------------------------------------------------------------------ |
| **GitHub OAuth 2.0**     | PKCE flow for SPA. Scopes: repo, issues:write, pull_requests:write |
| **Supabase Auth**        | JWT with 1-hour expiry + refresh token rotation                    |
| **Row Level Security**   | All Supabase tables enforce user_id-scoped RLS policies            |
| **GitHub Token Storage** | Encrypted at rest via Supabase Vault. Never exposed to frontend    |
| **Webhook Secret**       | HMAC-SHA256 signature validation on all incoming webhook payloads  |

## **12.2 Sandboxed Code Execution**

The Validation Agent must execute linting and type checking against generated patches. This runs in a fully isolated E2B sandbox with the following constraints:

- No network access inside sandbox
- Read-only filesystem except /tmp
- 60-second execution timeout
- Memory limit: 512MB
- CPU limit: 1 vCPU
- No persistent state between runs

## **12.3 Permission Minimization**

The system requests only the minimum GitHub OAuth scopes required:

| **Scope**               | **Reason**                                  |
| ----------------------- | ------------------------------------------- |
| **repo**                | Read repository contents for indexing       |
| **issues:write**        | Comment on issues with resolution status    |
| **pull_requests:write** | Create feature branches and pull requests   |
| **webhooks:write**      | Register webhook for real-time issue events |

## **12.4 Data Privacy**

- Code is only stored as embeddings (vector representations) - raw source is not persisted beyond active agent runs
- Repository snapshots stored in Supabase Storage are encrypted and auto-deleted after 24 hours
- Users can revoke access and delete all data via account settings (GDPR-compliant)

# **13\. Deployment**

## **13.1 Frontend: Vercel**

- Deploy React + TypeScript app to Vercel via GitHub Actions CI/CD
- Environment variables: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_GITHUB_CLIENT_ID
- Preview deployments on every PR branch for staging validation
- Edge Network CDN with global distribution for fast load times

## **13.2 Backend: Supabase**

- Supabase project provisioned via Supabase CLI (supabase init)
- Database migrations managed via supabase/migrations/\*.sql
- Edge Functions deployed via: supabase functions deploy &lt;function-name&gt;
- Environment secrets set via: supabase secrets set OPENAI_API_KEY=...
- pgvector extension enabled via: CREATE EXTENSION IF NOT EXISTS vector

## **13.3 CI/CD Pipeline**

\# .github/workflows/deploy.yml

on: \[push: branches: \[main\]\]

jobs:

deploy-frontend:

runs-on: ubuntu-latest

steps:

\- uses: actions/checkout@v4

\- run: npm ci && npm run build

\- uses: amondnet/vercel-action@v25

deploy-functions:

steps:

\- uses: supabase/setup-cli@v1

\- run: supabase functions deploy --project-ref \$PROJECT_REF

# **14\. Scalability**

## **14.1 Scaling Dimensions**

| **Dimension**                    | **Strategy**                                                                   |
| -------------------------------- | ------------------------------------------------------------------------------ |
| **100 Repositories**             | pgvector IVFFlat index handles 10M+ vectors. Partition by repository_id        |
| **1,000 Issues/day**             | Edge Function concurrency: 500 simultaneous invocations (Supabase Pro)         |
| **Large Codebases (>10k files)** | Incremental indexing: only re-embed changed files via git diff                 |
| **Long-running Agents**          | Deno streams + keepalive pings prevent Edge Function timeout (540s max)        |
| **Concurrent Agent Runs**        | Horizontal scaling via stateless Edge Functions + DB-backed job queue          |
| **LLM Rate Limits**              | Token bucket rate limiter + model fallback chain (GPT-4o -> Sonnet -> Mixtral) |

## **14.2 Performance Optimizations**

- Incremental Indexing: Track file SHA hashes, only re-index modified files
- Embedding Cache: Cache embeddings by content hash - identical code chunks reuse stored vectors
- Query Optimization: pgvector IVFFlat index with lists=100 for sub-10ms search on 1M vectors
- LLM Caching: Semantic cache layer using Redis (Upstash) for identical prompt responses
- Streaming Responses: Stream LLM tokens to frontend via Server-Sent Events for perceived speed

# **15\. Hackathon Implementation Roadmap**

Complete 24-hour build plan for Hackathon MVP. Success criteria: End-to-end pipeline from GitHub issue URL to created pull request.

| **Phase**       | **Tasks**                                                                                  | **Deliverable**                             |
| --------------- | ------------------------------------------------------------------------------------------ | ------------------------------------------- |
| **Hours 0-2**   | Supabase project setup, GitHub OAuth, DB schema, pgvector extension                        | Auth working, user can log in with GitHub   |
| **Hours 2-6**   | GitHub API integration, repo connection, file tree fetching, chunking + embedding pipeline | Repo indexed into pgvector                  |
| **Hours 6-10**  | Issue Understanding Agent + Code Understanding Agent with vector search                    | Issue analyzed + relevant files returned    |
| **Hours 10-14** | Solution Planning Agent + Code Generation Agent + patch generation                         | Valid unified diff produced from real issue |
| **Hours 14-18** | Validation Agent (E2B sandbox) + PR Agent (GitHub API branch + PR creation)                | Real PR created on GitHub from AI fix       |
| **Hours 18-21** | Frontend dashboard, issue viewer, AI reasoning visualization with Realtime                 | Polished UI showing agent steps live        |
| **Hours 21-23** | End-to-end testing, error handling, confidence scoring, demo script prep                   | Stable demo on 3 real GitHub issues         |
| **Hours 23-24** | Final polish, performance tuning, demo recording backup                                    | Submission ready                            |

## **15.1 MVP Scope Definition**

The Hackathon MVP must include these non-negotiable features:

- GitHub OAuth login and repository connection
- Manual issue URL input triggering an agent run
- Codebase indexing with vector embeddings (at least Python and JavaScript)
- End-to-end agent pipeline producing a unified diff
- Actual PR creation on GitHub via API
- Real-time progress visualization in the UI

Nice-to-have (implement only if ahead of schedule):

- Webhook-based automatic triggering on new issues
- Validation Agent with E2B sandbox
- Learning Agent pattern storage
- Multi-repository dashboard

# **16\. Future Enhancements**

## **16.1 Post-Hackathon Roadmap**

| **Version** | **Feature**                | **Description**                                           |
| ----------- | -------------------------- | --------------------------------------------------------- |
| V1.1        | Test Generation Agent      | Auto-generate unit tests for the fix, submit alongside PR |
| V1.2        | PR Review Agent            | Respond to human reviewer comments and iterate on the fix |
| V1.3        | Security Scanner Agent     | Static security analysis before PR submission             |
| V2.0        | GitHub Actions Integration | Run agent as a GitHub Action on issue label trigger       |
| V2.1        | IDE Plugin                 | VS Code extension for inline AI fix suggestions           |
| V2.2        | Multi-Repo Learning        | Cross-repository pattern transfer for common bug types    |
| V3.0        | Feature Implementation     | Extend agents to handle feature requests, not just bugs   |
| V3.1        | Enterprise SSO             | SAML/OIDC for team-based repository access control        |

## **16.2 Research Directions**

- Fine-tuned Code Models: Fine-tune a base model on verified issue-fix pairs for higher accuracy
- Graph Neural Networks: Model call graphs as GNNs for more accurate bug localization
- Reinforcement Learning from PR Outcomes: Use merge/reject signals as reward for policy improvement
- Multi-modal Debugging: Accept screenshots of UI bugs as input to the Issue Understanding Agent
- Collaborative Multi-Repo Context: Share embeddings across forks of the same repository

**END OF DOCUMENT**

_Agentic AI GitHub Issue Resolver - Product Requirements Document v1.0_