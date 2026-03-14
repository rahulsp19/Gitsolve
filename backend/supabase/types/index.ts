export interface AgentContext {
  run_id: string
  issue_id: string
  repository_id: string
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
  issue_type: 'bug' | 'feature' | 'docs' | 'perf' | 'security'
  severity: 'critical' | 'high' | 'medium' | 'low'
  affected_components: string[]
  error_messages: string[]
  reproduction_steps: string[]
  keywords: string[]
  confidence: number
}

export interface RepoMetadata {
  full_name: string
  owner: string
  repo: string
  default_branch: string
  language: string
  file_count: number
}

export interface FileIndex {
  file_path: string
  language: string
  sha: string
  chunk_count: number
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

export interface AgentStep {
  id?: string
  run_id: string
  agent_name: string
  status: 'pending' | 'running' | 'success' | 'failed'
  input?: unknown
  output?: unknown
  reasoning?: string
  tokens_used?: number
  duration_ms?: number
  step_order: number
  started_at?: string
  completed_at?: string
}
