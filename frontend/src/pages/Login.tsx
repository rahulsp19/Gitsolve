import { Link } from 'react-router-dom'

export default function Login() {
  return (
    <div className="min-h-screen bg-[#111921] flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="material-symbols-outlined text-white text-lg">terminal</span>
          </div>
          <span className="font-bold text-xl tracking-tight">GitSolve</span>
        </Link>
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-400">Help</span>
          <span className="material-symbols-outlined text-slate-400">help</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900/50 border border-slate-800 rounded-xl shadow-2xl overflow-hidden animate-fade-in">
          {/* Hero Visual */}
          <div className="relative h-48 w-full bg-slate-800 flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 opacity-20 bg-gradient-to-br from-primary to-transparent"></div>
            <div className="relative z-10 flex items-center gap-6">
              <div className="w-16 h-16 rounded-full bg-slate-900 flex items-center justify-center shadow-lg border border-slate-700">
                <span className="material-symbols-outlined text-primary text-4xl">lock</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-slate-400 animate-pulse"></span>
                <span className="w-2 h-2 rounded-full bg-slate-400 animate-pulse" style={{ animationDelay: '75ms' }}></span>
                <span className="w-2 h-2 rounded-full bg-slate-400 animate-pulse" style={{ animationDelay: '150ms' }}></span>
              </div>
              <div className="w-16 h-16 rounded-full bg-slate-900 flex items-center justify-center shadow-lg border border-slate-700">
                <span className="material-symbols-outlined text-white text-4xl">code</span>
              </div>
            </div>
          </div>

          <div className="p-8">
            {/* Title & Description */}
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold mb-3 text-white">Connect your GitHub account</h1>
              <p className="text-slate-400 leading-relaxed text-sm">
                This application requires read access to your repositories and permission to create pull requests on your behalf to automate your workflow.
              </p>
            </div>

            {/* Permission Badges */}
            <div className="flex justify-center gap-2 mb-6">
              {['repo', 'issues:write', 'pull_requests:write'].map((scope) => (
                <span key={scope} className="text-[10px] font-mono bg-slate-800 text-slate-400 px-2 py-1 rounded border border-slate-700">
                  {scope}
                </span>
              ))}
            </div>

            {/* Actions */}
            <div className="space-y-4">
              <Link
                to="/repos"
                className="w-full flex items-center justify-center gap-3 bg-primary hover:bg-primary/90 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.43.372.823 1.102.823 2.222 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                </svg>
                Login with GitHub
              </Link>

              <div className="relative flex items-center justify-center py-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-800"></div>
                </div>
                <span className="relative px-4 bg-slate-900 text-xs text-slate-500 uppercase tracking-widest">or continue with</span>
              </div>

              <button className="w-full flex items-center justify-center gap-3 bg-slate-800 hover:bg-slate-700 text-slate-100 font-medium py-3 px-4 rounded-lg transition-colors border border-slate-700">
                <span className="material-symbols-outlined text-xl">mail</span>
                Login with Email
              </button>
            </div>

            {/* Footer Note */}
            <p className="mt-8 text-center text-xs text-slate-500">
              By connecting, you agree to our{' '}
              <a className="underline hover:text-primary" href="#">Terms of Service</a> and{' '}
              <a className="underline hover:text-primary" href="#">Privacy Policy</a>.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
