import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAnalysisStore } from '@/stores/analysisStore'
import { CodebaseGraph } from '@/components/CodebaseGraph'

const severityConfig: Record<string, { bg: string; text: string; border: string }> = {
  critical: { bg: 'bg-red-500/10', text: 'text-red-500', border: 'border-red-500/20' },
  high: { bg: 'bg-amber-500/10', text: 'text-amber-500', border: 'border-amber-500/20' },
  medium: { bg: 'bg-yellow-500/10', text: 'text-yellow-500', border: 'border-yellow-500/20' },
  low: { bg: 'bg-blue-500/10', text: 'text-blue-500', border: 'border-blue-500/20' },
  info: { bg: 'bg-blue-500/10', text: 'text-blue-500', border: 'border-blue-500/20' },
}

export default function IssueSummary() {
  const { issues, repoName, graph } = useAnalysisStore()
  const [activeFilter, setActiveFilter] = useState('all')

  const criticalCount = issues.filter(i => i.severity === 'critical').length
  const perfCount = issues.filter(i => i.classification === 'perf').length
  const securityCount = issues.filter(i => i.classification === 'security').length

  const filters = [
    { id: 'all', label: 'All Issues' },
    { id: 'critical', label: 'Critical', count: criticalCount, color: 'bg-red-500/20 text-red-500' },
    { id: 'perf', label: 'Performance', count: perfCount, color: 'bg-amber-500/20 text-amber-500' },
    { id: 'security', label: 'Security', count: securityCount, color: 'bg-blue-500/20 text-blue-500' },
  ]

  const filteredIssues = activeFilter === 'all'
    ? issues
    : issues.filter(i =>
        activeFilter === 'critical' ? i.severity === 'critical' :
        activeFilter === 'perf' ? i.classification === 'perf' :
        i.classification === 'security'
      )

  return (
    <div className="min-h-screen flex flex-col bg-[#111921]">
      {/* Header */}
      <header className="border-b border-slate-800 bg-[#111921] sticky top-0 z-50">
        <div className="flex items-center p-4 justify-between max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-3">
            <Link to="/repos" className="text-slate-400 hover:text-primary transition-colors">
              <span className="material-symbols-outlined">arrow_back</span>
            </Link>
            <div className="text-primary flex size-10 items-center justify-center bg-primary/10 rounded-lg">
              <span className="material-symbols-outlined">auto_awesome</span>
            </div>
            <div>
              <h2 className="text-lg font-bold leading-tight tracking-tight">GitSolve AI</h2>
              <p className="text-xs text-slate-400">{repoName}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center bg-slate-800 rounded-lg px-3 py-1.5 border border-slate-700">
              <span className="material-symbols-outlined text-slate-500 text-sm">search</span>
              <input className="bg-transparent border-none focus:ring-0 text-sm w-48 text-slate-200 ml-2" placeholder="Search issues..." type="text" />
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-6 animate-fade-in">
        {/* Title */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Issue Summary</h1>
          <p className="text-slate-400">AI-detected vulnerabilities and performance bottlenecks across your codebase.</p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Total Active Issues', value: issues.length.toString().padStart(2, '0'), change: `${issues.length} found`, icon: 'analytics', changeColor: 'text-emerald-500', iconColor: 'text-primary' },
            { label: 'Critical Alerts', value: criticalCount.toString().padStart(2, '0'), change: `${criticalCount} critical`, icon: 'error', changeColor: 'text-red-500', iconColor: 'text-red-500' },
            { label: 'Security Issues', value: securityCount.toString().padStart(2, '0'), change: `${securityCount} found`, icon: 'shield', changeColor: 'text-amber-500', iconColor: 'text-amber-500' },
          ].map((stat) => (
            <div key={stat.label} className="flex flex-col gap-2 rounded-xl p-6 bg-slate-800/50 border border-slate-800 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-slate-400 text-sm font-medium">{stat.label}</p>
                <span className={`material-symbols-outlined ${stat.iconColor}`}>{stat.icon}</span>
              </div>
              <div className="flex items-baseline gap-2">
                <p className="text-white tracking-tight text-3xl font-bold leading-tight">{stat.value}</p>
                <p className={`text-sm font-medium flex items-center ${stat.changeColor}`}>
                  <span className="material-symbols-outlined text-sm">check_circle</span>
                  {stat.change}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* No Issues State */}
        {issues.length === 0 && (
          <div className="text-center py-20">
            <span className="material-symbols-outlined text-6xl text-emerald-500/40 mb-4 block">check_circle</span>
            <h3 className="text-xl font-bold text-white mb-2">No Issues Detected</h3>
            <p className="text-slate-400 mb-6">Your code looks clean! The AI analysis did not find any significant issues.</p>
            <Link to="/repos" className="text-primary hover:text-primary/80 font-medium">← Back to Repositories</Link>
          </div>
        )}

        {/* Filters */}
        {issues.length > 0 && (
          <>
            <div className="flex flex-col md:flex-row gap-3 mb-6 items-center justify-between">
              <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
                {filters.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setActiveFilter(f.id)}
                    className={`flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-lg px-4 text-sm font-medium transition-colors ${
                      activeFilter === f.id
                        ? 'bg-primary text-white font-semibold'
                        : 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700'
                    }`}
                  >
                    <span>{f.label}</span>
                    {f.count !== undefined && f.count > 0 && (
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${f.color}`}>{f.count}</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Issue List */}
            <div className="space-y-4 mb-24">
              {filteredIssues.map((issue) => {
                const sv = severityConfig[issue.severity] || severityConfig.info
                return (
                  <div key={issue.id} className="group bg-slate-800/30 border border-slate-800 rounded-xl p-5 hover:border-primary/50 transition-all duration-300">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-3 mb-2">
                          <h3 className="text-lg font-bold text-white">{issue.title}</h3>
                          <span className={`${sv.bg} ${sv.text} border ${sv.border} px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider`}>
                            {issue.severity}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-400 mb-3">
                          <span className="material-symbols-outlined text-sm">folder</span>
                          <code className="bg-slate-900 px-2 py-0.5 rounded font-mono text-xs">{issue.file}{issue.line ? `:${issue.line}` : ''}</code>
                        </div>
                        <p className="text-slate-400 text-sm leading-relaxed max-w-3xl">{issue.description}</p>
                      </div>
                      <div className="flex items-center gap-3 lg:self-center">
                        <Link
                          to={`/fix/${issue.id}`}
                          className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-lg text-sm font-bold shadow-lg shadow-primary/20 transition-all"
                        >
                          <span className="material-symbols-outlined text-[18px]">auto_fix_high</span>
                          Resolve with AI
                        </Link>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Codebase Architecture Section */}
            {graph && graph.nodes && graph.nodes.length > 0 && (
              <div className="mt-10 mb-8">
                <div className="rounded-xl border border-primary/30 bg-[#161b22] overflow-hidden shadow-2xl">
                  <div className="bg-[#0d1117] px-6 py-4 border-b border-primary/20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-primary text-[24px]">account_tree</span>
                      <h3 className="text-lg font-bold text-white">Codebase Architecture</h3>
                    </div>
                    <span className="text-xs font-medium px-2 py-1 rounded bg-primary/20 text-primary border border-primary/30">
                      Interactive Map
                    </span>
                  </div>
                  <div className="p-2 bg-[#0a0f18]">
                    <CodebaseGraph graphData={graph} />
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
