import { Link } from '@inertiajs/react'

const CHECKLIST = [
  'Spreadsheet import — bring your existing loans in minutes',
  'Automated payment reminders & late notices',
  'Year-end tax exports ready for your accountant',
  'Free plan — manage up to 2 loans, no credit card',
]

const STATS = [
  { value: '$29', label: 'Solo / mo' },
  { value: '5', label: 'Loans on Solo' },
  { value: '14', label: 'Day trial' },
]

export default function NowLive() {
  return (
    <section
      className="relative overflow-hidden py-20 sm:py-24"
      style={{ background: 'linear-gradient(160deg, #0f1a2e 0%, #152238 60%, #1a3a2e 100%)' }}
    >
      {/* Background glow */}
      <div
        className="absolute top-[-50%] right-[-20%] w-[600px] h-[600px] pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(34,197,94,0.08) 0%, transparent 70%)' }}
      />

      <div className="relative max-w-[1140px] mx-auto px-8 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Left: Content */}
        <div>
          <p className="text-[11px] font-mono uppercase tracking-[2px] text-[#22c55e] font-medium mb-3">
            Now Live
          </p>
          <h2 className="font-display text-3xl sm:text-[40px] leading-[1.15] text-white tracking-tight mb-5">
            Real lenders. Real loans.<br />Real money managed.
          </h2>
          <p className="text-base leading-relaxed text-white/60 mb-8">
            LendSolo launched with private lenders managing real portfolios — fix-and-flip bridge loans, long-term holds, and everything in between. The product was built by a lender and shaped by lender feedback at every step.
          </p>

          <ul className="mb-9 space-y-0">
            {CHECKLIST.map((item) => (
              <li
                key={item}
                className="flex items-center gap-3 text-[15px] text-white/80 py-2.5 border-b border-white/[0.06] last:border-0"
              >
                <div className="w-[22px] h-[22px] min-w-[22px] rounded-md bg-[rgba(34,197,94,0.15)] flex items-center justify-center">
                  <svg className="w-3.5 h-3.5 text-[#22c55e]" viewBox="0 0 16 16" fill="none">
                    <path d="M13.3 4.3L6 11.6 2.7 8.3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                {item}
              </li>
            ))}
          </ul>

          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#22c55e] text-[#0f1a2e] rounded-[10px] text-[15px] font-semibold hover:-translate-y-0.5 hover:shadow-lg transition-all"
          >
            Get Started Free
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10m0 0L9 4m4 4L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>

        {/* Right: Stats + callout */}
        <div>
          <div className="grid grid-cols-3 gap-4">
            {STATS.map((stat) => (
              <div
                key={stat.label}
                className="bg-white/[0.04] border border-white/[0.08] rounded-xl py-6 px-5 text-center"
              >
                <span className="font-display text-[32px] text-white block mb-1">{stat.value}</span>
                <span className="font-mono text-[11px] uppercase tracking-wide text-white/40">{stat.label}</span>
              </div>
            ))}
          </div>
          <div className="mt-5 bg-white/[0.04] border border-white/[0.08] rounded-xl p-6">
            <p className="text-[13px] text-white/60 leading-relaxed">
              <span className="font-semibold text-white/80">Built independently</span> and focused on one thing: helping solo lenders manage loans without mistakes. No enterprise bloat. No unnecessary complexity.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
