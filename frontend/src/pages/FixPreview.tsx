import { Link } from 'react-router-dom'

const diffLines = [
  { type: 'context', old: 39, new: 39, content: '  export async function getSession(id: string) {' },
  { type: 'context', old: 40, new: 40, content: '    try {' },
  { type: 'removed', old: 41, new: null, content: "    const user = await db.query(`SELECT * FROM users WHERE id = '${id}'`);" },
  { type: 'removed', old: 42, new: null, content: '    return user[0];' },
  { type: 'added', old: null, new: 41, content: '    const user = await db.user.findUnique({' },
  { type: 'added', old: null, new: 42, content: '      where: { id: id },' },
  { type: 'added', old: null, new: 43, content: '    });' },
  { type: 'added', old: null, new: 44, content: '    return user;' },
  { type: 'context', old: 43, new: 45, content: '    } catch (e) {' },
]

export default function FixPreview() {
  return (
    <div className="min-h-screen flex flex-col bg-[#0d1117]">
      {/* Header */}
      <header className="border-b border-primary/20 bg-[#0d1117]/80 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/issues" className="text-slate-400 hover:text-primary transition-colors">
              <span className="material-symbols-outlined">arrow_back</span>
            </Link>
            <div>
              <h1 className="text-sm font-semibold text-slate-400">PR #443</h1>
              <h2 className="text-lg font-bold leading-tight">Fix: Security vulnerability in auth.ts</h2>
            </div>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 rounded-lg border border-primary/30 text-primary font-medium hover:bg-primary/10 transition-colors flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">refresh</span>
              Regenerate Fix
            </button>
            <Link
              to="/pr-success"
              className="px-4 py-2 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 transition-shadow shadow-lg shadow-primary/20 flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[20px]">call_merge</span>
              Create Pull Request
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
        {/* Left Column: Diff Viewer */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-xl border border-primary/20 bg-[#161b22] overflow-hidden shadow-sm">
            {/* File Header */}
            <div className="bg-[#0d1117] px-4 py-3 border-b border-primary/20 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-slate-400 text-[20px]">description</span>
                <span className="code-font text-sm font-medium">src/lib/auth/session.ts</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium px-2 py-0.5 rounded bg-red-500/10 text-red-500">-2</span>
                <span className="text-xs font-medium px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500">+4</span>
              </div>
            </div>

            {/* Diff Content */}
            <div className="code-font text-[13px] leading-relaxed overflow-x-auto">
              {diffLines.map((line, i) => {
                if (line.type === 'removed') {
                  return (
                    <div key={i} className="flex bg-red-500/10 border-l-4 border-red-500/50">
                      <div className="w-12 flex-shrink-0 text-right pr-4 text-red-500/60 select-none bg-red-500/5">{line.old}</div>
                      <div className="w-12 flex-shrink-0 text-right pr-4 text-slate-500 select-none bg-red-500/5"></div>
                      <div className="px-4 text-red-200"><span className="select-none mr-2">-</span>{line.content}</div>
                    </div>
                  )
                }
                if (line.type === 'added') {
                  return (
                    <div key={i} className="flex bg-emerald-500/10 border-l-4 border-emerald-500/50">
                      <div className="w-12 flex-shrink-0 text-right pr-4 text-slate-500 select-none bg-emerald-500/5"></div>
                      <div className="w-12 flex-shrink-0 text-right pr-4 text-emerald-500/60 select-none bg-emerald-500/5">{line.new}</div>
                      <div className="px-4 text-emerald-200"><span className="select-none mr-2">+</span>{line.content}</div>
                    </div>
                  )
                }
                return (
                  <div key={i} className="flex hover:bg-primary/5">
                    <div className="w-12 flex-shrink-0 text-right pr-4 text-slate-500 select-none bg-white/5">{line.old}</div>
                    <div className="w-12 flex-shrink-0 text-right pr-4 text-slate-500 select-none bg-white/5">{line.new}</div>
                    <div className="px-4 text-slate-400">{line.content}</div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Right Column: AI Explanation Panel */}
        <div className="space-y-6">
          <div className="rounded-xl bg-primary/10 border border-primary/20 p-6 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
                <span className="material-symbols-outlined text-white text-[20px]">psychology</span>
              </div>
              <h3 className="font-bold text-slate-100">AI Explanation</h3>
            </div>
            <p className="text-sm leading-relaxed text-slate-300">
              I detected a potential <span className="text-primary font-semibold">SQL Injection</span> vulnerability on line 41. The original code was using string interpolation for database queries, which is unsafe.
            </p>
            <div className="space-y-3">
              {[
                'Migrated to Prisma ORM for type-safe queries.',
                'Implemented automatic parameter sanitization.',
                'Fixed edge case where user could be undefined.',
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-emerald-500 text-[20px]">check_circle</span>
                  <p className="text-xs text-slate-400">{item}</p>
                </div>
              ))}
            </div>
            <hr className="border-primary/20" />
            <div className="flex flex-col gap-2">
              <span className="text-[10px] uppercase tracking-wider font-bold text-slate-500">Confidence Score</span>
              <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                <div className="bg-primary h-full w-[94%] rounded-full"></div>
              </div>
              <span className="text-xs text-right font-mono text-primary">94%</span>
            </div>
          </div>

          {/* Quick Actions Card */}
          <div className="rounded-xl border border-primary/20 bg-[#161b22] p-6">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">rate_review</span>
              Quick Actions
            </h3>
            <div className="space-y-3">
              {[
                { title: 'Apply and Commit', desc: 'Fast-track to main branch', danger: false },
                { title: 'Request Changes', desc: 'Modify the AI prompt', danger: false },
                { title: 'Dismiss Fix', desc: 'Reject AI suggestions', danger: true },
              ].map((action) => (
                <button key={action.title} className={`w-full text-left px-4 py-3 rounded-lg border border-transparent transition-all group ${
                  action.danger ? 'hover:bg-red-500/5 hover:border-red-500/20' : 'hover:bg-primary/5 hover:border-primary/20'
                }`}>
                  <div className={`text-sm font-semibold transition-colors ${
                    action.danger ? 'group-hover:text-red-500' : 'group-hover:text-primary'
                  }`}>{action.title}</div>
                  <div className="text-xs text-slate-500">{action.desc}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
