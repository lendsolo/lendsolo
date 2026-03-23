import { Link } from '@inertiajs/react'

export default function FinalCta() {
  return (
    <section className="py-20 sm:py-28" style={{ backgroundColor: '#f8f7f4' }}>
      <div className="max-w-[1140px] mx-auto px-8 text-center">
        <p className="text-[11px] font-mono uppercase tracking-[2px] text-[#1a7a4c] font-medium mb-3">
          Ready?
        </p>
        <h2 className="font-display text-3xl sm:text-[40px] leading-[1.15] text-[#0f1a2e] tracking-tight max-w-[600px] mx-auto mb-4">
          Start with the free tools.<br />No account needed.
        </h2>
        <p className="text-[17px] leading-relaxed text-[#5a6578] max-w-[600px] mx-auto mb-9">
          The loan amortization calculator, ROI tool, and loan comparison calculator are free — no signup, no credit card, no commitment. Use them for your next deal.
        </p>

        <div className="flex gap-3 justify-center flex-wrap">
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
            Or start a 14-day free trial
          </Link>
        </div>

        <p className="mt-5 text-[13px] text-[#8c95a6]">
          Solo plan is $29/month after trial. Cancel anytime. Your data is always exportable.
        </p>
      </div>
    </section>
  )
}
