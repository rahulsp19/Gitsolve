import { Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import Login from './pages/Login'
import RepoSelector from './pages/RepoSelector'
import AnalysisProgress from './pages/AnalysisProgress'
import IssueSummary from './pages/IssueSummary'
import FixPreview from './pages/FixPreview'
import PRSuccess from './pages/PRSuccess'

export default function App() {
  return (
    <div className="min-h-screen bg-[#111921] text-slate-100 font-display">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/repos" element={<RepoSelector />} />
        <Route path="/analysis" element={<AnalysisProgress />} />
        <Route path="/issues" element={<IssueSummary />} />
        <Route path="/fix/:id" element={<FixPreview />} />
        <Route path="/pr-success" element={<PRSuccess />} />
      </Routes>
    </div>
  )
}
