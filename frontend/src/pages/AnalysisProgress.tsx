import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAnalysisStore } from '@/stores/analysisStore'

export default function AnalysisProgress() {
  const { status, repoName, metrics, agentSteps, error } = useAnalysisStore()
  const navigate = useNavigate()

  // Compute progress percentage from agent steps
  const completedSteps = agentSteps.filter(s => s.status === 'success').length
  const totalSteps = agentSteps.length || 1
  const progress = status === 'done' ? 100 : Math.round((completedSteps / totalSteps) * 90)

  // Get current running agent name
  const currentAgent = agentSteps.find(s => s.status === 'running')?.agent_name || 
    (status === 'done' ? 'Analysis Complete' : 'Initializing...')

  // Auto-navigate when done
  useEffect(() => {
    if (status === 'done') {
      const timer = setTimeout(() => navigate('/issues'), 2000)
      return () => clearTimeout(timer)
    }
  }, [status, navigate])

  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden bg-[#111921]">
      {/* Header */}
      <header className="flex items-center p-4 border-b border-slate-800 justify-between sticky top-0 z-10 bg-[#111921]">
        <div className="flex items-center gap-4">
          <Link to="/repos" className="text-slate-400 hover:text-primary transition-colors">
            <span className="material-symbols-outlined">arrow_back</span>
          </Link>
          <div>
            <h2 className="text-lg font-bold leading-tight tracking-tight">Repository Analysis</h2>
            <p className="text-xs text-slate-400">Project: {repoName || 'loading...'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {status !== 'done' && status !== 'error' && (
            <>
              <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse"></span>
              <span className="text-xs font-medium text-primary">Live Scan</span>
            </>
          )}
          {status === 'done' && (
            <>
              <span className="flex h-2 w-2 rounded-full bg-emerald-500"></span>
              <span className="text-xs font-medium text-emerald-500">Complete</span>
            </>
          )}
          {status === 'empty_repo' && (
            <>
              <span className="flex h-2 w-2 rounded-full bg-amber-500"></span>
              <span className="text-xs font-medium text-amber-500">Empty</span>
            </>
          )}
          {status === 'error' && (
            <>
              <span className="flex h-2 w-2 rounded-full bg-red-500"></span>
              <span className="text-xs font-medium text-red-500">Error</span>
            </>
          )}
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full p-4 lg:p-8 animate-fade-in">
        {/* Error State */}
        {status === 'error' && (
          <div className="mb-8 bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center">
            <span className="material-symbols-outlined text-red-500 text-4xl mb-3 block">error</span>
            <h3 className="text-lg font-bold text-red-400 mb-2">Analysis Failed</h3>
            <p className="text-slate-400 text-sm mb-4">{error}</p>
            <Link to="/repos" className="text-primary hover:text-primary/80 font-medium text-sm">
              ← Back to Repositories
            </Link>
          </div>
        )}

        {/* Empty Repo State */}
        {status === 'empty_repo' && (
          <div className="mb-8 bg-amber-500/10 border border-amber-500/20 rounded-xl p-6 text-center">
            <span className="material-symbols-outlined text-amber-500 text-4xl mb-3 block">folder_off</span>
            <h3 className="text-lg font-bold text-amber-500 mb-2">No code found to analyze.</h3>
            <p className="text-slate-400 text-sm mb-4">{error || 'This repository is empty.'}</p>
            <Link to="/repos" className="text-primary hover:text-primary/80 font-medium text-sm">
              ← Try Another Repository
            </Link>
          </div>
        )}

        {/* Progress Bar */}
        <section className="mb-8">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">memory</span>
                <p className="text-lg font-semibold">
                  {status === 'done' ? 'Analysis Complete' : status === 'error' ? 'Analysis Failed' : status === 'empty_repo' ? 'Repository Empty' : 'Analysis in Progress'}
                </p>
              </div>
              <p className={`text-xl font-bold ${status === 'done' ? 'text-emerald-500' : status === 'empty_repo' ? 'text-amber-500' : status === 'error' ? 'text-red-500' : 'text-primary'}`}>
                {progress}%
              </p>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-1000 ${
                  status === 'done' ? 'bg-emerald-500' : status === 'empty_repo' ? 'bg-amber-500' : status === 'error' ? 'bg-red-500' : 'bg-primary animate-progress-pulse'
                }`}
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className="flex items-center gap-2 mt-4 text-slate-400">
              <span className="material-symbols-outlined text-sm">
                {status === 'done' ? 'check_circle' : status === 'error' ? 'error' : 'sync'}
              </span>
              <p className="text-sm">
                Currently running: <span className="text-slate-100 font-medium">{currentAgent}</span>
              </p>
            </div>
          </div>
        </section>

        {/* Stats Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {[
            { label: 'Files Scanned', value: metrics.filesScanned.toLocaleString(), change: `${metrics.filesScanned}`, up: true },
            { label: 'Functions Analyzed', value: metrics.functionsAnalyzed.toLocaleString(), change: `${metrics.functionsAnalyzed}`, up: true },
            { label: 'Issues Detected', value: metrics.issuesDetected.toString(), change: `${metrics.issuesDetected}`, warning: true },
            { label: 'Security Risks', value: metrics.securityRisks.toString(), change: `${metrics.securityRisks}`, up: false },
          ].map((stat) => (
            <div key={stat.label} className="flex flex-col gap-2 rounded-xl p-6 bg-slate-900/50 border border-slate-800">
              <p className="text-slate-400 text-sm font-medium">{stat.label}</p>
              <div className="flex items-end justify-between">
                <p className="text-3xl font-bold leading-tight">{stat.value}</p>
                {status === 'done' && (
                  <p className={`text-sm font-bold flex items-center gap-1 ${
                    stat.warning ? 'text-amber-500' : 'text-emerald-500'
                  }`}>
                    <span className="material-symbols-outlined text-xs">
                      {stat.warning ? 'warning' : 'check_circle'}
                    </span>
                  </p>
                )}
              </div>
            </div>
          ))}
        </section>

        {/* AI Agent Timeline */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold tracking-tight">AI Agent Timeline</h3>
            <span className="text-xs font-medium uppercase tracking-widest text-slate-500 px-2 py-1 bg-slate-800 rounded">Sequence View</span>
          </div>
          <div className="relative space-y-6 pl-8 before:absolute before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-gradient-to-b before:from-primary before:via-primary/50 before:to-slate-800">
            {agentSteps.map((step) => {
              const isActive = step.status === 'running'
              const isDone = step.status === 'success'
              const isFailed = step.status === 'failed'

              return (
                <div key={step.id} className="relative">
                  {/* Timeline Node */}
                  <div className={`absolute -left-4 top-4 flex items-center justify-center w-8 h-8 rounded-full border shadow shrink-0 ${
                    isActive
                      ? 'border-primary/20 bg-primary text-white border-4'
                      : isDone
                        ? 'border-slate-700 bg-emerald-500 text-white'
                        : isFailed
                          ? 'border-slate-700 bg-red-500 text-white'
                          : 'border-slate-700 bg-slate-800 text-slate-400'
                  }`}>
                    {isActive ? (
                      <span className="material-symbols-outlined text-sm animate-spin">smart_toy</span>
                    ) : isDone ? (
                      <span className="material-symbols-outlined text-sm">check</span>
                    ) : isFailed ? (
                      <span className="material-symbols-outlined text-sm">close</span>
                    ) : (
                      <span className="material-symbols-outlined text-sm">schedule</span>
                    )}
                  </div>

                  {/* Step Card */}
                  <div className={`ml-6 p-4 rounded-xl border shadow-sm ${
                    isActive
                      ? 'border-2 border-primary bg-primary/5 shadow-xl shadow-primary/10'
                      : isFailed
                        ? 'border-red-500/30 bg-red-500/5'
                        : 'border-slate-800 bg-slate-900/30'
                  }`}>
                    <div className="flex items-center justify-between space-x-2 mb-1">
                      <div className={`font-bold ${isActive ? 'text-primary' : isFailed ? 'text-red-400' : 'text-slate-100'}`}>
                        {step.agent_name}
                      </div>
                      <time className={`text-xs font-medium ${
                        isActive ? 'font-bold text-primary' : isDone ? 'text-emerald-500' : isFailed ? 'text-red-400' : 'text-slate-500'
                      }`}>
                        {isActive ? 'ACTIVE' : isDone ? '✓ Done' : isFailed ? '✗ Failed' : 'Pending'}
                      </time>
                    </div>
                    <div className={`text-sm ${isActive ? 'text-slate-100 font-medium' : 'text-slate-400'}`}>
                      {step.description}
                    </div>
                    {isActive && (
                      <div className="mt-3 flex gap-2">
                        <div className="h-1 flex-1 bg-primary/30 rounded-full overflow-hidden">
                          <div className="bg-primary h-full w-[60%] rounded-full animate-pulse"></div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* View Results Button */}
          {status === 'done' && (
            <div className="mt-8 flex justify-center">
              <Link
                to="/issues"
                className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-lg font-bold transition-all shadow-lg shadow-primary/20"
              >
                <span className="material-symbols-outlined">analytics</span>
                View Results ({metrics.issuesDetected} issues found)
              </Link>
            </div>
          )}

          {status === 'done' && (
            <p className="text-center text-slate-500 text-xs mt-4 animate-pulse">
              Auto-redirecting to results in 2 seconds...
            </p>
          )}
        </section>
      </main>
    </div>
  )
}
