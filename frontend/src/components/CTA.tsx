import { motion } from 'framer-motion'

type CTAProps = {
  onGetStarted: () => void
  onTalkToSales?: () => void
}

export default function CTA({ onGetStarted, onTalkToSales }: CTAProps) {
  return (
    <section id="pricing" className="mx-auto mb-40 max-w-5xl px-6">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-10% 0px' }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="border-precision glow-hover relative overflow-hidden rounded-2xl bg-gradient-to-b from-white/[0.04] to-black p-10 text-center md:p-20"
      >
        <div className="relative z-10">
          <h2 className="mb-6 text-4xl font-bold leading-[0.9] tracking-tight text-shimmer md:text-[64px]">
            Clear your backlog.
          </h2>
          <p className="mx-auto mb-10 max-w-md text-[18px] font-light text-slate-500">
            Ship features instead of fixing bugs. Join 2,000+ teams automating their maintenance cycle.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <button
              type="button"
              onClick={onGetStarted}
              className="rounded-[6px] bg-white px-10 py-3 text-[13px] font-bold text-black transition-all hover:bg-slate-200"
            >
              Get Started Free
            </button>
            <button
              type="button"
              onClick={onTalkToSales}
              className="rounded-[6px] border border-white/10 bg-white/[0.02] px-10 py-3 text-[13px] font-semibold text-slate-300 transition-all hover:bg-white/[0.05] hover:text-white"
            >
              Talk to Sales
            </button>
          </div>
        </div>

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_100%,rgba(36,138,235,0.12),transparent_70%)]" />
      </motion.div>
    </section>
  )
}

