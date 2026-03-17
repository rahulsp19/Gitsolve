import * as Dialog from '@radix-ui/react-dialog'
import { motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'

type AuthMode = 'signup' | 'waitlist'

type AuthModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: AuthMode
}

const LS_KEYS = {
  signupEmails: 'gitsolve_signup_emails_v1',
  waitlistEmails: 'gitsolve_waitlist_emails_v1',
} as const

function appendEmail(key: string, email: string) {
  const trimmed = email.trim().toLowerCase()
  if (!trimmed) return
  const current = JSON.parse(localStorage.getItem(key) || '[]') as string[]
  const next = Array.from(new Set([trimmed, ...current])).slice(0, 50)
  localStorage.setItem(key, JSON.stringify(next))
}

export default function AuthModal({ open, onOpenChange, mode }: AuthModalProps) {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const copy = useMemo(() => {
    if (mode === 'waitlist') {
      return {
        title: 'Request access',
        subtitle: 'Join the waitlist. We’ll email you when private repos are enabled for your org.',
        cta: 'Join waitlist',
        key: LS_KEYS.waitlistEmails,
      }
    }
    return {
      title: 'Start building',
      subtitle: 'Drop an email to get early access. No spam — only shipping updates.',
      cta: 'Continue',
      key: LS_KEYS.signupEmails,
    }
  }, [mode])

  useEffect(() => {
    if (!open) {
      setEmail('')
      setSubmitted(false)
    }
  }, [open])

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-[70] w-[92vw] max-w-[520px] -translate-x-1/2 -translate-y-1/2">
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="border-precision glass-card overflow-hidden rounded-xl p-6 shadow-[0_50px_120px_-40px_rgba(0,0,0,0.9)]"
          >
            <div className="flex items-start justify-between gap-6">
              <div>
                <Dialog.Title className="text-white text-[18px] font-semibold tracking-tight">{copy.title}</Dialog.Title>
                <Dialog.Description className="mt-2 text-[13px] leading-relaxed text-slate-400">
                  {copy.subtitle}
                </Dialog.Description>
              </div>
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="rounded-md border border-white/10 bg-white/[0.02] px-2 py-1 text-[12px] text-slate-300 transition-colors hover:bg-white/[0.05] hover:text-white"
                  aria-label="Close"
                >
                  Esc
                </button>
              </Dialog.Close>
            </div>

            <div className="mt-6 space-y-4">
              {!submitted ? (
                <>
                  <label className="block">
                    <span className="mono-label text-slate-600">Email</span>
                    <input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@company.com"
                      type="email"
                      className="mt-2 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-[13px] text-white placeholder:text-slate-600 outline-none transition-colors focus:border-primary/50"
                      autoFocus
                    />
                  </label>

                  <button
                    type="button"
                    className="w-full rounded-lg bg-white px-4 py-2.5 text-[13px] font-semibold text-black transition-colors hover:bg-slate-200"
                    onClick={() => {
                      appendEmail(copy.key, email)
                      setSubmitted(true)
                    }}
                    disabled={!email.trim()}
                  >
                    {copy.cta}
                  </button>

                  <div className="relative py-2">
                    <div className="h-px w-full bg-white/10" />
                    <div className="mono-label absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-black px-2 text-slate-600">
                      or
                    </div>
                  </div>

                  <button
                    type="button"
                    className="w-full rounded-lg border border-white/10 bg-white/[0.02] px-4 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-white/[0.05]"
                    onClick={() => {
                      // UI-only. Still capture email if present.
                      if (email.trim()) appendEmail(copy.key, email)
                      setSubmitted(true)
                    }}
                  >
                    Continue with GitHub
                  </button>

                  <p className="text-[12px] leading-relaxed text-slate-600">
                    By continuing, you agree to the <span className="text-slate-400">Terms</span> and{' '}
                    <span className="text-slate-400">Privacy</span>.
                  </p>
                </>
              ) : (
                <div className="rounded-lg border border-white/10 bg-white/[0.02] p-4">
                  <div className="flex items-center gap-2 text-emerald-500">
                    <span className="material-symbols-outlined text-[18px]">check_circle</span>
                    <span className="text-[13px] font-semibold">Saved.</span>
                  </div>
                  <p className="mt-2 text-[12px] leading-relaxed text-slate-500">
                    You’re on the list. Next: we’ll share a private repo demo and invite when capacity opens.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

