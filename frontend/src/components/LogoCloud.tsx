import { motion } from 'framer-motion'

const logos = [
  { name: 'Vercel', mark: <div className="h-4 w-4 bg-white" /> },
  { name: 'Stripe', mark: <div className="h-4 w-4 rounded-full bg-white" /> },
  { name: 'GitHub', mark: <span className="material-symbols-outlined text-[20px] text-white">terminal</span> },
  { name: 'Ramp', mark: <div className="h-4 w-4 rotate-45 border-2 border-white" /> },
  { name: 'Linear', mark: <div className="h-4 w-4 rounded-sm bg-white/50" /> },
] as const

export default function LogoCloud() {
  return (
    <section className="mx-auto max-w-5xl px-6 py-24">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-10% 0px' }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="text-center"
      >
        <span className="mono-label uppercase text-slate-600">Trusted by engineering teams at</span>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-10% 0px' }}
        transition={{ duration: 0.55, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
        className="mt-12 flex flex-wrap items-center justify-center gap-x-16 gap-y-10 opacity-30 grayscale transition-all duration-700 hover:opacity-100 hover:grayscale-0"
      >
        {logos.map((l) => (
          <div key={l.name} className="flex items-center gap-2">
            {l.mark}
            <span className="mono-label text-[11px] font-bold tracking-[0.2em] text-white">{l.name}</span>
          </div>
        ))}
      </motion.div>
    </section>
  )
}

