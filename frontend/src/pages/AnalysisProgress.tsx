import { Link } from 'react-router-dom'
import { mockAgentSteps, mockAnalysisStats } from '@/lib/mockData'

export default function AnalysisProgress() {
  const stats = mockAnalysisStats

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
            <p className="text-xs text-slate-400">Project: nexus-dashboard</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse"></span>
          <span className="text-xs font-medium text-primary">Live Scan</span>
          <button className="ml-4 p-2 rounded-lg hover:bg-slate-800 transition-colors">
            <span className="material-symbols-outlined text-slate-400">more_horiz</span>
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full p-4 lg:p-8 animate-fade-in">
        {/* Progress Bar */}
        <section className="mb-8">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">memory</span>
                <p className="text-lg font-semibold">Analysis in Progress</p>
              </div>
              <p className="text-primary text-xl font-bold">{stats.progress}%</p>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
              <div
                className="bg-primary h-full rounded-full transition-all duration-500 animate-progress-pulse"
                style={{ width: `${stats.progress}%` }}
              ></div>
            </div>
            <div className="flex items-center gap-2 mt-4 text-slate-400">
              <span className="material-symbols-outlined text-sm">sync</span>
              <p className="text-sm">
                Currently running: <span className="text-slate-100 font-medium">Code Generation Agent...</span>
              </p>
            </div>
          </div>
        </section>

        {/* Stats Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {[
            { label: 'Files Scanned', value: stats.filesScanned.toLocaleString(), change: '+120', up: true },
            { label: 'Functions Analyzed', value: stats.functionsAnalyzed.toLocaleString(), change: '+450', up: true },
            { label: 'Issues Detected', value: stats.issuesDetected.toString(), change: '+3', warning: true },
            { label: 'Security Risks', value: stats.securityRisks.toString(), change: '-2', up: false },
          ].map((stat) => (
            <div key={stat.label} className="flex flex-col gap-2 rounded-xl p-6 bg-slate-900/50 border border-slate-800">
              <p className="text-slate-400 text-sm font-medium">{stat.label}</p>
              <div className="flex items-end justify-between">
                <p className="text-3xl font-bold leading-tight">{stat.value}</p>
                <p className={`text-sm font-bold flex items-center gap-1 ${
                  stat.warning ? 'text-amber-500' : stat.up ? 'text-emerald-500' : 'text-emerald-500'
                }`}>
                  <span className="material-symbols-outlined text-xs">
                    {stat.warning ? 'warning' : stat.up ? 'trending_up' : 'trending_down'}
                  </span>
                  {stat.change}
                </p>
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
            {mockAgentSteps.map((step) => {
              const isActive = step.status === 'running'
              const isDone = step.status === 'success'

              return (
                <div key={step.id} className="relative">
                  {/* Timeline Node */}
                  <div className={`absolute -left-4 top-4 flex items-center justify-center w-8 h-8 rounded-full border shadow shrink-0 ${
                    isActive
                      ? 'border-primary/20 bg-primary text-white border-4'
                      : isDone
                        ? 'border-slate-700 bg-emerald-500 text-white'
                        : 'border-slate-700 bg-slate-800 text-slate-400'
                  }`}>
                    {isActive ? (
                      <span className="material-symbols-outlined text-sm animate-spin">smart_toy</span>
                    ) : isDone ? (
                      <span className="material-symbols-outlined text-sm">check</span>
                    ) : (
                      <span className="material-symbols-outlined text-sm">schedule</span>
                    )}
                  </div>

                  {/* Step Card */}
                  <div className={`ml-6 p-4 rounded-xl border shadow-sm ${
                    isActive
                      ? 'border-2 border-primary bg-primary/5 shadow-xl shadow-primary/10'
                      : 'border-slate-800 bg-slate-900/30'
                  }`}>
                    <div className="flex items-center justify-between space-x-2 mb-1">
                      <div className={`font-bold ${isActive ? 'text-primary' : 'text-slate-100'}`}>
                        {step.agent_name}
                      </div>
                      <time className={`text-xs font-medium ${isActive ? 'font-bold text-primary' : 'text-primary'}`}>
                        {isActive ? 'ACTIVE' : step.completed_at}
                      </time>
                    </div>
                    <div className={`text-sm ${isActive ? 'text-slate-100 font-medium' : 'text-slate-400'}`}>
                      {step.description}
                    </div>
                    {isActive && (
                      <div className="mt-3 flex gap-2">
                        <div className="h-1 flex-1 bg-primary/30 rounded-full overflow-hidden">
                          <div className="bg-primary h-full w-[40%] rounded-full"></div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* View Results Button */}
          <div className="mt-8 flex justify-center">
            <Link
              to="/issues"
              className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-lg font-bold transition-all shadow-lg shadow-primary/20"
            >
              <span className="material-symbols-outlined">analytics</span>
              View Results
            </Link>
          </div>
        </section>
      </main>
    </div>
  )
}
