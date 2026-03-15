import { useEffect, useState } from 'react'

interface Reference {
  repo: string
  file: string
  snippet: string
  url: string
}

interface Props {
  issueType: string
  language?: string
}

export function GitSolveReferences({ issueType, language = 'javascript' }: Props) {
  const [refs, setRefs] = useState<Reference[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!issueType) return
    setLoading(true)
    setError(false)

    const langGuess = language ||
      (issueType.toLowerCase().includes('python') ? 'python' : 'javascript')

    fetch(
      `http://localhost:3001/api/references?issue_type=${encodeURIComponent(issueType)}&language=${encodeURIComponent(langGuess)}`
    )
      .then(r => r.json())
      .then(data => {
        setRefs(data.references || [])
        setLoading(false)
      })
      .catch(() => {
        setError(true)
        setLoading(false)
      })
  }, [issueType, language])

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div
            key={i}
            className="animate-pulse rounded-xl border border-slate-800 bg-slate-900/50 p-5"
          >
            <div className="h-4 bg-slate-800 rounded w-1/3 mb-3" />
            <div className="h-3 bg-slate-800 rounded w-1/2 mb-4" />
            <div className="space-y-2">
              {[1, 2, 3, 4].map(j => (
                <div key={j} className="h-3 bg-slate-800/70 rounded w-full" />
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error || refs.length === 0) {
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-900/30 p-12 text-center">
        <span className="material-symbols-outlined text-slate-600 text-5xl mb-4 block">
          manage_search
        </span>
        <h3 className="text-lg font-bold text-slate-300 mb-2">
          No matching public repository patterns found.
        </h3>
        <p className="text-slate-500 text-sm">
          Try analyzing a different issue type, or check back later.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 mb-2">
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
        <div>
          <h3 className="font-bold text-slate-100 text-lg">GitSolve References</h3>
          <p className="text-slate-400 text-xs">Code patterns from public GitHub repositories</p>
        </div>
      </div>

      {refs.map((ref, i) => (
        <div
          key={i}
          className="group rounded-xl border border-slate-700 bg-slate-900 p-5 hover:border-primary/60 hover:shadow-lg hover:shadow-primary/10 transition-all duration-200"
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-slate-400 text-[18px]">
                code_blocks
              </span>
              <div>
                <p className="text-xs font-semibold text-primary">{ref.repo}</p>
                <p className="text-[11px] text-slate-500 font-mono mt-0.5">{ref.file}</p>
              </div>
            </div>
            <a
              href={ref.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary hover:text-primary/80 flex items-center gap-1 font-medium transition-colors shrink-0 ml-2"
            >
              View on GitHub
              <span className="material-symbols-outlined text-[14px]">open_in_new</span>
            </a>
          </div>

          {/* Code snippet */}
          <div className="rounded-lg bg-[#0d1117] border border-slate-800 overflow-x-auto">
            <pre className="text-[12px] leading-relaxed font-mono text-slate-300 p-4 whitespace-pre-wrap break-all">
              <code>{ref.snippet}</code>
            </pre>
          </div>
        </div>
      ))}
    </div>
  )
}
