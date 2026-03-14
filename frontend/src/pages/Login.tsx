import { getGitHubOAuthUrl, generateOAuthState } from '@/lib/github'

export default function Login() {
  const handleLogin = () => {
    const state = generateOAuthState()
    sessionStorage.setItem('oauth_state', state)
    window.location.href = getGitHubOAuthUrl(state)
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold text-white">Agentic Issue Resolver</h1>
        <p className="text-slate-400">Autonomous AI developer for your GitHub repositories</p>
        <button
          onClick={handleLogin}
          className="px-6 py-3 bg-slate-800 text-white rounded-lg border border-slate-600 hover:border-brand-500 transition-colors"
        >
          Sign in with GitHub
        </button>
      </div>
    </div>
  )
}
