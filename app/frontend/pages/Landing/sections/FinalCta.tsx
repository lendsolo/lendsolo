import { Link } from '@inertiajs/react'

export default function FinalCta() {
  return (
    <section className="relative overflow-hidden" style={{ background: 'linear-gradient(180deg, #0E4D30 0%, #081C12 100%)' }}>
      {/* Noise texture */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\' opacity=\'1\'/%3E%3C/svg%3E")' }} />

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 text-center">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white font-display leading-tight">
          Start with the free tools.{' '}
          <span className="text-white/50">No account needed.</span>
        </h2>

        <p className="mt-6 text-lg text-white/60 font-body max-w-xl mx-auto leading-relaxed">
          The loan amortization calculator, ROI tool, and loan comparison calculator are free — no signup,
          no credit card, no commitment. Use them for your next deal. If LendSolo earns a place in your
          workflow, you'll know.
        </p>

        <div className="mt-10">
          <Link
            href="/tools/loan-amortization-calculator"
            className="inline-flex items-center gap-2 px-10 py-4 text-lg font-semibold text-[#081C12] bg-[#34D399] hover:bg-[#2fc48d] rounded-xl transition-all shadow-[0_0_40px_rgba(52,211,153,0.3)] hover:shadow-[0_0_50px_rgba(52,211,153,0.4)]"
          >
            Try the free calculators
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>

        <p className="mt-6 text-sm text-white/40 font-body">
          Or start a 14-day free trial with a full account. No credit card required.
        </p>

        <p className="mt-3 text-xs text-white/25 font-body">
          Solo plan is $19/month after trial. Cancel anytime. Your data is always exportable.
        </p>
      </div>
    </section>
  )
}
