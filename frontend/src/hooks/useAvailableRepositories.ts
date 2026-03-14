import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export function useAvailableRepositories() {
  return useQuery({
    queryKey: ['available-github-repositories'],
    queryFn: async () => {
      // 1. Get the current user session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError || !session) {
        throw new Error('Not authenticated')
      }

      // 2. We need the provider token from the session to call GitHub
      const providerToken = session.provider_token
      
      if (!providerToken) {
        throw new Error('No GitHub provider token found. Please sign in again.')
      }

      // 3. Fetch from GitHub API
      const response = await fetch('https://api.github.com/user/repos?sort=updated&per_page=100', {
        headers: {
          Authorization: `Bearer ${providerToken}`,
          Accept: 'application/vnd.github+json',
        }
      })

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status} ${response.statusText}`)
      }

      const repos = await response.json()
      return repos
    },
  })
}
