import { useParams } from 'react-router-dom'
import { useAgentRuns, useResolveIssue } from '@/hooks/useAgentRun'
import { useRealtimeRun } from '@/hooks/useRealtimeRun'
import { useAgentStore } from '@/stores/agentStore'

export default function IssuePage() {
  const { issueId } = useParams<{ issueId: string }>()
  useAgentRuns(issueId)
  const { mutate: resolve, isPending } = useResolveIssue()
  const { activeRun } = useAgentStore()
  useRealtimeRun(activeRun?.id ?? null)

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold text-white">Issue Detail</h1>
      <button
        onClick={() => issueId && resolve(issueId)}
        disabled={isPending}
        className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 disabled:opacity-50"
      >
        {isPending ? 'Resolving...' : 'Resolve with AI'}
      </button>
      {/* Issue body, agent runs list, PR preview rendered here */}
    </div>
  )
}
