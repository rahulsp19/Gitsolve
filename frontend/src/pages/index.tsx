import { useMemo, useState } from 'react'
import AuthModal from '../components/AuthModal'
import CTA from '../components/CTA'
import Features from '../components/Features'
import Footer from '../components/Footer'
import Hero from '../components/Hero'
import LogoCloud from '../components/LogoCloud'
import Navbar from '../components/Navbar'
import TerminalDemo from '../components/TerminalDemo'

type ModalState = { open: boolean; mode: 'signup' | 'waitlist' }

export default function IndexPage() {
  const [modal, setModal] = useState<ModalState>({ open: false, mode: 'signup' })

  const modalMode = useMemo(() => modal.mode, [modal.mode])

  return (
    <div className="min-h-screen bg-black text-slate-400 antialiased selection:bg-primary/30">
      <Navbar
        onLoginClick={() => setModal({ open: true, mode: 'signup' })}
        onSignupClick={() => setModal({ open: true, mode: 'signup' })}
      />

      <main className="relative overflow-hidden pt-20">
        <div className="linear-grid pointer-events-none absolute inset-0 opacity-20" />
        <div className="mesh-bg pointer-events-none absolute left-0 top-0 h-[1000px] w-full" />

        <Hero
          onStartBuilding={() => setModal({ open: true, mode: 'signup' })}
          onRequestAccess={() => setModal({ open: true, mode: 'waitlist' })}
        />

        <section className="relative mx-auto max-w-5xl px-6 pb-10">
          <TerminalDemo />
        </section>

        <LogoCloud />
        <Features />
        <CTA onGetStarted={() => setModal({ open: true, mode: 'signup' })} />
      </main>

      <Footer />

      <AuthModal open={modal.open} mode={modalMode} onOpenChange={(open) => setModal((m) => ({ ...m, open }))} />
    </div>
  )
}

