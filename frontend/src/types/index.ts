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
  language: string
  is_indexed: boolean
  last_indexed_at?: string
  stars: number
  open_issues: number
  description?: string
  visibility: 'public' | 'private'
  updated_at: string
}

export interface Issue {
  id: string
  repository_id: string
  github_number: number
  title: string
  body?: string
  state: 'open' | 'in_progress' | 'resolved' | 'failed'
  labels: string[]
  author: string
  classification: 'bug' | 'feature' | 'docs' | 'perf' | 'security'
  priority: number
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info'
  file_path?: string
  github_url?: string
  created_at: string
}

export interface AgentRun {
  id: string
  issue_id: string
  status: 'pending' | 'running' | 'success' | 'failed' | 'review'
  started_at?: string
  completed_at?: string
  confidence_score?: number
  total_tokens?: number
  error_message?: string
}

export interface AgentStep {
  id: string
  run_id: string
  agent_name: string
  status: 'pending' | 'running' | 'success' | 'failed'
  reasoning?: string
  tokens_used?: number
  duration_ms?: number
  step_order: number
  started_at?: string
  completed_at?: string
  description?: string
}

export interface PullRequest {
  id: string
  run_id: string
  issue_id: string
  github_pr_number: number
  github_pr_url: string
  branch_name: string
  title: string
  body: string
  diff: string
  files_changed: string[]
  state: 'open' | 'merged' | 'closed'
  repository_name: string
  commit_message: string
}
