import { useRepositories } from '@/hooks/useRepositories'
import { useIssues } from '@/hooks/useIssues'
import { useRepoStore } from '@/stores/repoStore'

export default function Dashboard() {
  const { data: repos, isLoading } = useRepositories()
  const { selectedRepo } = useRepoStore()
  const { data: issues } = useIssues(selectedRepo?.id)

  if (isLoading) return <div className="p-8 text-slate-400">Loading repositories...</div>

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold text-white">Dashboard</h1>
      {/* Stats, repo list, and recent activity rendered here */}
    </div>
  )
}
