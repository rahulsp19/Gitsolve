import { useEffect, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useAnalysisStore } from '@/stores/analysisStore'
import { CodebaseGraph } from '@/components/CodebaseGraph'
import { GitSolveReferences } from '@/components/GitSolveReferences'

export default function FixPreview() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { issues, currentFix, fixLoading, resolveIssue, createPR, prLoading, prResult, graph } = useAnalysisStore()

  const issue = issues.find(i => i.id === id)
  const [activeTab, setActiveTab] = useState<'fix' | 'references' | 'architecture'>('fix')

  // Auto-trigger fix generation on mount
  useEffect(() => {
    if (issue && !currentFix && !fixLoading) {
      resolveIssue(issue)
    }
  }, [issue?.id])

  // Navigate to PR success page when PR is created
  useEffect(() => {
    if (prResult) {
      navigate('/pr-success')
    }
  }, [prResult, navigate])

  if (!issue) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0d1117]">
        <div className="text-center">
          <span className="material-symbols-outlined text-6xl text-slate-700 mb-4 block">error</span>
          <h2 className="text-xl font-bold text-white mb-2">Issue Not Found</h2>
          <p className="text-slate-400 mb-4">The issue may have been resolved or doesn't exist.</p>
          <Link to="/issues" className="text-primary hover:text-primary/80 font-medium">← Back to Issues</Link>
        </div>
      </div>
    )
  }

  // Parse diff lines from original and fixed code
  const diffLines = buildDiffLines(currentFix?.originalCode || '', currentFix?.fixedCode || '')

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
              <h1 className="text-sm font-semibold text-slate-400">AI Fix Preview</h1>
              <h2 className="text-lg font-bold leading-tight">{issue.title}</h2>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => resolveIssue(issue)}
              disabled={fixLoading}
              className="px-4 py-2 rounded-lg border border-primary/30 text-primary font-medium hover:bg-primary/10 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[20px]">refresh</span>
              Regenerate Fix
            </button>
            <button
              onClick={() => issue && createPR(issue)}
              disabled={!currentFix || prLoading}
              className="px-4 py-2 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 transition-shadow shadow-lg shadow-primary/20 flex items-center gap-2 disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[20px]">call_merge</span>
              {prLoading ? 'Creating PR...' : 'Create Pull Request'}
            </button>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="border-b border-slate-800 bg-[#0d1117] sticky top-16 z-10">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex gap-1">
            {[
              { key: 'fix',          label: 'Fix Preview',  icon: 'code' },
              { key: 'references',   label: 'References',   icon: 'manage_search' },
              { key: 'architecture', label: 'Architecture', icon: 'account_tree' },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as typeof activeTab)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? 'border-primary text-primary'
                    : 'border-transparent text-slate-400 hover:text-slate-100'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Fix Preview Tab */}
      {activeTab === 'fix' && (
        <main className="flex-1 max-w-7xl mx-auto w-full p-4 grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
          {/* Left Column: Diff Viewer */}
          <div className="lg:col-span-2 space-y-4">
            {fixLoading ? (
              <div className="rounded-xl border border-primary/20 bg-[#161b22] p-12 text-center">
                <span className="material-symbols-outlined text-primary text-5xl animate-spin mb-4 block">smart_toy</span>
                <h3 className="text-lg font-bold text-white mb-2">Generating AI Fix...</h3>
                <p className="text-slate-400 text-sm">Analyzing the issue and generating optimized code fix</p>
              </div>
            ) : currentFix ? (
              <div className="rounded-xl border border-primary/20 bg-[#161b22] overflow-hidden shadow-sm">
                {/* File Header */}
                <div className="bg-[#0d1117] px-4 py-3 border-b border-primary/20 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-slate-400 text-[20px]">description</span>
                    <span className="code-font text-sm font-medium">{issue.file}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500">
                      Confidence: {Math.round((currentFix.confidence || 0.85) * 100)}%
                    </span>
                  </div>
                </div>

                {/* Diff Content */}
                <div className="code-font text-[13px] leading-relaxed overflow-x-auto">
                  {diffLines.map((line, i) => {
                    if (line.type === 'removed') {
                      return (
                        <div key={i} className="flex bg-red-500/10 border-l-4 border-red-500/50">
                          <div className="w-12 flex-shrink-0 text-right pr-4 text-red-500/60 select-none bg-red-500/5">{line.lineNum}</div>
                          <div className="px-4 text-red-200"><span className="select-none mr-2">-</span>{line.content}</div>
                        </div>
                      )
                    }
                    if (line.type === 'added') {
                      return (
                        <div key={i} className="flex bg-emerald-500/10 border-l-4 border-emerald-500/50">
                          <div className="w-12 flex-shrink-0 text-right pr-4 text-emerald-500/60 select-none bg-emerald-500/5">{line.lineNum}</div>
                          <div className="px-4 text-emerald-200"><span className="select-none mr-2">+</span>{line.content}</div>
                        </div>
                      )
                    }
                    return (
                      <div key={i} className="flex hover:bg-primary/5">
                        <div className="w-12 flex-shrink-0 text-right pr-4 text-slate-500 select-none bg-white/5">{line.lineNum}</div>
                        <div className="px-4 text-slate-400"> {line.content}</div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-slate-800 bg-[#161b22] p-12 text-center">
                <span className="material-symbols-outlined text-slate-600 text-5xl mb-4 block">code</span>
                <h3 className="text-lg font-bold text-white mb-2">No Fix Generated Yet</h3>
                <p className="text-slate-400 text-sm">Click "Regenerate Fix" to start</p>
              </div>
            )}
          </div>

          {/* Right Column: AI Explanation Panel */}
          <div className="space-y-6">
            <div className="rounded-xl bg-primary/10 border border-primary/20 p-6 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                {/* GitSolve Logo */}
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
                  <svg width="18" height="18" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="60" cy="140" r="18" fill="white"/>
                    <circle cx="100" cy="60" r="18" fill="white"/>
                    <circle cx="140" cy="140" r="18" fill="white"/>
                    <circle cx="100" cy="140" r="12" fill="white" opacity="0.7"/>
                    <line x1="60" y1="140" x2="100" y2="60" stroke="white" strokeWidth="8" strokeLinecap="round"/>
                    <line x1="100" y1="60" x2="140" y2="140" stroke="white" strokeWidth="8" strokeLinecap="round"/>
                    <line x1="60" y1="140" x2="140" y2="140" stroke="white" strokeWidth="6" strokeLinecap="round" opacity="0.6"/>
                  </svg>
                </div>
                <h3 className="font-bold text-slate-100">GitSolve Explanation</h3>
              </div>
              <p className="text-sm leading-relaxed text-slate-300">
                {currentFix?.explanation || (fixLoading ? 'Generating explanation...' : `Detected a potential ${issue.type} issue in ${issue.file}. ${issue.description}`)}
              </p>
              {currentFix?.changes && currentFix.changes.length > 0 && (
                <div className="space-y-3">
                  {currentFix.changes.map((item, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="material-symbols-outlined text-emerald-500 text-[20px]">check_circle</span>
                      <p className="text-xs text-slate-400">{item}</p>
                    </div>
                  ))}
                </div>
              )}
              {currentFix && (
                <>
                  <hr className="border-primary/20" />
                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] uppercase tracking-wider font-bold text-slate-500">Confidence Score</span>
                    <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                      <div className="bg-primary h-full rounded-full" style={{ width: `${(currentFix.confidence || 0.85) * 100}%` }}></div>
                    </div>
                    <span className="text-xs text-right font-mono text-primary">{Math.round((currentFix.confidence || 0.85) * 100)}%</span>
                  </div>
                </>
              )}
            </div>

            {/* Issue Details Card */}
            <div className="rounded-xl border border-primary/20 bg-[#161b22] p-6">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">info</span>
                Issue Details
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Type</span>
                  <span className="text-white font-medium">{issue.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Severity</span>
                  <span className={`font-medium ${issue.severity === 'critical' ? 'text-red-400' : issue.severity === 'high' ? 'text-amber-400' : 'text-yellow-400'}`}>
                    {issue.severity}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">File</span>
                  <code className="text-xs font-mono text-primary">{issue.file}</code>
                </div>
                {issue.line && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Line</span>
                    <span className="text-white">{issue.line}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      )}

      {/* References Tab */}
      {activeTab === 'references' && (
        <main className="flex-1 max-w-7xl mx-auto w-full p-4 lg:p-8 animate-fade-in">
          <GitSolveReferences
            issueType={issue.type || issue.title}
            language={
              issue.file?.endsWith('.py') ? 'python'
              : issue.file?.endsWith('.go') ? 'go'
              : issue.file?.endsWith('.java') ? 'java'
              : issue.file?.endsWith('.rb') ? 'ruby'
              : issue.file?.endsWith('.rs') ? 'rust'
              : issue.file?.endsWith('.c') || issue.file?.endsWith('.cpp') ? 'c'
              : 'javascript'
            }
          />
        </main>
      )}

      {/* Architecture Tab */}
      {activeTab === 'architecture' && (
        <main className="flex-1 max-w-7xl mx-auto w-full p-4 lg:p-8 animate-fade-in">
          <div className="rounded-xl border border-primary/30 bg-[#161b22] overflow-hidden shadow-2xl relative">
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
              <CodebaseGraph
                graphData={graph && graph.nodes && graph.nodes.length > 0 ? graph : buildIssueGraph(issue)}
                onNodeClick={undefined}
              />
            </div>
          </div>
        </main>
      )}
    </div>
  )
}

// ─── Issue Graph Builder ────────────────────────────────────────────────────
// Builds a minimal graph reflecting the actual file path from the issue data
function buildIssueGraph(issue: { file?: string; type?: string } | undefined) {
  if (!issue?.file) {
    return {
      nodes: [
        { id: 'repository', label: 'Repository', type: 'file' },
        { id: 'src', label: 'src/', type: 'file' },
      ],
      edges: [{ id: 'e-root', source: 'repository', target: 'src' }],
      reasoning_path: [] as string[],
    }
  }

  // Split the file path into segments, e.g. "src/utils/main.c" → ['src', 'utils', 'main.c']
  const parts = issue.file.replace(/^\//, '').split('/')
  const nodes: { id: string; label: string; type: string }[] = [
    { id: 'repository', label: 'Repository', type: 'file' },
  ]
  const edges: { id: string; source: string; target: string }[] = []

  let prevId = 'repository'
  parts.forEach((part, i) => {
    const isLast = i === parts.length - 1
    const nodeId = parts.slice(0, i + 1).join('/')
    nodes.push({
      id: nodeId,
      label: isLast ? part : `${part}/`,
      type: isLast ? 'bug' : 'file',
    })
    edges.push({ id: `e-${prevId}-${nodeId}`, source: prevId, target: nodeId })
    prevId = nodeId
  })

  return { nodes, edges, reasoning_path: [prevId] }
}

// ─── Diff Builder ──────────────────────────────────────────────────────────
interface DiffLine {
  type: 'context' | 'added' | 'removed'
  content: string
  lineNum: number
}

function buildDiffLines(original: string, fixed: string): DiffLine[] {
  if (!original && !fixed) return []

  const origLines = original.split('\n')
  const fixedLines = fixed.split('\n')
  const lines: DiffLine[] = []

  // Simple diff: show removed lines, then added lines
  // For a more sophisticated diff, we could use the 'diff' library
  // For a more sophisticated diff, we could use the 'diff' library

  // If codes are the same, just show as context
  if (original.trim() === fixed.trim()) {
    origLines.forEach((line, i) => {
      lines.push({ type: 'context', content: line, lineNum: i + 1 })
    })
    return lines
  }

  // Show original as removed
  origLines.forEach((line, i) => {
    if (line.trim()) {
      lines.push({ type: 'removed', content: line, lineNum: i + 1 })
    }
  })

  // Separator
  lines.push({ type: 'context', content: '─'.repeat(40), lineNum: 0 })

  // Show fixed as added
  fixedLines.forEach((line, i) => {
    if (line.trim()) {
      lines.push({ type: 'added', content: line, lineNum: i + 1 })
    }
  })

  return lines
}
