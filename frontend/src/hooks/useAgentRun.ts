import { useMutation, useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { resolveIssue } from '@/lib/api'
import { useAgentStore } from '@/stores/agentStore'

export function useResolveIssue() {
  const { setActiveRun, setSteps } = useAgentStore()

  return useMutation({
    mutationFn: resolveIssue,
    onSuccess: async ({ run_id }) => {
      const { data } = await supabase
        .from('agent_runs')
        .select('*')
        .eq('id', run_id)
        .single()
      if (data) setActiveRun(data)
      setSteps([])
    },
  })
}

export function useAgentRuns(issueId?: string) {
  return useQuery({
    queryKey: ['agent_runs', issueId],
    enabled: !!issueId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('agent_runs')
        .select('*, agent_steps(*)')
        .eq('issue_id', issueId!)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data
    },
  })
}
