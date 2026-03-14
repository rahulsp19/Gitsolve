import { useParams } from 'react-router-dom'
import { useAgentStore } from '@/stores/agentStore'
import { usePullRequest } from '@/hooks/usePullRequests'

export default function PRPreview() {
  const { runId } = useParams<{ runId: string }>()
  const { activeRun } = useAgentStore()
  const { data: pr, isLoading } = usePullRequest(runId)

  if (isLoading) return <div className="p-8 text-slate-400">Loading PR preview...</div>

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold text-white">Pull Request Preview</h1>

      {/* PR Description */}
      <div className="p-4 bg-slate-800 rounded-lg border border-slate-700">
        <h2 className="text-lg font-semibold text-white mb-2">{pr?.title ?? 'Untitled PR'}</h2>
        <div className="text-sm text-slate-300 whitespace-pre-wrap">
          {pr?.body ?? 'No description generated yet.'}
        </div>
      </div>

      {/* Files Changed */}
      {pr?.files_changed && pr.files_changed.length > 0 && (
        <div className="p-4 bg-slate-800 rounded-lg border border-slate-700">
          <h2 className="text-lg font-semibold text-white mb-3">
            Files Changed ({pr.files_changed.length})
          </h2>
          <ul className="space-y-1">
            {pr.files_changed.map((file: string) => (
              <li key={file} className="text-sm font-mono text-slate-300">
                {file}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Diff Viewer */}
      {pr?.diff && (
        <div className="p-4 bg-slate-800 rounded-lg border border-slate-700">
          <h2 className="text-lg font-semibold text-white mb-3">Diff</h2>
          <pre className="text-xs font-mono text-slate-300 overflow-x-auto whitespace-pre">
            {pr.diff}
          </pre>
        </div>
      )}

      {/* Approval Actions */}
      <div className="flex gap-3">
        {pr?.github_pr_url ? (
          <a
            href={pr.github_pr_url}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600"
          >
            View on GitHub
          </a>
        ) : (
          <>
            <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
              Approve &amp; Submit PR
            </button>
            <button className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600">
              Request Changes
            </button>
            <button className="px-4 py-2 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30">
              Reject
            </button>
          </>
        )}
      </div>
    </div>
  )
}
