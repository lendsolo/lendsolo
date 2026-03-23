import { Link } from '@inertiajs/react'

export default function Hero() {
  return (
    <section className="relative overflow-hidden pt-24 sm:pt-28 pb-20 sm:pb-24" style={{ backgroundColor: '#f8f7f4' }}>
      {/* Subtle green radial gradient */}
      <div
        className="absolute top-[-40%] left-1/2 -translate-x-1/2 w-[800px] h-[800px] pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(26,122,76,0.06) 0%, transparent 70%)' }}
      />

      <div className="relative max-w-[1140px] mx-auto px-8 text-center">
        {/* Eyebrow */}
        <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[2px] text-[#1a7a4c] font-medium mb-5">
          <span className="w-2 h-2 rounded-full bg-[#22c55e] shadow-[0_0_8px_rgba(34,197,94,0.5)] animate-pulse" />
          Built by a lender, for lenders
        </div>

        <h1 className="font-display text-4xl sm:text-5xl lg:text-[56px] leading-[1.1] text-[#0f1a2e] max-w-[700px] mx-auto tracking-tight">
          Stop managing your loans in{' '}
          <em className="italic text-[#1a7a4c]">spreadsheets</em>
        </h1>

        <p className="mt-6 text-lg leading-relaxed text-[#5a6578] max-w-[540px] mx-auto">
          Never miss a payment, miscalculate interest, or scramble at tax season again. LendSolo replaces every spreadsheet, calculator site, and mental note — in one place.
        </p>

        <div className="mt-10 flex gap-3 justify-center flex-wrap">
          <Link
            href="/tools/amortization"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#0f1a2e] text-white rounded-[10px] text-[15px] font-semibold hover:-translate-y-0.5 hover:shadow-lg transition-all"
          >
            Try the free calculators
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10m0 0L9 4m4 4L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-transparent text-[#0f1a2e] rounded-[10px] text-[15px] font-semibold border-[1.5px] border-[#e2e0d8] hover:border-[#5a6578] hover:bg-white transition-all"
          >
            Start your 14-day free trial
          </Link>
        </div>

        {/* Proof bar */}
        <div className="mt-10 flex items-center justify-center gap-6 flex-wrap text-[13px] text-[#8c95a6]">
          {['Free calculators — no signup', 'Import your spreadsheet', 'No credit card required'].map((text) => (
            <span key={text} className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-[#1a7a4c]" viewBox="0 0 16 16" fill="none">
                <path d="M13.3 4.3L6 11.6 2.7 8.3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {text}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
