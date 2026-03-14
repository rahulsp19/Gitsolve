import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export function usePullRequest(runId?: string) {
  return useQuery({
    queryKey: ['pull_request', runId],
    enabled: !!runId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pull_requests')
        .select('*')
        .eq('run_id', runId!)
        .single()
      if (error) throw error
      return data
    },
  })
}

export function usePullRequests(issueId?: string) {
  return useQuery({
    queryKey: ['pull_requests', issueId],
    enabled: !!issueId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pull_requests')
        .select('*')
        .eq('issue_id', issueId!)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data
    },
  })
}
