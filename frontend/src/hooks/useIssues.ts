import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export function useIssues(repositoryId?: string) {
  return useQuery({
    queryKey: ['issues', repositoryId],
    enabled: !!repositoryId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('issues')
        .select('*')
        .eq('repository_id', repositoryId!)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data
    },
  })
}
