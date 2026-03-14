export interface User {
  id: string
  github_id: number
  login: string
  email?: string
  avatar_url?: string
  created_at: string
}

export interface Repository {
  id: string
  user_id: string
  github_id: number
  full_name: string
  default_branch: string
  language?: string
  is_indexed: boolean
  last_indexed_at?: string
  webhook_id?: number
  settings: RepositorySettings
  created_at: string
}

export interface RepositorySettings {
  auto_pr: boolean
  confidence_threshold: number
  enabled_languages: string[]
}

export interface Issue {
  id: string
  repository_id: string
  github_number: number
  title: string
  body?: string
  state: 'open' | 'in_progress' | 'resolved' | 'failed'
  labels: string[]
  author?: string
  classification?: IssueType
  priority: number
  github_url?: string
  created_at: string
  updated_at: string
}

export type IssueType = 'bug' | 'feature' | 'docs' | 'perf' | 'security'

export interface AgentRun {
  id: string
  issue_id: string
  status: RunStatus
  started_at?: string
  completed_at?: string
  confidence_score?: number
  total_tokens: number
  total_cost_usd?: number
  error_message?: string
  context?: AgentContext
  created_at: string
}

export type RunStatus = 'pending' | 'running' | 'success' | 'failed' | 'review'

export interface AgentStep {
  id: string
  run_id: string
  agent_name: AgentName
  status: StepStatus
  input?: Record<string, unknown>
  output?: Record<string, unknown>
  reasoning?: string
  tokens_used?: number
  duration_ms?: number
  step_order: number
  started_at?: string
  completed_at?: string
}

export type AgentName =
  | 'issue_understanding'
  | 'repo_exploration'
  | 'code_understanding'
  | 'solution_planning'
  | 'code_generation'
  | 'validation'
  | 'pull_request'
  | 'learning'

export type StepStatus = 'pending' | 'running' | 'success' | 'failed'

export interface PullRequest {
  id: string
  run_id: string
  issue_id: string
  github_pr_number?: number
  github_pr_url?: string
  branch_name?: string
  title?: string
  body?: string
  diff?: string
  files_changed: string[]
  state: 'open' | 'merged' | 'closed'
  merged_at?: string
  created_at: string
}

export interface AgentContext {
  run_id: string
  issue?: IssueAnalysis
  repo?: RepoMetadata
  indexed_files?: FileIndex[]
  relevant_files?: RankedFile[]
  fix_plan?: FixPlan
  patch_diff?: string
  validation_result?: ValidationResult
  pr_result?: PRResult
  step_logs: AgentStep[]
}

export interface IssueAnalysis {
  issue_type: IssueType
  severity: 'critical' | 'high' | 'medium' | 'low'
  affected_components: string[]
  error_messages: string[]
  reproduction_steps: string[]
  keywords: string[]
  confidence: number
}

export interface RepoMetadata {
  full_name: string
  default_branch: string
  language: string
  file_count: number
  total_chunks: number
}

export interface FileIndex {
  file_path: string
  language: string
  chunk_count: number
  embedding_id: string
}

export interface RankedFile {
  file_path: string
  similarity: number
  chunk_type: string
  content: string
  start_line: number
  end_line: number
}

export interface FixPlan {
  strategy: string
  affected_files: string[]
  change_description: string
  confidence: number
  alternatives: string[]
}

export interface ValidationResult {
  passed: boolean
  issues_found: string[]
  warnings: string[]
  confidence_score: number
}

export interface PRResult {
  pr_url: string
  pr_number: number
  branch_name: string
}
