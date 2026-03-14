import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'

export function useDashboardAnalytics() {
  const { user } = useAuthStore()

  return useQuery({
    queryKey: ['dashboard-analytics', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      // Fetch overall stats
      const { data: statsData, error: statsError } = await supabase.rpc('get_dashboard_analytics', {
        p_user_id: user?.id
      })
      
      if (statsError) throw statsError

      // Fetch issue breakdown
      const { data: breakdownData, error: breakdownError } = await supabase.rpc('get_issue_types_breakdown', {
        p_user_id: user?.id
      })

      if (breakdownError) throw breakdownError

      return {
        stats: statsData?.[0] || {
          total_repos: 0,
          total_stars: 0,
          issues_detected: 0,
          issues_resolved: 0,
          ai_scans_run: 0
        },
        issueBreakdown: breakdownData || []
      }
    }
  })
}
