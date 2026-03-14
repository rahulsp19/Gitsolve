import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'

export default function Login() {
  const [useEmail, setUseEmail] = useState(false)
  const [email, setEmail] = useState('')
  const navigate = useNavigate()

  const handleGitHubLogin = async () => {
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
      await supabase.auth.signInWithOtp({ email })
      alert('Magic link sent to your email!')
    }
  }

  return (
    <div className="min-h-screen bg-[#111921] flex flex-col font-display">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#111921]/80 backdrop-blur-md sticky top-0 z-50">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
            <span className="material-symbols-outlined text-white text-xl">terminal</span>
          </div>
          <span className="font-bold text-xl tracking-tight text-white">GitSolve</span>
        </Link>
        <div className="flex items-center gap-6">
          <a href="#" className="text-sm font-medium text-slate-400 hover:text-primary transition-colors">Help</a>
          <span className="material-symbols-outlined text-slate-400 hover:text-white cursor-pointer transition-colors">help</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#161b22]/40 border border-white/5 rounded-2xl shadow-2xl overflow-hidden animate-fade-in backdrop-blur-sm">
          {/* Hero Visual */}
          <div className="relative h-48 w-full bg-[#111921] flex items-center justify-center overflow-hidden border-b border-white/5">
            <div className="absolute inset-0 opacity-20 bg-gradient-to-br from-primary via-transparent to-blue-500/10"></div>
            <div className="relative z-10 flex items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-slate-900 flex items-center justify-center shadow-xl border border-white/10 group">
                <span className="material-symbols-outlined text-primary text-4xl group-hover:scale-110 transition-transform">lock</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary/40 animate-pulse"></span>
                <span className="w-2 h-2 rounded-full bg-primary/40 animate-pulse" style={{ animationDelay: '200ms' }}></span>
                <span className="w-2 h-2 rounded-full bg-primary/40 animate-pulse" style={{ animationDelay: '400ms' }}></span>
              </div>
              <div className="w-16 h-16 rounded-2xl bg-slate-900 flex items-center justify-center shadow-xl border border-white/10 group">
                <span className="material-symbols-outlined text-white text-4xl group-hover:scale-110 transition-transform">code</span>
              </div>
            </div>
          </div>

          <div className="p-8">
            {!useEmail ? (
              <>
                {/* Title & Description */}
                <div className="text-center mb-10">
                  <h1 className="text-2xl font-bold mb-3 text-white">Connect your account</h1>
                  <p className="text-slate-400 leading-relaxed text-sm">
                    Connect your GitHub account to allow GitSolve to analyze your code and resolve issues autonomously.
                  </p>
                </div>

                {/* Permission Badges */}
                <div className="flex justify-center flex-wrap gap-2 mb-8">
                  {['repo', 'issues:write', 'pull_requests:write'].map((scope) => (
                    <span key={scope} className="text-[10px] font-mono bg-primary/5 text-primary border border-primary/20 px-2.5 py-1 rounded-md">
                      {scope}
                    </span>
                  ))}
                </div>

                {/* Actions */}
                <div className="space-y-4">
                  <button
                    onClick={handleGitHubLogin}
                    className="w-full flex items-center justify-center gap-3 bg-primary hover:bg-primary/90 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-lg shadow-primary/25 active:scale-[0.98]"
                  >
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.43.372.823 1.102.823 2.222 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                    </svg>
                    Login with GitHub
                  </button>

                  <div className="relative flex items-center justify-center py-4">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-white/5"></div>
                    </div>
                    <span className="relative px-4 bg-[#111921] text-[10px] font-bold text-slate-500 uppercase tracking-widest">or continue with</span>
                  </div>

                  <button 
                    onClick={() => setUseEmail(true)}
                    className="w-full flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 text-slate-100 font-semibold py-3.5 px-4 rounded-xl transition-all border border-white/10 active:scale-[0.98]"
                  >
                    <span className="material-symbols-outlined text-xl">mail</span>
                    Login with Email
                  </button>
                </div>
              </>
            ) : (
              <form onSubmit={handleEmailLogin} className="animate-slide-up">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold mb-2 text-white">Login with Email</h2>
                  <p className="text-slate-400 text-sm">We'll send you a magic link to your inbox.</p>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">Email Address</label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">mail</span>
                      <input 
                        type="email" 
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@company.com"
                        className="w-full pl-12 pr-4 py-3.5 bg-slate-900 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-slate-600"
                        autoFocus
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    <button 
                      type="submit"
                      className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-lg shadow-primary/25 active:scale-[0.98]"
                    >
                      Send Magic Link
                    </button>
                    <button 
                      type="button"
                      onClick={() => setUseEmail(false)}
                      className="w-full text-slate-500 hover:text-slate-300 font-medium py-2 text-sm transition-colors"
                    >
                      Back to GitHub
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* Footer Note */}
            <p className="mt-10 text-center text-[10px] text-slate-500 leading-relaxed uppercase tracking-wider">
              By connecting, you agree to our{' '}
              <a className="underline hover:text-primary transition-colors" href="#">Terms</a>{' '}
              &{' '}
              <a className="underline hover:text-primary transition-colors" href="#">Privacy</a>.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
