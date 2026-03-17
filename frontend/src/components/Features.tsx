import { motion } from 'framer-motion'

const bento = [
  {
    size: 'large',
    icon: 'psychology',
    title: 'Semantic Reasoning Engine',
    description:
      "Deep semantic analysis across your dependency graph. GitSolve doesn't just find bugs — it understands architectural intent and failure modes.",
  },
  {
    size: 'small',
    icon: 'account_tree',
    title: 'Global Intelligence',
    description: 'Awareness across multi-repo environments with context windows that scale without manual indexing.',
  },
  {
    size: 'small',
    icon: 'security',
    title: 'Guardrailed Fixes',
    description: 'Minimal diffs, deterministic formatting, and staged reasoning you can audit before merge.',
  },
] as const

const specs = [
  { icon: 'deployed_code', title: 'Vector Context Engine', desc: 'Embedding space to map code relationships across large graphs.' },
  { icon: 'security', title: 'Zero-Trust Execution', desc: 'Isolated runs designed for safe, reviewable changes.' },
  { icon: 'database', title: 'Immutable Knowledge', desc: 'Snapshotted states for reproducible reasoning and audit trails.' },
  { icon: 'bolt', title: 'Low-latency Inference', desc: 'Optimized pipelines for fast, context-aware patches.' },
] as const

export default function Features() {
  return (
    <>
      <section id="features" className="mx-auto max-w-[1200px] px-6 py-28 md:px-8 md:py-32">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-10% 0px' }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mb-16 max-w-xl"
        >
          <h2 className="mb-4 text-3xl font-semibold tracking-tight text-white">Built for the high-fidelity engineer.</h2>
          <p className="text-[16px] leading-relaxed text-slate-500">
            Everything you need to automate your engineering lifecycle with precision reasoning.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {bento.map((card, i) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-10% 0px' }}
              transition={{ duration: 0.45, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
              className={`${card.size === 'large' ? 'md:col-span-2' : ''} border-precision glow-hover group overflow-hidden rounded-xl p-10 glass-card transition-all`}
            >
              <div className="relative z-10">
                <div className="mb-12 flex h-12 w-12 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.02] transition-colors group-hover:border-primary/50">
                  <span className="material-symbols-outlined text-[24px] text-white/50 transition-colors group-hover:text-primary">
                    {card.icon}
                  </span>
                </div>
                <div className="max-w-md">
                  <h3 className="mb-4 text-[18px] font-medium text-white">{card.title}</h3>
                  <p className="text-[14px] leading-relaxed text-slate-500">{card.description}</p>
                </div>
              </div>
              {card.size === 'large' ? (
                <div className="pointer-events-none absolute bottom-0 right-0 h-full w-1/2 -translate-x-[-25%] translate-y-1/4 -rotate-12 bg-gradient-to-tl from-primary/5 to-transparent" />
              ) : null}
            </motion.div>
          ))}
        </div>
      </section>

      <section id="method" className="mx-auto max-w-[1200px] border-t border-white/[0.03] px-6 py-28 md:px-8 md:py-32">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-10% 0px' }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mb-20 text-center"
        >
          <span className="mono-label mb-4 block text-primary">Technical Specifications</span>
          <h2 className="text-3xl font-semibold tracking-tight text-white">Enterprise-grade performance.</h2>
        </motion.div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {specs.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-10% 0px' }}
              transition={{ duration: 0.45, delay: i * 0.04, ease: [0.16, 1, 0.3, 1] }}
              className="group space-y-4"
            >
              <span className="material-symbols-outlined text-[20px] text-primary/60 transition-colors group-hover:text-primary">
                {s.icon}
              </span>
              <h4 className="text-[14px] font-semibold text-white">{s.title}</h4>
              <p className="text-[12px] leading-relaxed text-slate-500">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </>
  )
}

