import { Link } from 'react-router-dom'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0b0f14] text-slate-100">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-slate-800 bg-[#0b0f14]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-3xl">terminal</span>
              <span className="text-lg font-bold tracking-tight">GitSolve</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a className="text-sm font-medium hover:text-primary transition-colors" href="#features">Features</a>
              <a className="text-sm font-medium hover:text-primary transition-colors" href="#demo">Demo</a>
              <a className="text-sm font-medium hover:text-primary transition-colors" href="#pricing">Docs</a>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/login" className="text-sm font-semibold hover:text-primary">Sign In</Link>
              <Link to="/login" className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg font-bold text-sm transition-all">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main>
        <div className="relative overflow-hidden pt-16 pb-24 lg:pt-32 lg:pb-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="lg:grid lg:grid-cols-12 lg:gap-12 items-center">
              <div className="lg:col-span-6 animate-fade-in">
                <div className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold leading-6 text-primary bg-primary/10 ring-1 ring-inset ring-primary/20 mb-6">
                  Now in Public Beta
                </div>
                <h1 className="text-4xl font-black tracking-tight sm:text-6xl mb-6 leading-[1.1]">
                  Agentic GitHub <br /><span className="text-primary">Issue Resolver</span>
                </h1>
                <p className="text-lg text-slate-400 mb-8 leading-relaxed">
                  Autonomous AI that reads GitHub issues, fixes bugs, and creates pull requests. Stop manual debugging and let AI handle your backlog while you focus on building features.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    to="/login"
                    className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white px-8 py-4 rounded-lg font-bold text-lg transition-all shadow-lg shadow-primary/20"
                  >
                    <span className="material-symbols-outlined">terminal</span>
                    Login with GitHub
                  </Link>
                  <a
                    href="#demo"
                    className="flex items-center justify-center gap-2 border border-slate-700 hover:bg-slate-800 px-8 py-4 rounded-lg font-bold text-lg transition-all"
                  >
                    View Demo
                  </a>
                </div>
                <div className="mt-10 flex items-center gap-4 text-sm text-slate-500">
                  <div className="flex -space-x-2">
                    <div className="h-8 w-8 rounded-full border-2 border-[#0b0f14] bg-slate-400"></div>
                    <div className="h-8 w-8 rounded-full border-2 border-[#0b0f14] bg-slate-500"></div>
                    <div className="h-8 w-8 rounded-full border-2 border-[#0b0f14] bg-slate-600"></div>
                  </div>
                  <p>Trusted by 500+ engineering teams</p>
                </div>
              </div>

              <div className="mt-16 lg:mt-0 lg:col-span-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-primary to-blue-600 rounded-xl blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
                  <div className="relative bg-slate-900 rounded-xl border border-slate-800 shadow-2xl overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800 bg-slate-900/50">
                      <div className="flex space-x-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">gitsolve — bash</div>
                    </div>
                    <div className="p-6 font-mono text-sm space-y-3">
                      <div className="text-green-400">$ gitsolve resolve #442</div>
                      <div className="text-slate-300">Analyzing: "Fix memory leak in websocket handler"</div>
                      <div className="text-slate-500 italic">// Searching repository for relevant context...</div>
                      <div className="text-blue-400">Found 3 relevant files:</div>
                      <div className="pl-4 text-slate-400">- src/net/ws_handler.ts</div>
                      <div className="pl-4 text-slate-400">- src/utils/cleanup.ts</div>
                      <div className="text-yellow-400">Generating fix strategy...</div>
                      <div className="text-green-400">Fix applied. Running tests...</div>
                      <div className="text-slate-300">All tests passed. Creating PR...</div>
                      <div className="text-primary font-bold">✓ Success! PR #443 created.</div>
                    </div>
                    <div className="p-4 bg-slate-900/80 border-t border-slate-800">
                      <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-primary w-[85%] rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <section id="features" className="py-24 bg-slate-900/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-primary font-bold tracking-widest uppercase text-sm mb-4">Powerful Features</h2>
              <h3 className="text-3xl font-black sm:text-4xl text-white">Streamline your workflow</h3>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { icon: 'psychology', title: 'AI Issue Analysis', desc: 'Deeply understands complex issue descriptions, bug reports, and stack traces using state-of-the-art LLMs trained on millions of open source contributions.' },
                { icon: 'hub', title: 'Repository Intelligence', desc: 'Indexes your entire codebase to find relevant files, functions, and cross-file dependencies for any reported bug. No context is too large.' },
                { icon: 'rebase', title: 'Automated Fix Generation', desc: 'Generates high-quality, production-ready code fixes that respect your style guide and submits them as ready-to-merge PRs.' },
              ].map((feature, i) => (
                <div key={i} className="bg-slate-800 p-8 rounded-xl border border-slate-700 hover:border-primary/50 transition-all group">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-6 group-hover:bg-primary transition-colors">
                    <span className="material-symbols-outlined text-primary group-hover:text-white transition-colors">{feature.icon}</span>
                  </div>
                  <h4 className="text-xl font-bold mb-3">{feature.title}</h4>
                  <p className="text-slate-400 leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="demo" className="py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row items-center gap-16">
              <div className="lg:w-1/2">
                <h2 className="text-3xl font-black mb-6 leading-tight">Watch the AI resolve a real issue in seconds.</h2>
                <ul className="space-y-4">
                  {[
                    { title: 'Automated context gathering', desc: 'No need to provide file paths, the AI finds them.' },
                    { title: 'Real-time collaboration', desc: 'Leave feedback on PRs and the AI will refine the fix.' },
                    { title: 'Test-driven fixes', desc: 'AI writes new tests to ensure the bug never returns.' },
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-green-500 mt-1">check_circle</span>
                      <div>
                        <p className="font-bold">{item.title}</p>
                        <p className="text-slate-500 text-sm">{item.desc}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="lg:w-1/2 w-full">
                <div className="relative rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-900 group">
                  <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent pointer-events-none"></div>
                  <div className="aspect-video bg-slate-800 flex items-center justify-center">
                    <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition-transform cursor-pointer">
                      <span className="material-symbols-outlined text-white text-3xl">play_arrow</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-primary rounded-2xl p-8 md:p-16 text-center text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-black/10 rounded-full blur-3xl"></div>
              <h2 className="text-3xl md:text-5xl font-black mb-6 relative z-10">Ready to clear your backlog?</h2>
              <p className="text-lg mb-10 opacity-90 relative z-10">Start resolving issues today. Free for public repositories.</p>
              <div className="flex justify-center relative z-10">
                <Link to="/login" className="bg-white text-primary hover:bg-slate-100 px-8 py-4 rounded-lg font-bold text-lg transition-all shadow-xl">
                  Install on GitHub
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-12">
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <span className="material-symbols-outlined text-primary text-3xl">terminal</span>
                <span className="text-lg font-bold tracking-tight">GitSolve</span>
              </div>
              <p className="text-slate-400 max-w-xs text-sm">
                Building the future of autonomous software engineering. Focus on what matters, automate the rest.
              </p>
            </div>
            {[
              { title: 'Product', links: ['Features', 'Integrations', 'Enterprise', 'Pricing'] },
              { title: 'Resources', links: ['Documentation', 'API Reference', 'Blog', 'Support'] },
              { title: 'Company', links: ['About Us', 'Careers', 'Privacy', 'Terms'] },
            ].map((col) => (
              <div key={col.title}>
                <h5 className="font-bold mb-4">{col.title}</h5>
                <ul className="space-y-2 text-sm text-slate-400">
                  {col.links.map((link) => (
                    <li key={link}><a className="hover:text-primary" href="#">{link}</a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-slate-500">© 2025 GitSolve – Agentic GitHub Issue Resolver. All rights reserved.</p>
            <div className="flex gap-6">
              <a className="text-slate-400 hover:text-primary transition-colors" href="#">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"></path></svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
