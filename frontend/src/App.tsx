import { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { supabase } from './lib/supabase'
import { useAuthStore } from './stores/authStore'
import LandingPage from './pages/LandingPage'
import Login from './pages/Login'
import RepoSelector from './pages/RepoSelector'
import AnalysisProgress from './pages/AnalysisProgress'
import IssueSummary from './pages/IssueSummary'
import FixPreview from './pages/FixPreview'
import PRSuccess from './pages/PRSuccess'
import { NotificationProvider } from './components/NotificationProvider'

export default function App() {
  const { setUser, setSession } = useAuthStore()

  useEffect(() => {
    const handleSession = (session: any) => {
      setSession(session)
      if (session?.user) {
        const github_id = parseInt(session.user.identities?.[0]?.identity_data?.provider_id || '0')
        const login = session.user.user_metadata?.user_name || 'user'
        const email = session.user.email
        const avatar_url = session.user.user_metadata?.avatar_url
        
        setUser({
          id: session.user.id,
          github_id,
          login,
          email,
          avatar_url,
          created_at: session.user.created_at,
        })

        if (session.provider_token) {
          supabase.from('users').upsert({
            id: session.user.id,
            github_id,
            login,
            email,
            avatar_url,
            github_token: session.provider_token
          }).then(({ error }) => {
            if (error) console.error('Error syncing user:', error)
          })
        }
      } else {
        setUser(null)
      }
    }

    supabase.auth.getSession().then(({ data: { session } }) => handleSession(session))

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => handleSession(session))

    return () => subscription.unsubscribe()
  }, [setUser, setSession])

  return (
    <div className="min-h-screen bg-[#111921] text-slate-100 font-display">
      <NotificationProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/repos" element={<RepoSelector />} />
          <Route path="/analysis" element={<AnalysisProgress />} />
          <Route path="/issues" element={<IssueSummary />} />
          <Route path="/fix/:id" element={<FixPreview />} />
          <Route path="/pr-success" element={<PRSuccess />} />
        </Routes>
      </NotificationProvider>
    </div>
  )
}
