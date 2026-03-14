import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Logo } from '../components/Logo'
import { HelpPanel } from '../components/HelpPanel'
import { motion, AnimatePresence } from 'framer-motion'

export default function Login() {
  const [useEmail, setUseEmail] = useState(false)
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [iconPhase, setIconPhase] = useState<'lock' | 'github'>('lock')
  const [showHelp, setShowHelp] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setIconPhase(prev => prev === 'lock' ? 'github' : 'lock')
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const handleGitHubLogin = async () => {
    setIsLoading(true)
    await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        scopes: 'repo issues:write pull_requests:write',
        redirectTo: `${window.location.origin}/repos`,
      },
    })
  }

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      setIsLoading(true)
      await supabase.auth.signInWithOtp({ email })
      setIsLoading(false)
      alert('Magic link sent to your email!')
    }
  }

  const scopes = [
    { label: 'repo', icon: 'folder' },
    { label: 'issues:write', icon: 'bug_report' },
    { label: 'pull_requests:write', icon: 'merge' },
  ]

  return (
    <div className="min-h-screen flex flex-col font-display relative overflow-hidden bg-[#070b11]">

      {/* === Animated Background === */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {/* Slow animated radial glow */}
        <motion.div
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.4, 0.6, 0.4],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(56,189,248,0.07) 0%, rgba(59,130,246,0.04) 40%, transparent 70%)',
          }}
        />
        {/* Secondary ambient glow */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.35, 0.2],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
          className="absolute top-[30%] right-[10%] w-[500px] h-[500px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 70%)',
          }}
        />
        {/* Very subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      {/* === Header === */}
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative z-20 flex items-center justify-between px-6 py-4 border-b border-white/[0.04] bg-transparent"
      >
        <Link to="/" className="flex items-center gap-2.5 group" aria-label="GitSolve Home">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-white/[0.06] flex items-center justify-center group-hover:border-blue-500/30 transition-colors duration-200">
            <Logo className="text-blue-400 w-5 h-5" />
          </div>
          <span className="font-bold text-lg tracking-tight text-white/90">GitSolve</span>
        </Link>
        <div className="relative">
          <button
            onClick={() => setShowHelp(!showHelp)}
            className="flex items-center gap-2 text-[13px] font-medium text-slate-500 hover:text-slate-300 hover:bg-white/[0.04] px-3 py-2 rounded-lg transition-all duration-200"
            aria-label="Toggle help panel"
            aria-expanded={showHelp}
          >
            <span className="w-5 h-5 rounded-md bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-[11px] font-bold text-slate-400">?</span>
            Need help?
          </button>
          <HelpPanel
            isOpen={showHelp}
            onClose={() => setShowHelp(false)}
            onRetryGitHub={handleGitHubLogin}
          />
        </div>
      </motion.header>

      {/* === Main Content === */}
      <main className="flex-1 flex items-center justify-center p-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-[420px]"
        >
          {/* Auth Card */}
          <div
            className="relative rounded-2xl overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(15,23,42,0.6) 0%, rgba(10,15,25,0.8) 100%)',
              backdropFilter: 'blur(40px)',
              WebkitBackdropFilter: 'blur(40px)',
              border: '1px solid rgba(255,255,255,0.06)',
              boxShadow: '0 0 80px rgba(56,189,248,0.04), 0 25px 50px rgba(0,0,0,0.4)',
            }}
          >
            {/* Top accent line */}
            <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />

            <div className="p-8 sm:p-10">

              {/* === Icon Animation === */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                className="flex items-center justify-center gap-5 mb-8"
              >
                <div className="relative w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center overflow-hidden">
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={iconPhase}
                      initial={{ opacity: 0, scale: 0.7, rotate: -10 }}
                      animate={{ opacity: 1, scale: 1, rotate: 0 }}
                      exit={{ opacity: 0, scale: 0.7, rotate: 10 }}
                      transition={{ duration: 0.35, ease: 'easeOut' }}
                      className="material-symbols-outlined text-blue-400 text-2xl"
                    >
                      {iconPhase === 'lock' ? 'lock' : 'code'}
                    </motion.span>
                  </AnimatePresence>
                </div>

                {/* Connection dots */}
                <div className="flex items-center gap-1.5">
                  {[0, 1, 2].map(i => (
                    <motion.span
                      key={i}
                      animate={{
                        opacity: [0.2, 0.8, 0.2],
                        scale: [0.8, 1.1, 0.8],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        delay: i * 0.25,
                        ease: 'easeInOut',
                      }}
                      className="w-1.5 h-1.5 rounded-full bg-blue-400/60"
                    />
                  ))}
                </div>

                <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center">
                  <svg className="w-6 h-6 text-white/80" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.43.372.823 1.102.823 2.222 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                  </svg>
                </div>
              </motion.div>

              <AnimatePresence mode="wait">
                {!useEmail ? (
                  <motion.div
                    key="github-auth"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* Title & Description */}
                    <div className="text-center mb-8">
                      <motion.h1
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.25, duration: 0.4 }}
                        className="text-[28px] font-bold mb-3 text-white tracking-tight"
                      >
                        Welcome to GitSolve
                      </motion.h1>
                      <motion.p
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.4 }}
                        className="text-slate-400 leading-relaxed text-[14px] max-w-[300px] mx-auto"
                      >
                        Connect your GitHub account to analyze code and resolve issues autonomously.
                      </motion.p>
                    </div>

                    {/* Permission Badges */}
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.35, duration: 0.4 }}
                      className="flex justify-center flex-wrap gap-2 mb-8"
                    >
                      {scopes.map(scope => (
                        <span
                          key={scope.label}
                          className="group flex items-center gap-1.5 text-[11px] font-mono bg-white/[0.03] text-slate-400 border border-white/[0.08] px-3 py-1.5 rounded-full hover:border-blue-500/30 hover:text-blue-400 hover:bg-blue-500/[0.05] transition-all duration-200 cursor-default"
                        >
                          <span className="material-symbols-outlined text-[13px] opacity-60 group-hover:opacity-100 transition-opacity">{scope.icon}</span>
                          {scope.label}
                        </span>
                      ))}
                    </motion.div>

                    {/* Actions */}
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4, duration: 0.4 }}
                      className="space-y-4"
                    >
                      {/* GitHub Login Button */}
                      <button
                        onClick={handleGitHubLogin}
                        disabled={isLoading}
                        className="group w-full flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/60 text-white font-semibold py-3.5 px-4 rounded-xl transition-all duration-200 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(59,130,246,0.25)] active:scale-[0.98] disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 focus:ring-offset-[#070b11]"
                        aria-label="Login with GitHub"
                      >
                        {isLoading ? (
                          <>
                            <svg className="animate-spin w-5 h-5 text-white/80" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            <span>Connecting to GitHub...</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-5 h-5 fill-current transition-transform duration-200 group-hover:scale-110" viewBox="0 0 24 24">
                              <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.43.372.823 1.102.823 2.222 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                            </svg>
                            <span>Continue with GitHub</span>
                          </>
                        )}
                      </button>

                      {/* Trust Signal */}
                      <div className="flex items-center justify-center gap-2 py-1">
                        <span className="material-symbols-outlined text-emerald-500/60 text-[14px]">verified_user</span>
                        <span className="text-[11px] text-slate-500">Secure OAuth · Only reads repository metadata</span>
                      </div>

                      {/* Divider */}
                      <div className="relative flex items-center justify-center py-2">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-white/[0.05]" />
                        </div>
                        <span className="relative px-4 bg-transparent text-[10px] font-semibold text-slate-600 uppercase tracking-[0.2em]">
                          or continue with
                        </span>
                      </div>

                      {/* Email Button */}
                      <button
                        onClick={() => setUseEmail(true)}
                        className="w-full flex items-center justify-center gap-2.5 bg-transparent hover:bg-white/[0.04] text-slate-300 font-medium py-3.5 px-4 rounded-xl transition-all duration-200 border border-white/[0.08] hover:border-white/[0.15] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-white/10 focus:ring-offset-2 focus:ring-offset-[#070b11]"
                        aria-label="Login with Email"
                      >
                        <span className="material-symbols-outlined text-lg text-slate-400">mail</span>
                        Continue with Email
                      </button>
                    </motion.div>
                  </motion.div>
                ) : (
                  <motion.form
                    key="email-auth"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.3 }}
                    onSubmit={handleEmailLogin}
                  >
                    <div className="text-center mb-8">
                      <h2 className="text-[28px] font-bold mb-3 text-white tracking-tight">Sign in with Email</h2>
                      <p className="text-slate-400 text-[14px]">We'll send a magic link to your inbox.</p>
                    </div>

                    <div className="space-y-5">
                      <div>
                        <label htmlFor="email-input" className="block text-[13px] font-medium text-slate-300 mb-2">Email Address</label>
                        <div className="relative">
                          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-lg">mail</span>
                          <input
                            id="email-input"
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@company.com"
                            className="w-full pl-12 pr-4 py-3.5 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white text-[14px] focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 outline-none transition-all placeholder:text-slate-600"
                            autoFocus
                            aria-label="Email address"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/60 text-white font-semibold py-3.5 px-4 rounded-xl transition-all duration-200 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(59,130,246,0.25)] active:scale-[0.98] disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 focus:ring-offset-[#070b11]"
                        aria-label="Send magic link"
                      >
                        {isLoading ? 'Sending...' : 'Send Magic Link'}
                      </button>

                      <button
                        type="button"
                        onClick={() => setUseEmail(false)}
                        className="w-full text-slate-500 hover:text-slate-300 font-medium py-2 text-[13px] transition-colors focus:outline-none"
                        aria-label="Back to GitHub login"
                      >
                        ← Back to all options
                      </button>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Footer */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.4 }}
            className="mt-8 text-center text-[11px] text-slate-600 leading-relaxed"
          >
            By continuing, you agree to our{' '}
            <a className="underline underline-offset-2 hover:text-slate-400 transition-colors" href="#">Terms of Service</a>{' '}
            and{' '}
            <a className="underline underline-offset-2 hover:text-slate-400 transition-colors" href="#">Privacy Policy</a>.
          </motion.p>
        </motion.div>
      </main>
    </div>
  )
}
