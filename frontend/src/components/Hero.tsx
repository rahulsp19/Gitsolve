import { motion } from 'framer-motion'

type HeroProps = {
  onStartBuilding: () => void
  onRequestAccess: () => void
}

export default function Hero({ onStartBuilding, onRequestAccess }: HeroProps) {
  return (
    <section className="relative mx-auto max-w-5xl px-6 pb-16 pt-28 text-center">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.02] px-3 py-1 text-slate-500"
      >
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
        <span className="mono-label">v2.1: Private Repo Engine Released</span>
        <span className="material-symbols-outlined ml-0.5 text-[14px] opacity-50">chevron_right</span>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
        className="mb-8 mt-10 text-balance text-5xl font-bold leading-[0.95] tracking-[-0.04em] text-shimmer md:text-[84px]"
      >
        Autonomous engineering <br />
        agent <span className="text-slate-700">for high-scale teams.</span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
        className="mx-auto mb-12 max-w-xl text-balance text-[18px] font-normal leading-relaxed text-slate-400/90"
      >
        GitSolve reads the whole codebase, traces intent through dependencies, fixes the root cause, and ships a PR that your team
        can trust.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
        className="mb-20 flex flex-col items-center justify-center gap-4 sm:flex-row"
      >
        <button
          type="button"
          onClick={onStartBuilding}
          className="glow-hover flex w-full items-center justify-center gap-2 rounded-[6px] bg-primary px-6 py-2.5 text-[14px] font-semibold text-white transition-all hover:brightness-110 sm:w-auto"
        >
          Start Building
          <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
        </button>
        <button
          type="button"
          onClick={onRequestAccess}
          className="w-full rounded-[6px] border border-white/10 bg-white/[0.02] px-6 py-2.5 text-[14px] font-medium text-white transition-all hover:bg-white/[0.06] sm:w-auto"
        >
          Request Access
        </button>
      </motion.div>

      <div className="mx-auto flex flex-wrap items-center justify-center gap-3 text-[12px] text-slate-600">
        <span className="mono-label text-slate-600">Trusted by</span>
        <span className="rounded-full border border-white/10 bg-white/[0.02] px-3 py-1">
          2,000+ engineers
        </span>
        <span className="rounded-full border border-white/10 bg-white/[0.02] px-3 py-1">
          SOC2-ready workflows
        </span>
      </div>
    </section>
  )
}

