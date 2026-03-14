import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export interface ActivityEvent {
  type: string
  title: string
  repo: string
  time: string
  date: Date
  icon: string
  color: string
  bg: string
}

function timeAgo(date: Date) {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)
  let interval = seconds / 31536000
  if (interval > 1) return Math.floor(interval) + ' years ago'
  interval = seconds / 2592000
  if (interval > 1) return Math.floor(interval) + ' months ago'
  interval = seconds / 86400
  if (interval > 1) return Math.floor(interval) + ' days ago'
  interval = seconds / 3600
  if (interval > 1) return Math.floor(interval) + ' hours ago'
  interval = seconds / 60
  if (interval >= 1) return Math.floor(interval) + ' minutes ago'
  return 'just now'
}

export function useRecentActivity() {
  return useQuery({
    queryKey: ['recent-activity'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Not authenticated')

      const username = session.user.user_metadata?.user_name || session.user.user_metadata?.preferred_username

      // Fetch from Supabase
      const { data: aiLogs } = await supabase
        .from('ai_activity_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20)

      const events: ActivityEvent[] = (aiLogs || []).map(log => {
        let title = 'AI Action'
        let icon = 'robot_2'
        let color = 'text-primary'
        let bg = 'bg-primary/10 border-primary/20'

        if (log.event_type === 'scan_completed') {
          title = 'Security Scan Completed'
          icon = 'shield'
          color = 'text-emerald-400'
          bg = 'bg-emerald-500/10 border-emerald-500/20'
        } else if (log.event_type === 'issue_detected') {
          title = `${log.details?.count || 'New'} Issues detected`
          icon = 'bug_report'
          color = 'text-red-400'
          bg = 'bg-red-500/10 border-red-500/20'
        } else if (log.event_type === 'pr_created') {
          title = `GitSolve AI opened PR #${log.details?.pr_number || ''}`
          icon = 'merge'
          color = 'text-purple-400'
          bg = 'bg-purple-500/10 border-purple-500/20'
        } else if (log.event_type === 'repo_connected') {
           title = 'Repository Connected'
           icon = 'add_link'
           color = 'text-primary'
           bg = 'bg-primary/10 border-primary/20'
        }

        const date = new Date(log.created_at)
        return {
          type: log.event_type,
          title,
          repo: log.repo_name,
          date,
          time: timeAgo(date),
          icon,
          color,
          bg
        }
      })

      // Fetch from GitHub
      if (username && session.provider_token) {
        try {
          const res = await fetch(`https://api.github.com/users/${username}/events`, {
            headers: {
              Authorization: `Bearer ${session.provider_token}`,
              Accept: 'application/vnd.github+json',
            }
          })
          if (res.ok) {
            const ghEvents = await res.json()
            ghEvents.slice(0, 20).forEach((ev: any) => {
              if (!['PushEvent', 'PullRequestEvent', 'IssuesEvent'].includes(ev.type)) return
              
              const date = new Date(ev.created_at)
              let title = ''
              let icon = ''
              let color = ''
              let bg = ''

              if (ev.type === 'PushEvent') {
                title = `${username} pushed to ${ev.payload.ref?.replace('refs/heads/', '') || 'branch'}`
                icon = 'commit'
                color = 'text-slate-300'
                bg = 'bg-slate-500/10 border-slate-500/20'
              } else if (ev.type === 'PullRequestEvent') {
                title = `${username} ${ev.payload.action} Pull Request #${ev.payload.pull_request?.number}`
                icon = ev.payload.action === 'closed' && ev.payload.pull_request?.merged ? 'check_circle' : 'merge'
                color = ev.payload.action === 'closed' && ev.payload.pull_request?.merged ? 'text-emerald-400' : 'text-purple-400'
                bg = ev.payload.action === 'closed' && ev.payload.pull_request?.merged ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-purple-500/10 border-purple-500/20'
              } else if (ev.type === 'IssuesEvent') {
                title = `${username} ${ev.payload.action} Issue #${ev.payload.issue?.number}`
                icon = 'bug_report'
                color = 'text-red-400'
                bg = 'bg-red-500/10 border-red-500/20'
              }

              events.push({
                type: ev.type,
                title,
                repo: ev.repo.name,
                date,
                time: timeAgo(date),
                icon,
                color,
                bg
              })
            })
          }
        } catch (e) {
            console.error('GitHub fetch failed:', e)
        }
      }

      // Sort combined
      events.sort((a, b) => b.date.getTime() - a.date.getTime())
      return events
    }
  })
}
