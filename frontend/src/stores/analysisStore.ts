import { create } from 'zustand'
import { useAuthStore } from './authStore'

export interface AnalyzedIssue {
  id: string
  type: string
  title: string
  file: string
  line?: number
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info'
  classification: 'bug' | 'perf' | 'security' | 'feature' | 'docs'
  description: string
  fix: string
  codeSnippet?: string
}

export interface AnalysisMetrics {
  filesScanned: number
  functionsAnalyzed: number
  issuesDetected: number
  securityRisks: number
}

export interface AgentTimelineStep {
  id: string
  agent_name: string
  status: 'pending' | 'running' | 'success' | 'failed'
  description: string
  completed_at?: string
  step_order: number
}

export interface FixResult {
  issueId: string
  explanation: string
  originalCode: string
  fixedCode: string
  confidence: number
  changes: string[]
  filePath: string
}

export interface PRResult {
  success: boolean
  pr_number: number
  pr_url: string
  branch_name: string
  title: string
  repository_name: string
}

type AnalysisStatus = 'idle' | 'fetching' | 'analyzing' | 'done' | 'error' | 'empty_repo'

interface AnalysisState {
  status: AnalysisStatus
  repoUrl: string
  repoName: string
  issues: AnalyzedIssue[]
  metrics: AnalysisMetrics
  agentSteps: AgentTimelineStep[]
  error: string | null
  currentFix: FixResult | null
  fixLoading: boolean
  prResult: PRResult | null
  prLoading: boolean

  // Actions
  startAnalysis: (repoUrl: string) => Promise<void>
  resolveIssue: (issue: AnalyzedIssue) => Promise<void>
  createPR: (issue: AnalyzedIssue) => Promise<void>
  reset: () => void
}

const API_URL = import.meta.env.VITE_API_URL || ''

function getAuthHeaders(): Record<string, string> {
  const session = useAuthStore.getState().session as any
  const token = session?.provider_token
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`
  return headers
}

export const useAnalysisStore = create<AnalysisState>((set, get) => ({
  status: 'idle',
  repoUrl: '',
  repoName: '',
  issues: [],
  metrics: { filesScanned: 0, functionsAnalyzed: 0, issuesDetected: 0, securityRisks: 0 },
  agentSteps: [],
  error: null,
  currentFix: null,
  fixLoading: false,
  prResult: null,
  prLoading: false,

  startAnalysis: async (repoUrl: string) => {
    set({
      status: 'fetching',
      repoUrl,
      repoName: repoUrl.replace('https://github.com/', '').replace('.git', ''),
      issues: [],
      metrics: { filesScanned: 0, functionsAnalyzed: 0, issuesDetected: 0, securityRisks: 0 },
      agentSteps: [
        { id: 's1', agent_name: 'repo-exploration', status: 'running', description: 'Fetching repository tree from GitHub...', step_order: 1 },
        { id: 's2', agent_name: 'code-understanding', status: 'pending', description: 'Waiting to download and parse code files...', step_order: 2 },
        { id: 's3', agent_name: 'validation', status: 'pending', description: 'Waiting to analyze code for vulnerabilities...', step_order: 3 },
        { id: 's4', agent_name: 'solution-planning', status: 'pending', description: 'Waiting to classify detected issues...', step_order: 4 },
      ],
      error: null,
      currentFix: null,
      prResult: null,
    })

    try {
      const res = await fetch(`${API_URL}/api/analyze`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ repoUrl }),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(errData.error || `Server error ${res.status}`)
      }

      const data = await res.json()
      
      if (data.status === 'empty_repo') {
        set({
           status: 'empty_repo',
           error: data.message,
           agentSteps: get().agentSteps.map(s => 
             s.agent_name === 'repo-exploration' ? { ...s, status: 'failed' as const, description: data.message } :
             { ...s, status: 'failed' as const, description: 'Skipped - Repository is empty.' }
           )
        });
        return;
      }

      set({
        status: 'done',
        issues: data.issues || [],
        metrics: data.metrics || { filesScanned: 0, functionsAnalyzed: 0, issuesDetected: 0, securityRisks: 0 },
        agentSteps: (data.agentSteps || []).map((s: any) => ({ ...s, status: 'success' })),
        repoName: data.repoName || get().repoName,
      })
    } catch (err: any) {
      set({
        status: 'error',
        error: err.message || 'Analysis failed',
        agentSteps: get().agentSteps.map(s =>
          s.status === 'running' || s.status === 'pending'
            ? { ...s, status: 'failed' as const, description: `Failed: ${err.message}` }
            : s
        ),
      })
    }
  },

  resolveIssue: async (issue: AnalyzedIssue) => {
    set({ fixLoading: true, currentFix: null })
    try {
      const res = await fetch(`${API_URL}/api/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ issue, repoUrl: get().repoUrl }),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(errData.error || `Server error ${res.status}`)
      }

      const data = await res.json()
      set({ currentFix: data, fixLoading: false })
    } catch (err: any) {
      set({ fixLoading: false, error: err.message })
    }
  },

  createPR: async (issue: AnalyzedIssue) => {
    const fix = get().currentFix
    if (!fix) return

    set({ prLoading: true, prResult: null })
    try {
      const res = await fetch(`${API_URL}/api/create-pr`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repoUrl: get().repoUrl,
          filePath: fix.filePath,
          fixedCode: fix.fixedCode,
          issueTitle: issue.title,
          explanation: fix.explanation,
        }),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(errData.error || `Server error ${res.status}`)
      }

      const data = await res.json()
      set({ prResult: data, prLoading: false })
    } catch (err: any) {
      set({ prLoading: false, error: err.message })
    }
  },

  reset: () => {
    set({
      status: 'idle',
      repoUrl: '',
      repoName: '',
      issues: [],
      metrics: { filesScanned: 0, functionsAnalyzed: 0, issuesDetected: 0, securityRisks: 0 },
      agentSteps: [],
      error: null,
      currentFix: null,
      fixLoading: false,
      prResult: null,
      prLoading: false,
    })
  },
}))
