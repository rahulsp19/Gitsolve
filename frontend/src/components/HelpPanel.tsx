import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface HelpPanelProps {
  isOpen: boolean
  onClose: () => void
  onRetryGitHub: () => void
}

export function HelpPanel({ isOpen, onClose, onRetryGitHub }: HelpPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null)

  // Close on ESC
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      document.addEventListener('keydown', handleKey)
      return () => document.removeEventListener('keydown', handleKey)
    }
  }, [isOpen, onClose])

  // Close on click outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    if (isOpen) {
      // Delay to avoid closing immediately on the same click that opens it
      const id = setTimeout(() => document.addEventListener('mousedown', handleClick), 10)
      return () => {
        clearTimeout(id)
        document.removeEventListener('mousedown', handleClick)
      }
    }
  }, [isOpen, onClose])

  const commonProblems = [
    { icon: 'block', text: 'GitHub popup blocked by browser' },
    { icon: 'link_off', text: 'OAuth redirect failed or timed out' },
    { icon: 'timer_off', text: 'Session expired — please try again' },
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Mobile backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
            aria-hidden="true"
          />

          <motion.div
            ref={panelRef}
            initial={{ opacity: 0, y: 10, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.97 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            role="dialog"
            aria-label="Login Help"
            aria-modal="true"
            className="
              fixed z-50
              md:absolute md:right-0 md:top-full md:mt-2
              inset-x-4 top-1/2 -translate-y-1/2
              md:inset-auto md:translate-y-0
              w-auto md:w-[380px]
              max-h-[85vh] overflow-y-auto
              rounded-xl
              border border-white/[0.08]
              shadow-2xl shadow-blue-500/[0.06]
              scrollbar-thin
            "
            style={{
              background: 'linear-gradient(145deg, #0c1424 0%, #080e18 100%)',
            }}
          >
            {/* Top accent */}
            <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-blue-500/25 to-transparent" />

            {/* Header */}
            <div className="flex items-center justify-between p-5 pb-0">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-400 text-lg">help</span>
                <h3 className="text-[15px] font-semibold text-white">Login Help</h3>
              </div>
              <button
                onClick={onClose}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/[0.06] transition-all duration-150"
                aria-label="Close help panel"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="p-5 space-y-5">

              {/* 1. GitHub Login Issues */}
              <section className="rounded-lg bg-white/[0.02] border border-white/[0.05] p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-amber-400/80 text-[16px]">warning</span>
                  <h4 className="text-[13px] font-semibold text-white">GitHub Login Issues</h4>
                </div>
                <p className="text-[12px] text-slate-400 leading-relaxed">
                  If GitHub login fails, ensure your browser allows redirects and popups. Some ad-blockers may interfere with OAuth.
                </p>
                <button
                  onClick={() => { onClose(); onRetryGitHub() }}
                  className="w-full flex items-center justify-center gap-2 text-[12px] font-medium text-blue-400 bg-blue-500/[0.08] hover:bg-blue-500/[0.15] border border-blue-500/[0.15] hover:border-blue-500/[0.3] py-2 rounded-lg transition-all duration-200 active:scale-[0.98]"
                >
                  <span className="material-symbols-outlined text-[14px]">refresh</span>
                  Retry GitHub Login
                </button>
              </section>

              {/* 2. Permission Explanation */}
              <section className="rounded-lg bg-white/[0.02] border border-white/[0.05] p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-emerald-400/80 text-[16px]">shield</span>
                  <h4 className="text-[13px] font-semibold text-white">Permissions Explained</h4>
                </div>
                <p className="text-[12px] text-slate-400 leading-relaxed">
                  GitSolve requests repository metadata and pull request access to analyze your code and suggest fixes. We never modify code without your explicit approval.
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {['repo', 'issues:write', 'pull_requests:write'].map(scope => (
                    <span key={scope} className="text-[10px] font-mono text-slate-500 bg-white/[0.03] border border-white/[0.06] rounded-full px-2 py-0.5">
                      {scope}
                    </span>
                  ))}
                </div>
              </section>

              {/* 3. Common Problems */}
              <section className="space-y-2.5">
                <h4 className="text-[13px] font-semibold text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-slate-400 text-[16px]">troubleshoot</span>
                  Common Problems
                </h4>
                <div className="space-y-1">
                  {commonProblems.map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2.5 py-2 px-3 rounded-lg hover:bg-white/[0.03] transition-colors duration-150 group"
                    >
                      <span className="material-symbols-outlined text-[14px] text-slate-600 group-hover:text-slate-400 transition-colors">{item.icon}</span>
                      <span className="text-[12px] text-slate-400 group-hover:text-slate-300 transition-colors">{item.text}</span>
                    </div>
                  ))}
                </div>
              </section>

              {/* Divider */}
              <div className="border-t border-white/[0.05]" />

              {/* 4. Support Contact */}
              <section className="space-y-3">
                <p className="text-[12px] text-slate-500 font-medium">Still stuck?</p>
                <div className="flex gap-2">
                  <a
                    href="/docs/authentication"
                    className="flex-1 flex items-center justify-center gap-1.5 text-[12px] font-medium text-slate-300 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] hover:border-white/[0.12] py-2.5 rounded-lg transition-all duration-200 active:scale-[0.98]"
                  >
                    <span className="material-symbols-outlined text-[14px]">description</span>
                    View Docs
                  </a>
                  <a
                    href="https://github.com/rahulsp19/Gitsolve/issues"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-1.5 text-[12px] font-medium text-slate-300 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] hover:border-white/[0.12] py-2.5 rounded-lg transition-all duration-200 active:scale-[0.98]"
                  >
                    <span className="material-symbols-outlined text-[14px]">bug_report</span>
                    Report Issue
                  </a>
                </div>
              </section>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
