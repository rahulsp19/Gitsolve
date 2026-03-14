import { useState } from 'react'
import { Link } from 'react-router-dom'
import { mockRepositories, langColors } from '@/lib/mockData'

export default function RepoSelector() {
  const [search, setSearch] = useState('')
  const filtered = mockRepositories.filter(r =>
    r.full_name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex min-h-screen overflow-hidden bg-[#111921]">
      {/* Sidebar Navigation */}
      <aside className="hidden md:flex flex-col w-64 border-r border-primary/10 bg-[#111921]/50">
        <div className="p-6 border-b border-primary/10">
          <Link to="/" className="flex items-center gap-3">
            <div className="p-2 bg-primary rounded-lg text-white">
              <span className="material-symbols-outlined">terminal</span>
            </div>
            <span className="font-bold text-xl tracking-tight">GitSolve</span>
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {[
            { icon: 'dashboard', label: 'Dashboard', active: true },
            { icon: 'folder', label: 'Repositories', active: false },
            { icon: 'analytics', label: 'Analytics', active: false },
            { icon: 'history', label: 'Recent Activity', active: false },
          ].map((item) => (
            <a
              key={item.label}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                item.active ? 'bg-primary/10 text-primary font-semibold' : 'hover:bg-primary/5'
              }`}
              href="#"
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              {item.label}
            </a>
          ))}
        </nav>
        <div className="p-4 border-t border-primary/10">
          <a className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-primary/5 transition-colors text-slate-400" href="#">
            <span className="material-symbols-outlined">settings</span>Settings
          </a>
          <div className="mt-4 flex items-center gap-3 px-4">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">A</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">Alex Dev</p>
              <p className="text-xs text-slate-500 truncate">Premium Plan</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-0 relative">
        {/* Header */}
        <header className="flex items-center justify-between p-4 md:px-8 border-b border-primary/10 bg-[#111921]/50 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <button className="md:hidden text-slate-500">
              <span className="material-symbols-outlined">menu</span>
            </button>
            <h2 className="text-xl font-bold">Select Repository</h2>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-500 hover:text-primary transition-colors">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <button className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">add</span>New Repository
            </button>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-6xl mx-auto space-y-6">
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
                <button className="flex items-center gap-2 px-4 py-3 bg-[#111921] border border-primary/20 rounded-xl hover:bg-primary/5 transition-colors">
                  <span className="material-symbols-outlined text-xl">filter_list</span>
                  <span className="text-sm font-medium">Filter</span>
                </button>
                <button className="flex items-center gap-2 px-4 py-3 bg-[#111921] border border-primary/20 rounded-xl hover:bg-primary/5 transition-colors">
                  <span className="material-symbols-outlined text-xl">sort</span>
                  <span className="text-sm font-medium">Sort</span>
                </button>
              </div>
            </div>

            {/* Repository Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((repo) => (
                <div key={repo.id} className="group bg-[#111921] border border-primary/10 p-6 rounded-xl hover:border-primary/50 transition-all flex flex-col shadow-sm hover:shadow-md">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg text-primary">
                        <span className="material-symbols-outlined">{repo.visibility === 'private' ? 'lock' : 'folder_open'}</span>
                      </div>
                      <h3 className="font-bold text-lg group-hover:text-primary transition-colors">{repo.full_name.split('/')[1]}</h3>
                    </div>
                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                      repo.visibility === 'public'
                        ? 'bg-green-500/10 text-green-400'
                        : 'bg-primary/20 text-slate-400'
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
                      className="w-full py-2.5 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                      Analyze Repository
                      <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </Link>
                  </div>
                </div>
              ))}

              {/* Connect New Repo Card */}
              <Link to="#" className="border-2 border-dashed border-primary/20 p-6 rounded-xl flex flex-col items-center justify-center text-center space-y-4 bg-primary/5 group hover:border-primary transition-colors cursor-pointer">
                <div className="p-3 rounded-full bg-[#111921] shadow-sm group-hover:text-primary transition-colors">
                  <span className="material-symbols-outlined text-3xl">add</span>
                </div>
                <div>
                  <p className="font-semibold">Connect New Repository</p>
                  <p className="text-xs text-slate-400">Import from GitHub, GitLab or Bitbucket</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
