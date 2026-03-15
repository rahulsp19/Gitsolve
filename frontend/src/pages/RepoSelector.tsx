import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { langColors } from '@/lib/mockData'
import { useRepositories, useConnectRepository } from '@/hooks/useRepositories'
import { useAvailableRepositories } from '@/hooks/useAvailableRepositories'
import { useRecentActivity } from '@/hooks/useRecentActivity'
import { useDashboardAnalytics } from '@/hooks/useDashboardAnalytics'
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import { useAuthStore } from '@/stores/authStore'
import { useAnalysisStore } from '@/stores/analysisStore'
import { useNotificationStore } from '@/stores/notificationStore'
import { Logo } from '../components/Logo'
import { toast } from 'sonner'

type FilterType = 'all' | 'public' | 'private'
type SortType = 'updated' | 'stars' | 'name'

export default function RepoSelector() {
  const { user } = useAuthStore()
  const { data: repos = [] } = useRepositories()
  const { data: ghRepos = [] } = useAvailableRepositories()
  const { data: recentActivity = [], isLoading: isLoadingActivity } = useRecentActivity()
  const { data: analyticsData } = useDashboardAnalytics()
  const { mutate: connectRepo, isPending: isConnecting } = useConnectRepository()
  const { startAnalysis } = useAnalysisStore()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  
  useEffect(() => {
    // Subscribe to changes in ai_activity_log table for real-time dashboard updates
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ai_activity_log',
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['recent-activity'] })
          queryClient.invalidateQueries({ queryKey: ['dashboard-analytics'] })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [queryClient])
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState<FilterType>('all')
  const [sortBy, setSortBy] = useState<SortType>('updated')
  const [activeTab, setActiveTab] = useState('Repositories')
  
  const [showFilter, setShowFilter] = useState(false)
  const [showSort, setShowSort] = useState(false)
  const [showNewRepoModal, setShowNewRepoModal] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  
  const { notifications, unreadCount, markAllAsRead, markAsRead } = useNotificationStore()
  const hasUnreadNotifications = unreadCount > 0

  const enrichedRepos = repos.map(repo => {
    const ghRepo = ghRepos.find((gr: any) => gr.full_name === repo.full_name)
    return {
      ...repo,
      stars: ghRepo ? ghRepo.stargazers_count : (repo.stars || 0),
      open_issues: ghRepo ? ghRepo.open_issues_count : 0,
      visibility: ghRepo ? (ghRepo.private ? 'private' : 'public') : 'public',
      updated_at_date: ghRepo ? new Date(ghRepo.updated_at) : new Date(repo.created_at),
      updated_at_display: ghRepo ? new Date(ghRepo.updated_at).toLocaleDateString() : new Date(repo.created_at).toLocaleDateString(),
      html_url: ghRepo ? ghRepo.html_url : `https://github.com/${repo.full_name}`,
      description: ghRepo ? ghRepo.description : repo.description
    }
  })

  let filtered = enrichedRepos.filter(r =>
    r.full_name.toLowerCase().includes(search.toLowerCase())
  )

  if (filterType !== 'all') {
    filtered = filtered.filter(r => r.visibility === filterType)
  }

  filtered.sort((a, b) => {
    if (sortBy === 'name') return a.full_name.localeCompare(b.full_name)
    if (sortBy === 'stars') return b.stars - a.stars
    return b.updated_at_date.getTime() - a.updated_at_date.getTime()
  })

    const [repoUrlInput, setRepoUrlInput] = useState('')

    const handleConnectClick = () => {
      let repoName = repoUrlInput.trim()
      if (repoName.startsWith('https://github.com/')) {
        repoName = repoName.replace('https://github.com/', '')
      }
      if (repoName) {
        connectRepo(repoName, {
          onSuccess: () => {
             setShowNewRepoModal(false)
             setRepoUrlInput('')
             toast.success(`Successfully connected ${repoName}`, {
               duration: 3000,
               className: 'bg-slate-800 text-white border-green-500/50',
             })
          },
          onError: (err: any) => toast.error(`Failed to connect: ${err.message || err.toString()}`, {
            duration: 3000,
            className: 'bg-slate-800 text-white border-red-500/50',
          })
        })
      }
    }
  return (
    <div className="flex min-h-screen overflow-hidden bg-[#111921]">
      {/* Sidebar Navigation */}
      <aside className="hidden md:flex flex-col w-64 border-r border-primary/10 bg-[#111921]/50">
        <div className="p-6 border-b border-primary/10">
          <Link to="/" className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 border border-primary/20 rounded-lg shadow-lg shadow-primary/10 flex items-center justify-center">
              <Logo className="text-primary w-6 h-6" />
            </div>
            <span className="font-bold text-xl tracking-tight text-white">GitSolve</span>
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {[
            { icon: 'dashboard', label: 'Dashboard' },
            { icon: 'folder', label: 'Repositories' },
            { icon: 'analytics', label: 'Analytics' },
            { icon: 'history', label: 'Recent Activity' },
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => setActiveTab(item.label)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === item.label ? 'bg-primary/10 text-primary font-semibold' : 'hover:bg-primary/5 text-slate-300'
              }`}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
        <button 
          onClick={() => setActiveTab('Settings')}
          className="p-4 border-t border-primary/10 w-full text-left hover:bg-primary/5 transition-colors cursor-pointer block"
        >
          <div className="flex items-center gap-3 w-full px-4 text-slate-400 hover:text-white transition-colors">
            <span className="material-symbols-outlined font-medium">settings</span>
            <span className="font-medium">Settings</span>
          </div>
        </button>
        <Link 
          to="/"
          className="p-4 pb-6 w-full text-left hover:bg-red-500/5 transition-colors cursor-pointer block group"
        >
          <div className="flex items-center gap-3 w-full px-4 text-slate-400 group-hover:text-red-400 transition-colors">
            <span className="material-symbols-outlined font-medium">logout</span>
            <span className="font-medium">Log Out</span>
          </div>
        </Link>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-0 relative">
        {/* Header */}
        <header className="flex items-center justify-between p-4 md:px-8 border-b border-primary/10 bg-[#111921]/50 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <button className="md:hidden text-slate-500">
              <span className="material-symbols-outlined">menu</span>
            </button>
            <h2 className="text-xl font-bold text-white">{activeTab}</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-slate-500 hover:text-primary transition-colors relative"
              >
                <span className="material-symbols-outlined">notifications</span>
                {hasUnreadNotifications && <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>}
              </button>
              
              {showNotifications && (
                <div className="absolute top-full mt-2 right-0 w-80 bg-[#161b22] border border-primary/20 rounded-xl shadow-2xl z-50 overflow-hidden animate-fade-in">
                  <div className="p-4 border-b border-primary/10 flex justify-between items-center bg-[#111921]">
                    <h4 className="font-bold text-white text-sm">Notifications</h4>
                    {hasUnreadNotifications && (
                      <button onClick={markAllAsRead} className="text-xs text-primary hover:text-primary/80 transition-colors">Mark all read</button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-slate-500 text-sm">No notifications.</div>
                    ) : (
                      notifications.map((n) => (
                        <div 
                          key={n.id} 
                          onClick={() => !n.read_status && markAsRead(n.id)}
                          className={`p-4 border-b border-primary/5 hover:bg-primary/5 transition-colors cursor-pointer ${!n.read_status ? 'bg-primary/5' : ''}`}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <p className={`text-sm font-semibold ${!n.read_status ? 'text-white' : 'text-slate-300'}`}>
                              {n.event_type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                            </p>
                            <span className="text-xs text-slate-500">{new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <p className="text-xs text-slate-400">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="p-3 bg-[#111921] border-t border-primary/10 text-center">
                    <button onClick={() => { setShowNotifications(false); setActiveTab('Recent Activity'); }} className="text-xs font-semibold text-slate-400 hover:text-primary transition-colors">View all activity</button>
                  </div>
                </div>
              )}
            </div>
            <button 
              onClick={() => setShowNewRepoModal(true)}
              className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-lg shadow-primary/20"
            >
              <span className="material-symbols-outlined text-sm">add</span>New Repository
            </button>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          {activeTab === 'Repositories' || activeTab === 'Dashboard' ? (
            <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
              {/* Search & Filters */}
              <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center">
                <div className="flex-1 relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                  <input
                    className="w-full pl-12 pr-4 py-3 bg-[#111921] border border-primary/20 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-slate-100 placeholder:text-slate-500"
                    placeholder="Search your repositories (e.g. ecommerce-backend)..."
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <div className="relative">
                    <button 
                      onClick={() => { setShowFilter(!showFilter); setShowSort(false); }}
                      className={`flex items-center gap-2 px-4 py-3 bg-[#111921] border ${showFilter || filterType !== 'all' ? 'border-primary text-primary' : 'border-primary/20 text-slate-300'} rounded-xl hover:bg-primary/5 transition-colors`}
                    >
                      <span className="material-symbols-outlined text-xl">filter_list</span>
                      <span className="text-sm font-medium">Filter {filterType !== 'all' && `(${filterType})`}</span>
                    </button>
                    {showFilter && (
                      <div className="absolute top-full right-0 mt-2 w-48 bg-[#161b22] border border-primary/20 rounded-xl shadow-xl z-20 py-2">
                        <button onClick={() => { setFilterType('all'); setShowFilter(false); }} className="w-full text-left px-4 py-2 hover:bg-primary/10 text-sm text-slate-300">All Repositories</button>
                        <button onClick={() => { setFilterType('public'); setShowFilter(false); }} className="w-full text-left px-4 py-2 hover:bg-primary/10 text-sm text-slate-300">Public Only</button>
                        <button onClick={() => { setFilterType('private'); setShowFilter(false); }} className="w-full text-left px-4 py-2 hover:bg-primary/10 text-sm text-slate-300">Private Only</button>
                      </div>
                    )}
                  </div>
                  
                  <div className="relative">
                    <button 
                      onClick={() => { setShowSort(!showSort); setShowFilter(false); }}
                      className={`flex items-center gap-2 px-4 py-3 bg-[#111921] border ${showSort ? 'border-primary text-primary' : 'border-primary/20 text-slate-300'} rounded-xl hover:bg-primary/5 transition-colors`}
                    >
                      <span className="material-symbols-outlined text-xl">sort</span>
                      <span className="text-sm font-medium">Sort ({sortBy})</span>
                    </button>
                    {showSort && (
                      <div className="absolute top-full right-0 mt-2 w-48 bg-[#161b22] border border-primary/20 rounded-xl shadow-xl z-20 py-2">
                        <button onClick={() => { setSortBy('updated'); setShowSort(false); }} className="w-full text-left px-4 py-2 hover:bg-primary/10 text-sm text-slate-300">Recently Updated</button>
                        <button onClick={() => { setSortBy('stars'); setShowSort(false); }} className="w-full text-left px-4 py-2 hover:bg-primary/10 text-sm text-slate-300">Most Stars</button>
                        <button onClick={() => { setSortBy('name'); setShowSort(false); }} className="w-full text-left px-4 py-2 hover:bg-primary/10 text-sm text-slate-300">Name (A-Z)</button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Repository Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((repo) => (
                  <div key={repo.id} className="group bg-[#111921] border border-primary/20 p-6 rounded-xl hover:border-primary/50 transition-all duration-200 ease-out flex flex-col shadow-sm hover:shadow-[0_10px_20px_rgba(0,0,0,0.4)] hover:-translate-y-1 relative">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg text-primary">
                          <span className="material-symbols-outlined">{repo.visibility === 'private' ? 'lock' : 'public'}</span>
                        </div>
                        <h3 className="font-bold text-lg text-white group-hover:text-primary transition-colors">{repo.full_name.split('/')[1]}</h3>
                      </div>
                      <span className={`px-2 py-1 flex items-center gap-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                        repo.visibility === 'public'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                      }`}>
                        <span className="material-symbols-outlined text-[12px]">{repo.visibility === 'public' ? 'public' : 'lock'}</span>
                        {repo.visibility}
                      </span>
                    </div>
                    <p className="text-slate-400 text-sm mb-6 line-clamp-2">{repo.description || "No description provided format for this repository."}</p>
                    <div className="mt-auto space-y-4">
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <div className="flex items-center gap-1.5" title="Language">
                          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: langColors[repo.language] || '#888' }}></span>
                          <span>{repo.language || 'Unknown'}</span>
                        </div>
                        <div className="flex items-center gap-1.5" title="Stars">
                          <span className="material-symbols-outlined text-sm text-yellow-500">star</span>
                          <span>{repo.stars >= 1000 ? `${(repo.stars / 1000).toFixed(1)}k` : repo.stars}</span>
                        </div>
                        <div className="flex items-center gap-1.5" title="Open Issues">
                          <span className="material-symbols-outlined text-sm text-red-400">bug_report</span>
                          <span>{repo.open_issues}</span>
                        </div>
                        <div className="flex items-center gap-1.5" title="Last Updated">
                          <span className="material-symbols-outlined text-sm">schedule</span>
                          <span>{repo.updated_at_display}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            startAnalysis(repo.full_name)
                            navigate('/analysis')
                          }}
                          className="flex-1 py-2.5 bg-primary/10 text-primary border border-primary/20 rounded-lg font-semibold hover:bg-primary hover:text-white hover:brightness-110 transition-all duration-200 ease-out hover:-translate-y-0.5 active:scale-[0.98] flex items-center justify-center gap-2"
                        >
                          Analyze Repository
                          <span className="material-symbols-outlined text-sm">arrow_forward</span>
                        </button>
                        <a
                          href={repo.html_url}
                          target="_blank"
                          rel="noopener noreferrer" 
                          className="px-3 py-2.5 bg-[#161b22] text-slate-300 border border-primary/20 rounded-lg hover:text-white hover:border-primary/50 transition-all flex items-center justify-center"
                          title="Open on GitHub"
                        >
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"></path></svg>
                        </a>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Connect New Repo Card */}
                <button 
                  onClick={() => setShowNewRepoModal(true)}
                  className="border-2 border-dashed border-primary/20 p-6 rounded-xl flex flex-col items-center justify-center text-center space-y-4 bg-primary/5 group hover:border-primary transition-colors cursor-pointer"
                >
                  <div className="p-3 rounded-full bg-[#111921] shadow-sm group-hover:text-primary transition-colors">
                    <span className="material-symbols-outlined text-3xl">add</span>
                  </div>
                  <div>
                    <p className="font-semibold text-white">Connect New Repository</p>
                    <p className="text-xs text-slate-400 mt-1">Import from GitHub, GitLab or Bitbucket</p>
                  </div>
                </button>
              </div>
              
              {filtered.length === 0 && (
                <div className="py-20 text-center">
                  <span className="material-symbols-outlined text-6xl text-slate-700 mb-4">search_off</span>
                  <h3 className="text-xl font-bold text-white mb-2">No repositories found</h3>
                  <p className="text-slate-400">Try adjusting your search or filters to find what you're looking for.</p>
                  <button 
                    onClick={() => { setSearch(''); setFilterType('all'); }}
                    className="mt-6 px-4 py-2 text-primary font-medium hover:bg-primary/10 rounded-lg transition-colors"
                  >
                    Clear Filters
                  </button>
                </div>
              )}
            </div>
          ) : activeTab === 'Analytics' ? (
            <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
                <div>
                  <h3 className="text-xl font-bold text-white">Organization Analytics</h3>
                  <p className="text-slate-400 text-sm mt-1">Overview of repository health and agent performance.</p>
                </div>
                <div className="flex gap-2">
                  <button className="px-4 py-2 bg-[#111921] border border-primary/20 rounded-lg text-sm hover:bg-primary/5 transition-colors text-slate-300">Last 7 Days</button>
                  <button className="px-4 py-2 bg-primary/10 text-primary border border-primary/20 rounded-lg text-sm font-medium hover:bg-primary/20 transition-colors">Last 30 Days</button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: "Total Repos", value: analyticsData?.stats?.total_repos || 0, icon: 'folder', change: "+1 recently", up: true },
                  { label: "Total Stars", value: repos.reduce((acc, r) => acc + (ghRepos.find((gr: any) => gr.full_name === r.full_name)?.stargazers_count || r.stars || 0), 0).toLocaleString(), icon: 'star', change: "Updated live", up: true },
                  { label: "Issues Resolved", value: analyticsData?.stats?.issues_resolved || 0, icon: 'task_alt', change: "Overall", up: true },
                  { label: "AI Scans Run", value: analyticsData?.stats?.ai_scans_run || 0, icon: 'robot_2', change: "Overall", up: true },
                ].map((stat, i) => (
                  <div key={i} className="bg-[#111921] border border-primary/10 rounded-xl p-6 shadow-sm hover:border-primary/30 transition-colors group">
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-3 bg-primary/10 text-primary rounded-lg text-xl group-hover:scale-110 transition-transform"><span className="material-symbols-outlined">{stat.icon}</span></div>
                    </div>
                    <div>
                      <h4 className="text-slate-400 text-sm font-medium mb-1">{stat.label}</h4>
                      <p className="text-3xl font-bold text-white mb-2">{stat.value}</p>
                      <p className={`text-xs flex items-center gap-1 ${stat.up ? 'text-emerald-400' : 'text-red-400'}`}>
                        <span className="material-symbols-outlined text-[14px]">info</span>
                        {stat.change}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                 <div className="bg-[#111921] border border-primary/10 rounded-xl p-6 shadow-sm min-h-[300px] flex flex-col hover:border-primary/30 transition-colors">
                    <h4 className="font-semibold text-white mb-4">Resolution Rate</h4>
                    <div className="flex-1 flex items-center justify-center text-center text-slate-500 w-full h-full">
                      {(analyticsData?.stats?.issues_detected ?? 0) > 0 || (analyticsData?.stats?.issues_resolved ?? 0) > 0 ? (
                        <ResponsiveContainer width="100%" height={250}>
                          <BarChart data={[
                            { name: 'Detected', count: analyticsData?.stats?.issues_detected || 0, fill: '#ef4444' },
                            { name: 'Resolved', count: analyticsData?.stats?.issues_resolved || 0, fill: '#10b981' }
                          ]}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                            <XAxis dataKey="name" stroke="#94a3b8" />
                            <YAxis stroke="#94a3b8" />
                            <RechartsTooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                            <Bar dataKey="count" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <div>
                          <span className="material-symbols-outlined text-5xl mb-3 opacity-30">bar_chart</span>
                          <p className="text-sm">No issues data available</p>
                        </div>
                      )}
                    </div>
                 </div>
                 <div className="bg-[#111921] border border-primary/10 rounded-xl p-6 shadow-sm min-h-[300px] flex flex-col hover:border-primary/30 transition-colors">
                    <h4 className="font-semibold text-white mb-4">Issue Types Breakdown</h4>
                    <div className="flex-1 flex items-center justify-center text-center text-slate-500 w-full h-full">
                      {analyticsData?.issueBreakdown && analyticsData.issueBreakdown.length > 0 ? (
                        <ResponsiveContainer width="100%" height={250}>
                          <PieChart>
                            <Pie
                              data={analyticsData.issueBreakdown}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={80}
                              paddingAngle={5}
                              dataKey="count"
                              nameKey="classification"
                            >
                              {analyticsData.issueBreakdown.map((_entry: any, index: number) => {
                                const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#64748b'];
                                return <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />;
                              })}
                            </Pie>
                            <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                          </PieChart>
                        </ResponsiveContainer>
                      ) : (
                        <div>
                           <span className="material-symbols-outlined text-5xl mb-3 opacity-30">pie_chart</span>
                           <p className="text-sm">No issue types available</p>
                        </div>
                      )}
                    </div>
                 </div>
              </div>
            </div>
          ) : activeTab === 'Recent Activity' ? (
             <div className="max-w-4xl mx-auto space-y-8 animate-fade-in py-4">
                <div className="flex items-center justify-between mb-8 border-b border-primary/10 pb-6">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">Activity Feed</h3>
                    <p className="text-slate-400 text-sm">Recent actions performed by you and the AI agents.</p>
                  </div>
                  <button className="text-sm text-primary hover:text-primary/80 font-medium transition-colors">Mark all as read</button>
                </div>
                
                <div className="relative border-l-2 border-primary/20 ml-4 space-y-8">
                  {isLoadingActivity ? (
                    <div className="text-slate-500 pl-8">Loading activity feed...</div>
                  ) : recentActivity.length === 0 ? (
                    <div className="text-slate-500 pl-8">No recent activity found.</div>
                  ) : recentActivity.map((activity: any, i: number) => (
                    <div key={i} className="pl-8 relative group">
                      <span className={`absolute -left-[17px] top-1 w-8 h-8 rounded-full border-2 flex items-center justify-center bg-[#111921] ${activity.bg} ${activity.color} transition-transform group-hover:scale-110`}>
                        <span className="material-symbols-outlined text-[16px]">{activity.icon}</span>
                      </span>
                      <div className="bg-[#111921] border border-primary/10 rounded-xl p-5 hover:border-primary/30 transition-colors shadow-sm cursor-pointer">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold text-white group-hover:text-primary transition-colors">{activity.title}</h4>
                          <span className="text-xs text-slate-500 whitespace-nowrap">{activity.time}</span>
                        </div>
                        <p className="text-sm text-slate-400">
                          in <span className="text-slate-300 font-medium px-2 py-0.5 rounded bg-primary/5 border border-primary/10">{activity.repo}</span>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
             </div>
          ) : activeTab === 'Settings' ? (
            <div className="max-w-4xl mx-auto space-y-8 animate-fade-in py-4">
              <div className="flex items-center justify-between mb-8 border-b border-primary/10 pb-6">
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">Settings</h3>
                  <p className="text-slate-400 text-sm">Manage your account and GitSolve preferences.</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-1 space-y-2">
                  <h4 className="font-semibold text-white">Profile Settings</h4>
                  <p className="text-sm text-slate-400">Update your personal information and email address.</p>
                </div>
                <div className="md:col-span-2 bg-[#111921] border border-primary/10 rounded-xl p-6 shadow-sm">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Display Name</label>
                        <input type="text" defaultValue={user?.login || 'User'} className="w-full bg-[#161b22] border border-primary/20 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-primary focus:outline-none transition-colors" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
                        <input type="email" defaultValue={user?.email || ''} className="w-full bg-[#161b22] border border-primary/20 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-primary focus:outline-none transition-colors" />
                    </div>
                    <button className="bg-primary/20 text-primary hover:bg-primary hover:text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">Save Changes</button>
                  </div>
                </div>
                <div className="col-span-1 md:col-span-3 border-t border-primary/10 my-4"></div>
                <div className="md:col-span-1 space-y-2">
                  <h4 className="font-semibold text-white">Connected Accounts</h4>
                  <p className="text-sm text-slate-400">Manage your connected source control providers.</p>
                </div>
                <div className="md:col-span-2 bg-[#111921] border border-primary/10 rounded-xl p-6 shadow-sm">
                  <div className="flex items-center justify-between p-4 bg-[#161b22] border border-primary/20 rounded-lg">
                    <div className="flex items-center gap-3">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"></path></svg>
                      <div>
                        <p className="font-semibold text-white">GitHub</p>
                          <p className="text-xs text-slate-400">Connected as @{user?.login || 'user'}</p>
                      </div>
                    </div>
                    <button className="text-sm bg-[#111921] border border-primary/20 text-slate-300 px-3 py-1.5 rounded-lg hover:border-primary/50 transition-colors">Disconnect</button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center max-w-md mx-auto animate-fade-in">
              <span className="material-symbols-outlined text-6xl text-primary/40 mb-6 border-4 border-primary/20 rounded-full p-6 bg-primary/5">
                error
              </span>
              <h2 className="text-2xl font-bold text-white mb-2">Page Not Found</h2>
              <button 
                onClick={() => setActiveTab('Repositories')}
                className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg font-medium transition-all shadow-lg shadow-primary/20 mt-4"
              >
                Back to Repositories
              </button>
            </div>
          )}
        </div>
        
        {/* New Repository Modal */}
        {showNewRepoModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0b0f14]/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-[#111921] border border-primary/20 rounded-2xl p-6 w-full max-w-md shadow-2xl relative">
              <button 
                onClick={() => setShowNewRepoModal(false)}
                className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
              <h3 className="text-xl font-bold text-white mb-2">Connect Repository</h3>
              <p className="text-slate-400 text-sm mb-6">Enter the URL of the repository you want to connect to GitSolve.</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Repository URL or Name (owner/repo)</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">link</span>
                    <input 
                      type="text" 
                      placeholder="https://github.com/username/repo or username/repo" 
                      value={repoUrlInput}
                      onChange={(e) => setRepoUrlInput(e.target.value)}
                      className="w-full bg-[#161b22] border border-primary/20 rounded-lg pl-10 pr-4 py-2 text-white focus:ring-2 focus:ring-primary focus:outline-none transition-colors" 
                    />
                  </div>
                </div>
                <button 
                  onClick={handleConnectClick}
                  disabled={isConnecting}
                  className="w-full bg-primary hover:bg-primary/90 text-white px-4 py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {isConnecting ? 'Connecting...' : 'Connect Repository'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}





