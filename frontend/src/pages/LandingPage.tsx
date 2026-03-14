import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { Logo } from '../components/Logo'

const TerminalTyping = () => {
  const lines = [
    { text: "$ gitsolve resolve #442", color: "text-green-400" },
    { text: "Analyzing issue...", color: "text-slate-300", delay: 1000 },
    { text: "Searching repository...", color: "text-slate-500", italic: true, delay: 1500 },
    { text: "Generating fix...", color: "text-amber-400", delay: 2500 },
    { text: "Creating pull request...", color: "text-slate-300", delay: 3500 },
    { text: "✓ Success! PR #443 created.", color: "text-primary font-bold", delay: 4500 }
  ];

  const [visibleLines, setVisibleLines] = useState<number>(1);

  useEffect(() => {
    let timeouts: NodeJS.Timeout[] = [];
    lines.slice(1).forEach((line) => {
      const timeout = setTimeout(() => {
        setVisibleLines(prev => prev + 1);
      }, line.delay);
      timeouts.push(timeout);
    });
    return () => timeouts.forEach(clearTimeout);
  }, []);

  return (
    <div className="font-mono text-sm space-y-3">
      {lines.slice(0, visibleLines).map((line, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className={`${line.color} ${line.italic ? 'italic' : ''}`}
        >
          {line.text}
        </motion.div>
      ))}
      <motion.div
        animate={{ opacity: [1, 0] }}
        transition={{ repeat: Infinity, duration: 0.8 }}
        className="text-primary inline-block w-2 h-4 bg-primary align-middle ml-1"
      />
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-slate-100 overflow-x-hidden font-sans selection:bg-primary/30">
      
      {/* Background radial effects */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-[20%] -left-[10%] w-[70vw] h-[70vw] rounded-full bg-blue-900/20 blur-[120px]"
        />
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          className="absolute top-[20%] -right-[20%] w-[60vw] h-[60vw] rounded-full bg-indigo-900/10 blur-[120px]"
        />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#0a0a0a]/60 backdrop-blur-xl transition-all">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <Logo className="text-primary w-8 h-8" />
              <span className="text-xl font-bold tracking-tight text-white">GitSolve</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              {['Features', 'Demo', 'Docs'].map(item => (
                <a key={item} href={`#${item.toLowerCase()}`} className="text-sm font-medium text-slate-300 hover:text-white relative group transition-colors">
                  {item}
                  <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-primary transition-all group-hover:w-full"></span>
                </a>
              ))}
            </div>
            <div className="flex items-center gap-4">
              <Link to="/login" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Sign In</Link>
              <Link to="/login" className="bg-white text-black hover:bg-slate-200 px-4 py-2 rounded-md font-semibold text-sm transition-all">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 pt-32 pb-20 lg:pt-48 lg:pb-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
            
            {/* Left side text */}
            <div className="w-full lg:w-1/2 flex flex-col items-center lg:items-start text-center lg:text-left">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold text-primary bg-primary/10 border border-primary/20 mb-8"
              >
                Now in Public Beta
              </motion.div>
              
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-5xl sm:text-7xl lg:text-[84px] font-black tracking-tight mb-8 leading-[1.05] text-white"
              >
                Agentic GitHub <br />
                <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-primary text-transparent bg-clip-text pr-2">
                  Issue Resolver
                </span>
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-lg md:text-xl text-slate-400 mb-10 leading-relaxed max-w-2xl font-light"
              >
                Autonomous AI that reads GitHub issues, fixes bugs, and creates pull requests. Stop manual debugging and let AI handle your backlog.
              </motion.p>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
              >
                <Link
                  to="/login"
                  className="group flex items-center justify-center gap-2 bg-primary text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-blue-600 transition-all hover:scale-[1.03] hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] duration-150"
                >
                  <span className="material-symbols-outlined">terminal</span>
                  Login with GitHub
                </Link>
                <a
                  href="#demo"
                  className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold text-lg text-slate-300 border border-white/10 hover:bg-white/5 hover:text-white transition-all duration-150"
                >
                  View Demo
                </a>
              </motion.div>
            </div>

            {/* Right side interactive terminal */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="w-full lg:w-1/2 relative"
            >
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                className="relative z-10"
              >
                {/* Glowing border effect */}
                <div className="absolute -inset-0.5 bg-gradient-to-tr from-primary/40 to-indigo-500/40 rounded-2xl blur-md opacity-50 transition duration-500 group-hover:opacity-100"></div>
                
                <div className="relative bg-[#0d1117] rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
                  <div className="flex items-center px-4 py-3 border-b border-white/5 bg-black/40">
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                      <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                    </div>
                    <div className="flex-1 text-center text-xs text-slate-500 font-mono">gitsolve — bash</div>
                  </div>
                  <div className="p-6 md:p-8 min-h-[300px]">
                    <TerminalTyping />
                  </div>
                </div>
              </motion.div>
            </motion.div>

          </div>
        </div>
      </main>

      {/* Features Grid */}
      <section id="features" className="py-32 relative z-10 border-t border-white/5 bg-black/20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-20"
          >
            <h2 className="text-primary font-bold tracking-widest uppercase text-sm mb-4">Powerful Features</h2>
            <h3 className="text-4xl md:text-5xl font-black text-white tracking-tight">Streamline your workflow</h3>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: 'psychology', title: 'AI Issue Analysis', desc: 'Deeply understands complex issue descriptions, bug reports, and stack traces using state-of-the-art LLMs trained on millions of open source contributions.' },
              { icon: 'hub', title: 'Repository Intelligence', desc: 'Indexes your entire codebase to find relevant files, functions, and cross-file dependencies for any reported bug. No context is too large.' },
              { icon: 'rebase', title: 'Automated Fix Generation', desc: 'Generates high-quality, production-ready code fixes that respect your style guide and submits them as ready-to-merge PRs.' },
            ].map((feature, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.15 }}
                className="bg-[#111111] p-8 rounded-2xl border border-white/5 hover:border-primary/50 hover:bg-[#161616] transition-all duration-300 group hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(59,130,246,0.1)] relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <span className="material-symbols-outlined text-slate-300 group-hover:text-primary transition-colors">{feature.icon}</span>
                </div>
                <h4 className="text-xl font-bold mb-3 text-white">{feature.title}</h4>
                <p className="text-slate-400 leading-relaxed font-light text-sm md:text-base">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section id="demo" className="py-32 relative z-10 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="w-full lg:w-1/2"
            >
              <h2 className="text-4xl md:text-5xl font-black mb-8 leading-tight text-white tracking-tight">Watch the AI resolve a real issue in seconds.</h2>
              <ul className="space-y-6">
                {[
                  { title: 'Automated context gathering', desc: 'No need to provide file paths, the AI finds them.' },
                  { title: 'Real-time collaboration', desc: 'Leave feedback on PRs and the AI will refine the fix.' },
                  { title: 'Test-driven fixes', desc: 'AI writes new tests to ensure the bug never returns.' },
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                      <span className="material-symbols-outlined text-primary text-sm">check</span>
                    </div>
                    <div>
                      <p className="font-bold text-white text-lg">{item.title}</p>
                      <p className="text-slate-400 mt-1 font-light">{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="w-full lg:w-1/2"
            >
              <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-[#0d1117] group aspect-video cursor-pointer">
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 group-hover:scale-110 group-hover:bg-white/20 transition-all duration-300 shadow-xl">
                    <span className="material-symbols-outlined text-white text-4xl ml-2">play_arrow</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 relative z-10">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative rounded-[2rem] p-10 md:p-20 text-center border-t border-l border-white/20 overflow-hidden shadow-2xl"
          >
            {/* Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-[#0a0a0a] to-indigo-600/20 z-0"></div>
            <div className="absolute inset-0 bg-[#0a0a0a] opacity-60 z-0"></div>
            
            {/* Animated Gradient Border using CSS mask equivalent via absolute wrapper */}
            <div className="absolute -inset-[100%] z-0 animate-[spin_10s_linear_infinite] opacity-30"
                 style={{
                   background: 'conic-gradient(from 0deg, transparent 0%, transparent 40%, rgba(59, 130, 246, 1) 50%, transparent 60%, transparent 100%)'
                 }}>
            </div>
            
            <div className="absolute inset-[1px] bg-[#0a0a0a] rounded-[2rem] z-0"></div>

            <div className="relative z-10 w-full h-full flex flex-col items-center">
               <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-6 text-white text-center">Ready to clear your backlog?</h2>
               <p className="text-xl text-slate-400 mb-10 font-light text-center">Start resolving issues today. Free for public repositories.</p>
               <Link to="/login" className="bg-white text-black hover:bg-slate-200 px-10 py-5 rounded-xl font-bold text-lg transition-all shadow-[0_0_40px_rgba(255,255,255,0.2)] hover:shadow-[0_0_60px_rgba(255,255,255,0.4)] hover:scale-[1.02] duration-200 inline-block font-display">
                 Install on GitHub
               </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 bg-[#050505] pt-20 pb-10 mt-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <Logo className="text-primary w-8 h-8" />
                <span className="text-lg font-bold tracking-tight text-white">GitSolve</span>
              </div>
              <p className="text-slate-500 max-w-sm text-sm leading-relaxed font-light">
                Building the future of autonomous software engineering. Focus on what matters, automate the rest.
              </p>
            </div>
            {[
              { title: 'Product', links: ['Features', 'Integrations', 'Enterprise', 'Pricing'] },
              { title: 'Resources', links: ['Documentation', 'API Reference', 'Blog', 'Support'] },
              { title: 'Company', links: ['About Us', 'Careers', 'Privacy', 'Terms'] },
            ].map((col) => (
              <div key={col.title}>
                <h5 className="font-semibold text-white mb-6 text-sm">{col.title}</h5>
                <ul className="space-y-4 text-sm text-slate-500">
                  {col.links.map((link) => (
                    <li key={link}><a className="hover:text-white transition-colors" href="#">{link}</a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-slate-600">© {new Date().getFullYear()} GitSolve. All rights reserved.</p>
            <div className="flex gap-6">
              <a className="text-slate-600 hover:text-white transition-colors" href="#">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"></path></svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
