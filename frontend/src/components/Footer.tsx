export default function Footer() {
  return (
    <footer className="border-t border-white/[0.03] bg-black py-20">
      <div className="mx-auto max-w-[1200px] px-6 md:px-8">
        <div className="grid grid-cols-2 gap-12 md:grid-cols-5 md:gap-16">
          <div className="col-span-2">
            <div className="mb-8 flex items-center gap-2">
              <div className="flex h-5 w-5 items-center justify-center rounded-[3px] bg-white">
                <span className="material-symbols-outlined text-[14px] font-bold text-black">terminal</span>
              </div>
              <span className="mono-label text-white">GitSolve</span>
            </div>
            <p className="max-w-[260px] text-[12px] leading-relaxed text-slate-600">
              The autonomous engineering agent for high-performance software teams.
            </p>
          </div>

          <div>
            <h4 className="mono-label mb-6 text-[11px] text-white/40">Product</h4>
            <ul className="space-y-3 text-[12px] text-slate-500">
              <li>
                <a className="transition-colors hover:text-white" href="#features">
                  Features
                </a>
              </li>
              <li>
                <a className="transition-colors hover:text-white" href="#method">
                  Methodology
                </a>
              </li>
              <li>
                <a className="transition-colors hover:text-white" href="#pricing">
                  Pricing
                </a>
              </li>
            </ul>
          </div>

          <div id="docs">
            <h4 className="mono-label mb-6 text-[11px] text-white/40">Resources</h4>
            <ul className="space-y-3 text-[12px] text-slate-500">
              <li>
                <a className="transition-colors hover:text-white" href="#">
                  Documentation
                </a>
              </li>
              <li>
                <a className="transition-colors hover:text-white" href="#">
                  API Reference
                </a>
              </li>
              <li>
                <a className="transition-colors hover:text-white" href="#">
                  Changelog
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mono-label mb-6 text-[11px] text-white/40">Company</h4>
            <ul className="space-y-3 text-[12px] text-slate-500">
              <li>
                <a className="transition-colors hover:text-white" href="#">
                  About
                </a>
              </li>
              <li>
                <a className="transition-colors hover:text-white" href="#">
                  Blog
                </a>
              </li>
              <li>
                <a className="transition-colors hover:text-white" href="#">
                  Twitter
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 flex items-center justify-between border-t border-white/[0.03] pt-8">
          <p className="mono-label text-[10px] text-slate-700">© 2026 GitSolve Inc.</p>
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500/60" />
            <span className="mono-label text-[10px] tracking-widest text-slate-700">Systems Operational</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

