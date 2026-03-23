const CARDS = [
  {
    emoji: '📊',
    bgColor: '#e8f5ee',
    title: 'Google Sheets',
    description:
      "Works until it doesn't. Formulas break. Amortization schedules are manual. You're copy-pasting between tabs hoping nothing slips.",
    breakPoint: 'Breaks at tax season',
  },
  {
    emoji: '📘',
    bgColor: '#e8f0fc',
    title: 'QuickBooks Hacks',
    description:
      "You shoved loans into an accounting tool. It tracks income fine but doesn't know what an amortization schedule is, what LTV means, or when a payment is actually late.",
    breakPoint: 'Breaks past 3 loans',
  },
  {
    emoji: '🧠',
    bgColor: '#fef3c7',
    title: 'Mental Accounting',
    description:
      '"I know where everything is." You probably do — until you add a loan, take on an investor, or your accountant asks for a year-end summary.',
    breakPoint: 'Breaks when life gets busy',
  },
  {
    emoji: '🧩',
    bgColor: '#fee2e2',
    title: 'Cobbled Together',
    description:
      "A spreadsheet for tracking, a calculator site for amortization, email for reminders, a folder of PDFs. Five tools doing one tool's job.",
    breakPoint: 'Breaks at every seam',
  },
]

export default function Problem() {
  return (
    <section className="py-20 sm:py-24" style={{ backgroundColor: '#f8f7f4' }}>
      <div className="max-w-[1140px] mx-auto px-8">
        <p className="text-[11px] font-mono uppercase tracking-[2px] text-[#1a7a4c] font-medium mb-3">
          The Problem
        </p>
        <h2 className="font-display text-3xl sm:text-[40px] leading-[1.15] text-[#0f1a2e] tracking-tight mb-4">
          Four ways lenders manage today.<br />All four break.
        </h2>
        <p className="text-[17px] leading-relaxed text-[#5a6578] max-w-[600px] mb-12">
          You're managing real money across real deals. The tools you're using weren't built for this.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {CARDS.map((card) => (
            <div
              key={card.title}
              className="bg-white border border-[#e2e0d8] rounded-xl p-7 hover:-translate-y-1 hover:shadow-md transition-all duration-200"
            >
              <div
                className="w-10 h-10 rounded-[10px] flex items-center justify-center text-xl mb-4"
                style={{ background: card.bgColor }}
              >
                {card.emoji}
              </div>
              <h3 className="text-base font-semibold text-[#0f1a2e] mb-2">{card.title}</h3>
              <p className="text-sm leading-relaxed text-[#5a6578]">{card.description}</p>
              <div className="mt-3 pt-3 border-t border-[#e2e0d8] flex items-center gap-1.5 font-mono text-xs text-[#b91c1c]">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path d="M8 4v5m0 2.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                {card.breakPoint}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
