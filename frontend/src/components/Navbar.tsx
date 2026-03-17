import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

type NavbarProps = {
  onLoginClick?: () => void
  onSignupClick?: () => void
}

export default function Navbar({ onLoginClick, onSignupClick }: NavbarProps) {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-0 z-50 w-full border-b border-white/[0.06] bg-black/60 backdrop-blur-xl"
    >
      <div className="mx-auto flex h-14 max-w-[1400px] items-center justify-between px-6 md:px-8">
        <div className="flex items-center gap-10">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-5 w-5 items-center justify-center rounded-[3px] bg-white">
              <span className="material-symbols-outlined text-[14px] font-black text-black">terminal</span>
            </div>
            <span className="mono-label text-white">GitSolve</span>
          </Link>

          <div className="hidden items-center gap-8 text-[12px] font-medium tracking-tight md:flex">
            <a className="text-slate-400 transition-colors hover:text-white" href="#features">
              Features
            </a>
            <a className="text-slate-400 transition-colors hover:text-white" href="#method">
              Methodology
            </a>
            <a className="text-slate-400 transition-colors hover:text-white" href="#pricing">
              Pricing
            </a>
            <a className="text-slate-400 transition-colors hover:text-white" href="#docs">
              Docs
            </a>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <button
            type="button"
            className="text-[12px] font-medium text-slate-400 transition-colors hover:text-white"
            onClick={onLoginClick}
          >
            Log in
          </button>
          <button
            type="button"
            className="rounded-[4px] bg-white px-4 py-1.5 text-[12px] font-semibold text-black transition-all hover:bg-slate-200"
            onClick={onSignupClick}
          >
            Sign up
          </button>
        </div>
      </div>
    </motion.nav>
  )
}

