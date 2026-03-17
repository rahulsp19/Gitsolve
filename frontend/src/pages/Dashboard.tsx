import { motion } from 'framer-motion'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

type Repo = {
  id: string
  name: string
  language: string
  issues: number
  lastRun: string
}

type Activity = {
  id: string
  time: string
  text: string
  tone: 'ok' | 'muted' | 'warn'
}

const toneClass: Record<Activity['tone'], string> = {
  ok: 'text-emerald-400',
  muted: 'text-slate-500',
  warn: 'text-amber-400',
}

export default function Dashboard() {
  const repos: Repo[] = useMemo(
    () => [
      { id: 'r1', name: 'rahulsp19/Test_repo1', language: 'JS', issues: 12, lastRun: '2m ago' },
      { id: 'r2', name: 'api/payment-service', language: 'TS', issues: 4, lastRun: '1h ago' },
      { id: 'r3', name: 'infra/terraform', language: 'HCL', issues: 2, lastRun: 'yesterday' },
    ],
    []
  )

  const activity: Activity[] = useMemo(
    () => [
      { id: 'a1', time: 'just now', text: 'repo exploration started for Test_repo1', tone: 'muted' },
      { id: 'a2', time: 'just now', text: 'downloaded 37 files (0 failed)', tone: 'ok' },
      { id: 'a3', time: '1m ago', text: 'chunking completed (12 chunks)', tone: 'ok' },
      { id: 'a4', time: '3m ago', text: 'PR-882 opened against main', tone: 'ok' },
      { id: 'a5', time: '10m ago', text: 'guardrails: tests suggested for flaky suite', tone: 'warn' },
    ],
    []
  )

  const [selected, setSelected] = useState<Repo>(repos[0]!)
  const [busyRepoId, setBusyRepoId] = useState<string | null>(null)

  return (
    <div className="min-h-screen bg-black text-slate-300">
      <div className="mx-auto max-w-[1200px] px-6 py-10 md:px-8">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div>
            <div className="mono-label text-slate-600">GitSolve</div>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white">Dashboard</h1>
            <p className="mt-2 max-w-xl text-[13px] leading-relaxed text-slate-500">
              A lightweight control plane for autonomous runs. This is a UI-only demo backed by local state.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="rounded-lg border border-white/10 bg-white/[0.02] px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-white/[0.05]"
            >
              Back to landing
            </Link>
            <button
              type="button"
              className="rounded-lg bg-white px-4 py-2 text-[13px] font-semibold text-black transition-colors hover:bg-slate-200"
              onClick={() => alert('Demo only')}
            >
              Connect GitHub
            </button>
          </div>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-12">
          <div className="md:col-span-7">
            <div className="border-precision glass-card rounded-xl p-5">
              <div className="flex items-center justify-between">
                <h2 className="text-[13px] font-semibold text-white">Repositories</h2>
                <span className="mono-label text-slate-600">{repos.length} connected</span>
              </div>

              <div className="mt-4 space-y-3">
                {repos.map((r) => {
                  const active = selected.id === r.id
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setSelected(r)}
                      className={`w-full rounded-lg border px-4 py-3 text-left transition-colors ${
                        active ? 'border-primary/40 bg-primary/10' : 'border-white/10 bg-white/[0.02] hover:bg-white/[0.04]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <div className="text-[13px] font-semibold text-white">{r.name}</div>
                          <div className="mt-1 text-[12px] text-slate-500">
                            {r.language} • {r.issues} open issues • last run {r.lastRun}
                          </div>
                        </div>
                        <div className="mono-label rounded-full border border-white/10 bg-black/30 px-3 py-1 text-slate-500">
                          ready
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="mt-6 border-precision glass-card rounded-xl p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-[13px] font-semibold text-white">Fix an issue</h2>
                  <p className="mt-1 text-[12px] text-slate-500">Run an autonomous scan + patch + PR on the selected repo.</p>
                </div>
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  disabled={busyRepoId === selected.id}
                  onClick={() => {
                    setBusyRepoId(selected.id)
                    window.setTimeout(() => setBusyRepoId(null), 2400)
                  }}
                  className="glow-hover rounded-lg bg-primary px-4 py-2 text-[13px] font-semibold text-white transition-all hover:brightness-110 disabled:opacity-60"
                >
                  {busyRepoId === selected.id ? 'Running…' : 'Fix Issue'}
                </motion.button>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                {[
                  { label: 'Stage', value: busyRepoId ? 'Analyzing' : 'Idle' },
                  { label: 'Mode', value: 'Minimal diff' },
                  { label: 'Policy', value: 'Review required' },
                ].map((s) => (
                  <div key={s.label} className="rounded-lg border border-white/10 bg-white/[0.02] p-4">
                    <div className="mono-label text-slate-600">{s.label}</div>
                    <div className="mt-2 text-[13px] font-semibold text-white">{s.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="md:col-span-5">
            <div className="border-precision glass-card rounded-xl p-5">
              <div className="flex items-center justify-between">
                <h2 className="text-[13px] font-semibold text-white">Activity</h2>
                <span className="mono-label text-slate-600">live</span>
              </div>

              <div className="mt-4 space-y-3">
                {activity.map((a) => (
                  <div key={a.id} className="rounded-lg border border-white/10 bg-white/[0.02] p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className={`text-[12px] font-semibold ${toneClass[a.tone]}`}>{a.text}</div>
                      <div className="mono-label text-slate-600">{a.time}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-lg border border-white/10 bg-black/30 p-4">
                <div className="mono-label text-slate-600">Tip</div>
                <p className="mt-2 text-[12px] leading-relaxed text-slate-500">
                  Keep runs reviewable: prefer small PRs, pin formatting, and request the agent’s reasoning trace for high-impact changes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
