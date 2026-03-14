import { useParams } from 'react-router-dom'
import { useRepositories, useConnectRepository } from '@/hooks/useRepositories'
import { useRepoStore } from '@/stores/repoStore'

export default function RepositorySettings() {
  const { repoId } = useParams<{ repoId: string }>()
  const { data: repos } = useRepositories()
  const { mutate: connect, isPending } = useConnectRepository()
  const { selectedRepo, setSelectedRepo } = useRepoStore()

  const repo = repos?.find((r: { id: string }) => r.id === repoId) ?? selectedRepo

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold text-white">Repository Settings</h1>

      {/* Connection Status */}
      <div className="p-4 bg-slate-800 rounded-lg border border-slate-700">
        <h2 className="text-lg font-semibold text-white mb-3">Connection</h2>
        <div className="flex items-center gap-3">
          <span className={`w-2 h-2 rounded-full ${repo ? 'bg-green-400' : 'bg-slate-500'}`} />
          <span className="text-slate-300">{repo ? 'Connected' : 'Not connected'}</span>
        </div>
        {repo && (
          <p className="text-sm text-slate-400 mt-2">
            {repo.full_name} &middot; {repo.default_branch} &middot; {repo.language ?? 'Unknown'}
          </p>
        )}
      </div>

      {/* Settings */}
      <div className="p-4 bg-slate-800 rounded-lg border border-slate-700">
        <h2 className="text-lg font-semibold text-white mb-3">Auto-Resolve Settings</h2>
        <label className="flex items-center gap-3 text-slate-300">
          <input
            type="checkbox"
            className="w-4 h-4 rounded border-slate-600 bg-slate-700"
            defaultChecked={repo?.settings?.auto_pr ?? false}
          />
          Automatically create PRs for new issues
        </label>
        <div className="mt-4">
          <label className="block text-sm text-slate-400 mb-1">Confidence Threshold</label>
          <input
            type="range"
            min="0.5"
            max="1.0"
            step="0.05"
            defaultValue={repo?.settings?.confidence_threshold ?? 0.75}
            className="w-full"
          />
          <span className="text-sm text-slate-500">
            {repo?.settings?.confidence_threshold ?? 0.75}
          </span>
        </div>
      </div>

      {/* Webhook Status */}
      <div className="p-4 bg-slate-800 rounded-lg border border-slate-700">
        <h2 className="text-lg font-semibold text-white mb-3">Webhook</h2>
        <div className="flex items-center gap-3">
          <span className={`w-2 h-2 rounded-full ${repo?.webhook_id ? 'bg-green-400' : 'bg-yellow-400'}`} />
          <span className="text-slate-300">
            {repo?.webhook_id ? `Active (ID: ${repo.webhook_id})` : 'Not registered'}
          </span>
        </div>
      </div>

      {/* Indexing Progress */}
      <div className="p-4 bg-slate-800 rounded-lg border border-slate-700">
        <h2 className="text-lg font-semibold text-white mb-3">Code Indexing</h2>
        <div className="flex items-center gap-3">
          <span className={`w-2 h-2 rounded-full ${repo?.is_indexed ? 'bg-green-400' : 'bg-slate-500'}`} />
          <span className="text-slate-300">
            {repo?.is_indexed ? 'Indexed' : 'Not indexed'}
          </span>
        </div>
        {repo?.last_indexed_at && (
          <p className="text-xs text-slate-500 mt-1">
            Last indexed: {new Date(repo.last_indexed_at).toLocaleString()}
          </p>
        )}
      </div>
    </div>
  )
}
