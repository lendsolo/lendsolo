const TESTIMONIALS = [
  {
    initials: 'DK',
    name: 'D. Kim',
    role: '6 loans · $280K deployed',
    quote:
      'I spent 3 hours pulling together my interest income for my CPA last tax season. With LendSolo it took about 30 seconds. That alone is worth the subscription.',
  },
  {
    initials: 'MR',
    name: 'M. Reeves',
    role: '4 loans · $150K deployed',
    quote:
      "The guardrails caught something I missed — I was at 35% concentration on one borrower. I wouldn't have noticed in my spreadsheet until it was too late.",
  },
  {
    initials: 'TJ',
    name: 'T. Jackson',
    role: '8 loans · $420K deployed',
    quote:
      "Finally something that knows what an interest-only bridge loan is without me having to hack it into an accounting tool. This is exactly the gap that existed.",
  },
]

export default function SocialProof() {
  return (
    <section className="py-20 sm:py-24" style={{ backgroundColor: '#f8f7f4' }}>
      <div className="max-w-[1140px] mx-auto px-8">
        <p className="text-[11px] font-mono uppercase tracking-[2px] text-[#1a7a4c] font-medium mb-3">
          What Lenders Say
        </p>
        <h2 className="font-display text-3xl sm:text-[40px] leading-[1.15] text-[#0f1a2e] tracking-tight mb-4">
          Built by a lender. Tested by lenders.
        </h2>
        <p className="text-[17px] leading-relaxed text-[#5a6578] max-w-[600px] mb-12">
          Real feedback from private lenders who moved off spreadsheets.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.name}
              className="bg-white border border-[#e2e0d8] rounded-xl p-7"
            >
              <p className="text-[15px] leading-relaxed text-[#2d3a4f] italic mb-5">
                "{t.quote}"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-[10px] bg-[#e8f5ee] flex items-center justify-center text-sm font-bold text-[#1a7a4c]">
                  {t.initials}
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#0f1a2e]">{t.name}</p>
                  <p className="text-xs text-[#8c95a6]">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
