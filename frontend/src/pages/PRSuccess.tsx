import { Link } from 'react-router-dom'
import { useAnalysisStore } from '@/stores/analysisStore'

export default function PRSuccess() {
  const { prResult, repoName } = useAnalysisStore()

  // Fallback data if navigated directly
  const pr = prResult || {
    pr_number: 0,
    pr_url: '#',
    branch_name: 'unknown',
    title: 'AI-generated fix',
    repository_name: repoName || 'unknown',
    success: false,
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-[#111921]">
      {/* Header */}
      <header className="flex items-center p-4 border-b border-slate-800 justify-between">
        <div className="text-primary flex size-10 shrink-0 items-center justify-center">
          <span className="material-symbols-outlined text-3xl">check_circle</span>
        </div>
        <h2 className="text-white text-lg font-bold leading-tight tracking-tight flex-1 text-center pr-10">Pull Request Created</h2>
        <div className="size-10"></div>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full animate-fade-in">
        {/* Success Hero Section */}
        <section className="flex flex-col px-4 py-8">
          <div className="flex flex-col items-center gap-6">
            {/* Success Visual */}
            <div className="bg-primary/10 flex items-center justify-center rounded-xl w-full max-w-[400px] aspect-video border border-primary/20 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-blue-600/20 to-purple-600/20"></div>
              <div className="relative z-10 flex flex-col items-center gap-3">
                <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-emerald-400 text-5xl">check_circle</span>
                </div>
                <span className="text-xs font-mono text-slate-400">PR #{pr.pr_number}</span>
              </div>
            </div>

            <div className="flex max-w-[480px] flex-col items-center gap-2">
              <h1 className="text-white text-2xl font-bold leading-tight tracking-tight text-center">Success!</h1>
              <p className="text-slate-400 text-base font-normal leading-normal max-w-[480px] text-center">
                Your pull request has been successfully created and is ready for review by your team.
              </p>
            </div>

            <div className="flex flex-wrap gap-3 justify-center">
              <a
                href={pr.pr_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-w-[140px] cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-lg h-11 px-6 bg-primary text-white text-sm font-bold leading-normal tracking-wide transition-colors hover:bg-primary/90"
              >
                <span className="material-symbols-outlined text-sm">open_in_new</span>
                <span className="truncate">View on GitHub</span>
              </a>
              <button
                onClick={() => navigator.clipboard.writeText(pr.pr_url)}
                className="flex min-w-[140px] cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-lg h-11 px-6 bg-slate-800 text-white text-sm font-bold leading-normal tracking-wide transition-colors hover:bg-slate-700"
              >
                <span className="truncate">Copy PR Link</span>
              </button>
            </div>
          </div>
        </section>

        {/* PR Details Section */}
        <section className="px-4 py-4">
          <h3 className="text-white text-lg font-bold leading-tight tracking-tight pb-4">PR Details</h3>
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 space-y-1">
            {[
              { label: 'Repository', value: pr.repository_name, icon: 'inventory_2' },
              { label: 'Branch', value: pr.branch_name, icon: 'account_tree', isCode: true },
              { label: 'PR Title', value: pr.title, icon: undefined, isBold: true },
              { label: 'PR Number', value: `#${pr.pr_number}`, icon: undefined },
            ].map((row, i) => (
              <div key={i} className={`flex justify-between items-center gap-x-6 py-2 ${
                i < 3 ? 'border-b border-slate-800/50' : ''
              }`}>
                <p className="text-slate-400 text-sm font-medium">{row.label}</p>
                <div className="flex items-center gap-2">
                  {row.icon && <span className="material-symbols-outlined text-xs text-slate-400">{row.icon}</span>}
                  {row.isCode ? (
                    <code className="bg-slate-800 px-2 py-0.5 rounded text-primary text-xs font-mono">{row.value}</code>
                  ) : (
                    <p className={`text-sm text-right ${row.isBold ? 'text-white font-bold' : 'text-white font-semibold'}`}>
                      {row.value}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* AI Summary Card */}
        <section className="p-4">
          <div className="flex flex-col items-start justify-between gap-6 rounded-xl border border-primary/30 bg-primary/10 p-6">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-primary">
                <span className="material-symbols-outlined text-xl">auto_awesome</span>
                <p className="text-base font-bold leading-tight">AI Summary</p>
              </div>
              <p className="text-slate-300 text-sm font-normal leading-relaxed">
                This pull request was automatically generated by GitSolve AI. It contains a targeted fix for the detected issue. 
                Please review the changes and merge when ready.
              </p>
            </div>
          </div>
        </section>

        {/* Back to Dashboard */}
        <section className="p-4 flex justify-center">
          <Link
            to="/repos"
            className="flex items-center gap-2 text-slate-400 hover:text-primary transition-colors font-medium"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Back to Dashboard
          </Link>
        </section>
      </main>

      <footer className="p-8 text-center">
        <p className="text-slate-600 text-xs">
          Generated with ❤️ by GitSolve AI
        </p>
      </footer>
    </div>
  )
}
