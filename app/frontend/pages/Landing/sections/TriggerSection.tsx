const TRIGGERS = [
  { text: 'You manage <strong>2–15 private loans</strong> and it\'s getting harder to keep track' },
  { text: 'You\'re using <strong>Excel, Google Sheets, or QuickBooks</strong> and know it\'s not built for this' },
  { text: 'You\'ve <strong>almost missed a payment</strong> or lost track of what a borrower owes' },
  { text: 'Tax season means <strong>hours of manual math</strong> to figure out your interest income' },
  { text: 'You don\'t need enterprise software — you need something that <strong>just works for a handful of loans</strong>' },
  { text: 'You\'re evaluating a new deal and want to <strong>run the numbers before wiring money</strong>' },
]

export default function TriggerSection() {
  return (
    <section className="py-20 sm:py-24 pb-0" style={{ backgroundColor: '#f8f7f4' }}>
      <div className="max-w-[1140px] mx-auto px-8">
        <p className="text-[11px] font-mono uppercase tracking-[2px] text-[#1a7a4c] font-medium mb-3">
          Is this you?
        </p>
        <h2 className="font-display text-3xl sm:text-[40px] leading-[1.15] text-[#0f1a2e] tracking-tight">
          LendSolo is for you right now if…
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-8">
          {TRIGGERS.map((trigger, i) => (
            <div
              key={i}
              className="bg-white border border-[#e2e0d8] rounded-xl px-6 py-5 flex items-start gap-3.5"
            >
              <span className="text-[#1a7a4c] text-lg mt-0.5 shrink-0">✓</span>
              <span
                className="text-[15px] text-[#2d3a4f] leading-relaxed"
                dangerouslySetInnerHTML={{ __html: trigger.text }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
