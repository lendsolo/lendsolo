const FEATURES = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <line x1="3" y1="9" x2="21" y2="9" />
        <line x1="9" y1="21" x2="9" y2="9" />
      </svg>
    ),
    title: "Always know exactly what you're owed",
    description:
      'Precise amortization schedules for standard, interest-only, and balloon loans. Every payment auto-splits into principal and interest — down to the penny.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    title: 'Catch problems before they cost you',
    description:
      "LTV creeping above 80%? One borrower at 60% of your capital? No collateral documented? LendSolo flags it while you're setting up the deal — not after.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
      </svg>
    ),
    title: 'Never miss a payment again',
    description:
      'Record payments in two clicks. Automated email reminders to borrowers before due dates, late notices when they miss, and receipts when they pay.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    ),
    title: 'Run the numbers before you wire the money',
    description:
      'ROI projections, loan comparisons, and interest-only calculators. Free, no account required — evaluate your next deal right now.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
    title: 'Tax season in 30 seconds, not 3 hours',
    description:
      'Year-end interest income summary, expense reports for Schedule C, and accountant-ready exports in PDF, CSV, and QBO. Hit download, send to your CPA, done.',
    badge: 'Pro plan',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
      </svg>
    ),
    title: 'A second opinion on every deal',
    description:
      'AI-generated deal memos and risk narratives that analyze your loan structure, flag concerns, and assess portfolio impact — before you commit.',
    badge: 'Pro plan',
  },
]

export default function FeaturesGrid() {
  return (
    <section id="features" className="py-20 sm:py-24" style={{ backgroundColor: '#f8f7f4' }}>
      <div className="max-w-[1140px] mx-auto px-8">
        <p className="text-[11px] font-mono uppercase tracking-[2px] text-[#1a7a4c] font-medium mb-3">
          What changes
        </p>
        <h2 className="font-display text-3xl sm:text-[40px] leading-[1.15] text-[#0f1a2e] tracking-tight mb-4">
          Everything a private lender actually needs
        </h2>
        <p className="text-[17px] leading-relaxed text-[#5a6578] max-w-[600px] mb-12">
          No bloat. No features built for banks. Just the six things that make the difference between running your lending business and just surviving it.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="bg-white border border-[#e2e0d8] rounded-xl p-8 flex gap-4 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200"
            >
              <div className="w-11 h-11 min-w-[44px] rounded-[10px] bg-[#e8f5ee] text-[#1a7a4c] flex items-center justify-center">
                {f.icon}
              </div>
              <div>
                <h3 className="text-base font-semibold text-[#0f1a2e] mb-1.5">{f.title}</h3>
                <p className="text-sm leading-relaxed text-[#5a6578]">{f.description}</p>
                {f.badge && (
                  <span className="inline-block mt-2 font-mono text-[10px] tracking-wide px-2 py-0.5 rounded bg-[#e8f0fc] text-[#1e5fa6]">
                    {f.badge}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
