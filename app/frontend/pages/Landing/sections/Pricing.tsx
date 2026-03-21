import { Link } from '@inertiajs/react'

const TIERS = [
  {
    name: 'Solo',
    price: 19,
    description: 'For lenders just getting started',
    features: [
      'Up to 5 active loans',
      'Full amortization engine',
      'Deal calculators + ROI tools',
      'Payment tracking + guardrails',
      'Dashboard & basic reports',
      'Spreadsheet import',
      'CSV exports',
    ],
    highlighted: false,
  },
  {
    name: 'Pro',
    price: 39,
    description: 'For active lenders running a real portfolio',
    badge: 'Best Value',
    features: [
      'Up to 25 active loans',
      'Everything in Solo',
      'Branded PDF statements',
      'Automated email reminders',
      '1098 tax reporting',
      'Borrower portal',
      'QuickBooks integration',
    ],
    highlighted: true,
  },
  {
    name: 'Fund',
    price: 99,
    description: 'For lenders managing outside capital',
    features: [
      'Unlimited loans',
      'Everything in Pro',
      'Multi-investor tracking',
      'Investor portal & reports',
      'Advanced analytics & IRR',
      'Audit trail & compliance',
      'API access + priority support',
    ],
    highlighted: false,
  },
]

export default function Pricing() {
  return (
    <section id="pricing" className="py-20 sm:py-28" style={{ backgroundColor: '#F6F5F0' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center max-w-2xl mx-auto">
          <p className="text-sm font-semibold uppercase tracking-widest text-[#1A7A50] font-body">
            Simple pricing. No surprises.
          </p>
          <h2 className="mt-4 text-3xl sm:text-4xl font-bold text-[#1C1C19] font-display">
            Start with the free calculators. Pay when you're tracking real loans.
          </h2>
        </div>

        {/* Cards - On mobile, Pro shows first */}
        <div className="mt-12 sm:mt-16 grid sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
          {/* Mobile reorder: Pro first */}
          {[TIERS[1], TIERS[0], TIERS[2]].map((tier) => (
            <div
              key={tier.name}
              className={`rounded-2xl p-6 sm:p-8 flex flex-col ${
                tier.highlighted
                  ? 'bg-white border-2 border-[#34D399] shadow-lg order-first lg:order-none relative'
                  : 'bg-white border border-[#E4E3DB]'
              }`}
            >
              {tier.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="px-3 py-1 bg-[#34D399] text-[#081C12] text-xs font-bold rounded-full">
                    {tier.badge}
                  </span>
                </div>
              )}

              <div>
                <h3 className="text-lg font-bold text-[#1C1C19] font-display">{tier.name}</h3>
                <p className="mt-1 text-sm text-[#8A8A7E] font-body">{tier.description}</p>
              </div>

              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-4xl font-bold text-[#1A7A50] font-mono">${tier.price}</span>
                <span className="text-sm text-[#8A8A7E] font-body">/mo</span>
              </div>

              <ul className="mt-6 space-y-3 flex-1">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-[#4D4D45] font-body">
                    <svg className="w-4 h-4 text-[#34D399] shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                href="/users/sign_up"
                className={`mt-8 block text-center py-3 rounded-xl text-sm font-semibold transition-colors ${
                  tier.highlighted
                    ? 'bg-[#34D399] text-[#081C12] hover:bg-[#2fc48d] shadow-[0_0_20px_rgba(52,211,153,0.2)]'
                    : 'bg-[#1C1C19] text-white hover:bg-[#2a2a26]'
                }`}
              >
                Start free trial
              </Link>
            </div>
          ))}
        </div>

        {/* Free tier callout */}
        <div className="mt-10 text-center space-y-2">
          <p className="text-sm text-[#4D4D45] font-body">
            The deal calculator, ROI tool, and loan comparison tool are{' '}
            <span className="font-semibold text-[#1A7A50]">free forever</span> — no account required.
            Start there. You'll know when you're ready for the rest.
          </p>
          <p className="text-xs text-[#8A8A7E] font-body">
            All paid plans include a 14-day free trial. No credit card required to start.
          </p>
        </div>
      </div>
    </section>
  )
}
