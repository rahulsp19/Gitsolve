import { useState } from 'react'
import { Link } from 'react-router-dom'
import { mockRepositories, langColors } from '@/lib/mockData'

type FilterType = 'all' | 'public' | 'private'
type SortType = 'updated' | 'stars' | 'name'

export default function RepoSelector() {
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState<FilterType>('all')
  const [sortBy, setSortBy] = useState<SortType>('updated')
  const [activeTab, setActiveTab] = useState('Repositories')
  
  const [showFilter, setShowFilter] = useState(false)
  const [showSort, setShowSort] = useState(false)
  const [showNewRepoModal, setShowNewRepoModal] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(true)

  let filtered = mockRepositories.filter(r =>
    r.full_name.toLowerCase().includes(search.toLowerCase())
  )

  if (filterType !== 'all') {
    filtered = filtered.filter(r => r.visibility === filterType)
  }

  filtered.sort((a, b) => {
    if (sortBy === 'name') return a.full_name.localeCompare(b.full_name)
    if (sortBy === 'stars') return b.stars - a.stars
    
    // Sort logic for updated_at mock strings like "2h ago", "1d ago"
    const parseTime = (t: string) => {
      if (t.includes('h')) return parseInt(t) * 1
      if (t.includes('d')) return parseInt(t) * 24
      return 0
    }
    return parseTime(a.updated_at) - parseTime(b.updated_at)
  })

  return (
    <div className="flex min-h-screen overflow-hidden bg-[#111921]">
      {/* Sidebar Navigation */}
      <aside className="hidden md:flex flex-col w-64 border-r border-primary/10 bg-[#111921]/50">
        <div className="p-6 border-b border-primary/10">
          <Link to="/" className="flex items-center gap-3">
            <div className="p-2 bg-primary rounded-lg text-white shadow-lg shadow-primary/20">
              <span className="material-symbols-outlined">terminal</span>
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
                      <button onClick={() => setHasUnreadNotifications(false)} className="text-xs text-primary hover:text-primary/80 transition-colors">Mark all read</button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {[
                      { title: 'Action Required', detail: 'Review PR #442 for nexus-dashboard', time: '10m ago', unread: hasUnreadNotifications },
                      { title: 'Analysis Complete', detail: 'Found 3 critical issues in ecommerce-api', time: '1h ago', unread: hasUnreadNotifications },
                      { title: 'Agent Deployed', detail: 'GitSolve began working on Issue #21', time: '5h ago', unread: false }
                    ].map((n, i) => (
                      <div key={i} className={`p-4 border-b border-primary/5 hover:bg-primary/5 transition-colors cursor-pointer ${n.unread ? 'bg-primary/5' : ''}`}>
                        <div className="flex justify-between items-start mb-1">
                          <p className={`text-sm font-semibold ${n.unread ? 'text-white' : 'text-slate-300'}`}>{n.title}</p>
                          <span className="text-xs text-slate-500">{n.time}</span>
                        </div>
                        <p className="text-xs text-slate-400">{n.detail}</p>
                      </div>
                    ))}
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
                  <div key={repo.id} className="group bg-[#111921] border border-primary/20 p-6 rounded-xl hover:border-primary/50 transition-all flex flex-col shadow-sm hover:shadow-md hover:shadow-primary/5">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg text-primary">
                          <span className="material-symbols-outlined">{repo.visibility === 'private' ? 'lock' : 'folder_open'}</span>
                        </div>
                        <h3 className="font-bold text-lg text-white group-hover:text-primary transition-colors">{repo.full_name.split('/')[1]}</h3>
                      </div>
                      <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                        repo.visibility === 'public'
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        {repo.visibility}
                      </span>
                    </div>
                    <p className="text-slate-400 text-sm mb-6 line-clamp-2">{repo.description}</p>
                    <div className="mt-auto space-y-4">
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: langColors[repo.language] || '#888' }}></span>
                          <span>{repo.language}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-sm">star</span>
                          <span>{repo.stars >= 1000 ? `${(repo.stars / 1000).toFixed(1)}k` : repo.stars}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-sm">schedule</span>
                          <span>{repo.updated_at}</span>
                        </div>
                      </div>
                      <Link
                        to="/analysis"
                        className="w-full py-2.5 bg-primary/10 text-primary border border-primary/20 rounded-lg font-semibold hover:bg-primary hover:text-white transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                      >
                        Analyze Repository
                        <span className="material-symbols-outlined text-sm">arrow_forward</span>
                      </Link>
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
                  { label: "Total Repos", value: mockRepositories.length, icon: 'folder', change: "+2 this month", up: true },
                  { label: "Total Stars", value: mockRepositories.reduce((acc, r) => acc + r.stars, 0).toLocaleString(), icon: 'star', change: "+140 this week", up: true },
                  { label: "Issues Resolved", value: "324", icon: 'task_alt', change: "+12% vs last month", up: true },
                  { label: "AI Scans Run", value: "1,208", icon: 'robot_2', change: "+8% vs last month", up: true },
                ].map((stat, i) => (
                  <div key={i} className="bg-[#111921] border border-primary/10 rounded-xl p-6 shadow-sm hover:border-primary/30 transition-colors group">
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-3 bg-primary/10 text-primary rounded-lg text-xl group-hover:scale-110 transition-transform"><span className="material-symbols-outlined">{stat.icon}</span></div>
                    </div>
                    <div>
                      <h4 className="text-slate-400 text-sm font-medium mb-1">{stat.label}</h4>
                      <p className="text-3xl font-bold text-white mb-2">{stat.value}</p>
                      <p className={`text-xs flex items-center gap-1 ${stat.up ? 'text-emerald-400' : 'text-red-400'}`}>
                        <span className="material-symbols-outlined text-[14px]">{stat.up ? 'trending_up' : 'trending_down'}</span>
                        {stat.change}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                 <div className="bg-[#111921] border border-primary/10 rounded-xl p-6 shadow-sm min-h-[300px] flex flex-col hover:border-primary/30 transition-colors">
                    <h4 className="font-semibold text-white mb-auto">Resolution Rate</h4>
                    <div className="flex-1 flex items-center justify-center text-center text-slate-500">
                      <div>
                        <span className="material-symbols-outlined text-5xl mb-3 opacity-30">bar_chart</span>
                        <p className="text-sm">Mock visualization placeholder</p>
                      </div>
                    </div>
                 </div>
                 <div className="bg-[#111921] border border-primary/10 rounded-xl p-6 shadow-sm min-h-[300px] flex flex-col hover:border-primary/30 transition-colors">
                    <h4 className="font-semibold text-white mb-auto">Issue Types Breakdown</h4>
                    <div className="flex-1 flex items-center justify-center text-center text-slate-500">
                      <div>
                         <span className="material-symbols-outlined text-5xl mb-3 opacity-30">pie_chart</span>
                         <p className="text-sm">Mock visualization placeholder</p>
                      </div>
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
                  {[
                    { type: 'pr', title: 'GitSolve AI opened a Pull Request', repo: 'nexus-dashboard', time: '10 minutes ago', icon: 'merge', color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
                    { type: 'scan_complete', title: 'Security Scan Completed', repo: 'auth-service-v2', time: '2 hours ago', icon: 'shield', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
                    { type: 'issue', title: '3 new Critical Issues detected', repo: 'ml-data-pipeline', time: '5 hours ago', icon: 'bug_report', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
                    { type: 'repo_added', title: 'Alex Dev connected a new repository', repo: 'mobile-app-ui', time: 'Yesterday', icon: 'add_link', color: 'text-primary', bg: 'bg-primary/10 border-primary/20' },
                    { type: 'pr_merged', title: 'Alex Dev merged Pull Request #442', repo: 'nexus-dashboard', time: 'Yesterday', icon: 'check_circle', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
                  ].map((activity, i) => (
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
                      <input type="text" defaultValue="Alex Dev" className="w-full bg-[#161b22] border border-primary/20 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-primary focus:outline-none transition-colors" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
                      <input type="email" defaultValue="alex@example.com" className="w-full bg-[#161b22] border border-primary/20 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-primary focus:outline-none transition-colors" />
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
                        <p className="text-xs text-slate-400">Connected as @alexdev</p>
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
                  <label className="block text-sm font-medium text-slate-300 mb-2">Repository URL</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">link</span>
                    <input type="text" placeholder="https://github.com/username/repo" className="w-full bg-[#161b22] border border-primary/20 rounded-lg pl-10 pr-4 py-2 text-white focus:ring-2 focus:ring-primary focus:outline-none transition-colors" />
                  </div>
                </div>
                <button 
                  onClick={() => {
                    setShowNewRepoModal(false);
                  }}
                  className="w-full bg-primary hover:bg-primary/90 text-white px-4 py-3 rounded-lg font-medium transition-colors"
                >
                  Connect Repository
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
