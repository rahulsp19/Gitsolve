import { motion } from 'framer-motion'
import { useEffect, useMemo, useRef, useState } from 'react'

type DemoPhase = 'idle' | 'scanning' | 'patching' | 'pr'

type DemoLine =
  | { kind: 'cmd'; text: string }
  | { kind: 'log'; tone?: 'muted' | 'ok' | 'warn'; text: string }
  | { kind: 'result'; text: string }

const tones: Record<NonNullable<DemoLine & { kind: 'log' }['tone']>, string> = {
  muted: 'text-slate-600',
  ok: 'text-slate-300',
  warn: 'text-amber-400',
}

function buildScript() {
  const prId = `PR-${Math.floor(800 + Math.random() * 200)}`
  const issue = `#${Math.floor(90 + Math.random() * 60)}`
  const target = ['main/src/api', 'infrastructure', 'packages/worker'][Math.floor(Math.random() * 3)]
  const repo = ['rahulsp19/Test_repo1', 'microsoft/vscode', 'vercel/next.js'][Math.floor(Math.random() * 3)]

  const lines: DemoLine[] = [
    { kind: 'cmd', text: `gitsolve scan ${repo} --issue=${issue}` },
    { kind: 'log', tone: 'ok', text: 'repo exploration started…' },
    { kind: 'log', tone: 'muted', text: `files discovered in ${target}…` },
    { kind: 'log', tone: 'ok', text: 'files downloaded…' },
    { kind: 'log', tone: 'warn', text: 'chunking started…' },
    { kind: 'log', tone: 'ok', text: 'chunking completed.' },
    { kind: 'log', tone: 'ok', text: 'generating minimal patch…' },
    { kind: 'result', text: `✓ pull request created: ${prId}` },
  ]

  return { lines, issue, prId, target }
}

function useLoopedDemo() {
  const [runId, setRunId] = useState(0)
  const script = useMemo(() => buildScript(), [runId])

  const [phase, setPhase] = useState<DemoPhase>('idle')
  const [visibleCount, setVisibleCount] = useState(1)
  const [cursorOn, setCursorOn] = useState(true)
  const timeoutsRef = useRef<number[]>([])

  useEffect(() => {
    const clearAll = () => {
      timeoutsRef.current.forEach((t) => window.clearTimeout(t))
      timeoutsRef.current = []
    }

    clearAll()
    setPhase('idle')
    setVisibleCount(1)

    const schedule = (ms: number, fn: () => void) => {
      timeoutsRef.current.push(window.setTimeout(fn, ms))
    }

    schedule(450, () => setPhase('scanning'))
    schedule(700, () => setVisibleCount(2))
    schedule(1200, () => setVisibleCount(3))
    schedule(1700, () => setVisibleCount(4))
    schedule(2150, () => setPhase('patching'))
    schedule(2350, () => setVisibleCount(5))
    schedule(2750, () => setVisibleCount(6))
    schedule(3200, () => setVisibleCount(7))
    schedule(3900, () => setPhase('pr'))
    schedule(4100, () => setVisibleCount(8))

    // Loop (restart script)
    schedule(9000, () => setRunId((v) => v + 1))

    return clearAll
  }, [runId])

  useEffect(() => {
    const id = window.setInterval(() => setCursorOn((v) => !v), 650)
    return () => window.clearInterval(id)
  }, [])

  return { script, phase, visibleCount, cursorOn }
}

export default function TerminalDemo() {
  const { script, phase, visibleCount, cursorOn } = useLoopedDemo()

  return (
    <div className="relative mx-auto max-w-5xl">
      <div className="group relative">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-transparent opacity-0 blur-2xl transition-opacity duration-1000 group-hover:opacity-100" />

        <div className="relative overflow-hidden rounded-xl border-precision glass-card shadow-[0_48px_100px_-20px_rgba(0,0,0,0.8)]">
          <div className="flex items-center gap-2 border-b border-white/[0.04] bg-white/[0.02] px-4 py-2.5">
            <div className="flex gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full bg-white/5" />
              <div className="h-2.5 w-2.5 rounded-full bg-white/5" />
              <div className="h-2.5 w-2.5 rounded-full bg-white/5" />
            </div>
            <div className="mono-label mx-auto flex items-center gap-2 text-[10px] text-slate-500">
              <span className="material-symbols-outlined text-[12px] opacity-40">lock</span>
              terminal/session-829
            </div>
          </div>

          <div className="grid h-[520px] grid-cols-12">
            <div className="col-span-12 border-b border-white/[0.04] bg-black/20 p-6 text-left md:col-span-3 md:border-b-0 md:border-r">
              <div className="space-y-10">
                <div>
                  <div className="mono-label mb-5 text-[10px] uppercase text-slate-600">Context</div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-[12px] text-white/90">
                      <span className="material-symbols-outlined text-[16px] text-primary">account_tree</span>
                      main/src/api
                    </div>
                    <div className="flex items-center gap-2 text-[12px] text-slate-600">
                      <span className="material-symbols-outlined text-[16px]">folder</span>
                      infrastructure
                    </div>
                  </div>
                </div>

                <div>
                  <div className="mono-label mb-5 text-[10px] uppercase text-slate-600">Active Task</div>
                  <div className="rounded border border-white/[0.04] bg-white/[0.01] p-4">
                    <div className="mb-1.5 flex items-center gap-2 text-[11px] font-medium text-emerald-500">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                      {phase === 'pr' ? `PR created` : `Fixing ${script.issue}`}
                    </div>
                    <div className="text-[10px] leading-tight text-slate-600">
                      {phase === 'scanning' ? 'Indexing repository context…' : phase === 'patching' ? 'Synthesizing a minimal diff…' : 'Optimizing DB transaction isolation…'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative col-span-12 overflow-hidden bg-[#010101] p-7 text-left md:col-span-9 md:p-10">
              <div className="font-mono text-[13px] leading-[1.8]">
                <div className="opacity-40">
                  <div className="mb-1 flex gap-8">
                    <span className="w-6 select-none text-right">12</span>
                    <span className="text-slate-400">
                      <span className="text-[#ff7b72]">async function</span> <span className="text-[#d2a8ff]">resolveConflict</span>(id:{' '}
                      <span className="text-blue-300">string</span>) {'{'}
                    </span>
                  </div>
                </div>

                <div className="-mx-7 border-y border-emerald-500/10 bg-emerald-500/5 px-7 py-1 md:-mx-10 md:px-10">
                  <div className="flex gap-8">
                    <span className="w-6 select-none text-right text-emerald-600/60">+14</span>
                    <span className="ml-6 text-emerald-300/90">
                      session.<span className="text-[#d2a8ff]">startTransaction</span>({` `}
                      <span className="text-slate-400">readConcern:</span> <span className="text-[#a5d6ff]">'majority'</span> {` `}});{' '}
                    </span>
                  </div>
                </div>

                <div className="mt-14 border-t border-white/[0.03] pt-10">
                  <div className="mono-label mb-6 flex items-center gap-2 text-[10px] text-slate-600">
                    <span className="material-symbols-outlined text-[14px]">terminal</span>
                    STDOUT
                  </div>

                  <div className="space-y-2 text-slate-400">
                    {script.lines.slice(0, visibleCount).map((line, idx) => {
                      if (line.kind === 'cmd') {
                        return (
                          <motion.div key={idx} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
                            <span className="text-primary/70">❯</span>{' '}
                            <span className="text-white/80">{line.text}</span>
                          </motion.div>
                        )
                      }
                      if (line.kind === 'result') {
                        return (
                          <motion.div key={idx} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
                            <span className="inline-flex items-center gap-2 text-[12px] text-emerald-500/90">
                              <span className="material-symbols-outlined text-[16px]">check_circle</span>
                              {line.text}
                            </span>
                          </motion.div>
                        )
                      }
                      return (
                        <motion.div key={idx} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
                          <span className={`text-[12px] ${tones[line.tone ?? 'muted']}`}>{line.text}</span>
                        </motion.div>
                      )
                    })}

                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-primary/70">❯</span>
                      <span className="text-white/50">
                        {phase === 'idle' ? 'waiting…' : phase === 'scanning' ? 'scanning…' : phase === 'patching' ? 'generating…' : 'done'}
                      </span>
                      <span className={`ml-1 inline-block h-4 w-2 bg-primary ${cursorOn ? 'opacity-90' : 'opacity-0'}`} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

