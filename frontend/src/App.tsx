import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { supabase } from './lib/supabase'
import { useAuthStore } from './stores/authStore'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import IssuePage from './pages/IssuePage'
import AgentViewer from './pages/AgentViewer'
import AuthCallback from './pages/AuthCallback'
import RepositorySettings from './pages/RepositorySettings'
import PRPreview from './pages/PRPreview'

export default function App() {
  const { user, setSession, setUser } = useAuthStore()

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setUser(data.session?.user as any ?? null)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user as any ?? null)
    })
    return () => subscription.unsubscribe()
  }, [setSession, setUser])

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <Routes>
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/login" />} />
        <Route path="/repos/:repoId/settings" element={user ? <RepositorySettings /> : <Navigate to="/login" />} />
        <Route path="/issues/:issueId" element={user ? <IssuePage /> : <Navigate to="/login" />} />
        <Route path="/runs/:runId" element={user ? <AgentViewer /> : <Navigate to="/login" />} />
        <Route path="/runs/:runId/pr" element={user ? <PRPreview /> : <Navigate to="/login" />} />
        <Route path="*" element={<Navigate to={user ? '/dashboard' : '/login'} />} />
      </Routes>
    </div>
  )
}
