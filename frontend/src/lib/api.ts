import { supabase } from './supabase'

/** Trigger an agent run for a given issue */
export async function resolveIssue(issueId: string): Promise<{ run_id: string }> {
  const { data, error } = await supabase.functions.invoke('resolve-issue', {
    body: { issue_id: issueId },
  })
  if (error) throw error
  return data
}

/** Connect a GitHub repository */
export async function connectRepository(fullName: string): Promise<void> {
  const { error } = await supabase.functions.invoke('connect-repository', {
    body: { full_name: fullName },
  })
  if (error) {
    console.error("Function error detailed:", error)
    if (error.context && typeof error.context.json === 'function') {
      try {
        const clonedContext = error.context.clone()
        const errBody = await clonedContext.json()
        throw new Error(errBody.error || errBody.message || error.message)
      } catch (e) {
        throw new Error(error.message || 'Unknown server error')
      }
    }
    throw new Error(error.message || 'Network error or function unavailable')
  }
}

/** Fetch agent steps for a run (used for polling fallback) */
export async function getAgentSteps(runId: string) {
  const { data, error } = await supabase
    .from('agent_steps')
    .select('*')
    .eq('run_id', runId)
    .order('step_order')
  if (error) throw error
  return data
}
