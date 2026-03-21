const CARDS = [
  {
    emoji: '📊',
    title: 'The Spreadsheet Lender',
    description:
      "Works fine at loan #1. By loan #3 you're copy-pasting amortization formulas and hoping nothing breaks. By tax season you're manually adding up interest columns and hoping your accountant doesn't ask too many questions.",
    breaksWhen:
      'You miss a payment date, or your accountant asks how much interest you earned last year.',
  },
  {
    emoji: '📒',
    title: 'The QuickBooks Lender',
    description:
      'You set up loans as "invoices" and payments as "income." It sort of tracks cash flow. But it can\'t split principal from interest, can\'t generate an amortization schedule, and definitely can\'t produce a borrower statement that looks like it came from an actual lender.',
    breaksWhen:
      'A borrower asks for a payment history or you need to prove income to anyone.',
  },
  {
    emoji: '🧠',
    title: 'The Mental Accountant',
    description:
      '"Bob owes me $20K, pays $500 a month, been doing it for about a year." No records, no paper trail, no amortization. More common than anyone admits, especially for loans to family or close friends.',
    breaksWhen:
      "Bob misses a payment and suddenly there's a dispute about the balance.",
  },
  {
    emoji: '🔧',
    title: 'The Cobbled Lender',
    description:
      'A loan calculator website, a notes app, a shared Google Doc with the borrower, and bank statements as your source of truth. Each piece technically works. The system doesn\'t.',
    breaksWhen:
      'You bring in an outside investor or try to scale past 5 loans.',
  },
]

export default function Problem() {
  return (
    <section id="problem" className="py-20 sm:py-28" style={{ backgroundColor: '#1C1C19' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-[#34D399] font-body">
            Why spreadsheets fail micro-lenders
          </p>
          <h2 className="mt-4 text-3xl sm:text-4xl font-bold text-white font-display leading-tight">
            Most private lenders managing under 15 loans aren't using loan software.
          </h2>
          <p className="mt-4 text-lg text-white/70 font-body leading-relaxed">
            They're using one of four things — and each one breaks at a specific, predictable moment.
          </p>
        </div>

        {/* Cards grid */}
        <div className="mt-12 sm:mt-16 grid sm:grid-cols-2 gap-5">
          {CARDS.map((card) => (
            <div
              key={card.title}
              className="group bg-white/[0.04] border border-white/[0.06] rounded-2xl p-6 sm:p-8 hover:-translate-y-1 transition-all duration-300 hover:bg-white/[0.06]"
            >
              <span className="text-4xl">{card.emoji}</span>
              <h3 className="mt-4 text-lg font-bold text-white font-display">{card.title}</h3>
              <p className="mt-3 text-sm text-white/70 leading-relaxed font-body">
                {card.description}
              </p>
              <div className="mt-5 px-4 py-3 rounded-lg" style={{ backgroundColor: 'rgba(181, 133, 10, 0.1)' }}>
                <p className="text-sm">
                  <span className="font-semibold" style={{ color: '#E0A80D' }}>Breaks when: </span>
                  <span style={{ color: '#D4A017' }}>{card.breaksWhen}</span>
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Transition line */}
        <div className="mt-12 sm:mt-16 text-center">
          <p className="text-lg sm:text-xl text-white/80 font-body max-w-2xl mx-auto">
            LendSolo replaces all of it — without the learning curve of enterprise software built for mortgage companies.
          </p>
        </div>
      </div>
    </section>
  )
}
