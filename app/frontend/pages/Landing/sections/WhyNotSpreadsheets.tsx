const FAILURES = [
  {
    title: 'One wrong formula',
    description:
      "Spreadsheets don't validate. A mistyped cell, a copied formula that's off by a row, a rate entered as 8 instead of .08 — and your entire amortization schedule is wrong. You won't know until tax season.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
      </svg>
    ),
  },
  {
    title: 'No audit trail',
    description:
      "When did you record that payment? What was the late fee you agreed to waive? Spreadsheets don't remember. If a borrower disputes a balance, you're reconstructing history from memory and email threads.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
      </svg>
    ),
  },
  {
    title: 'Tax season is a nightmare',
    description:
      "Calculating total interest paid per borrower, separating principal from interest, figuring out what's reportable — none of that is automatic. You do it manually, every year, under deadline pressure.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.047 8.287 8.287 0 0 0 9 9.601a8.983 8.983 0 0 1 3.361-6.867 8.21 8.21 0 0 0 3 2.48Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 0 0 .495-7.468 5.99 5.99 0 0 0-1.925 3.547 5.975 5.975 0 0 1-2.133-1.001A3.75 3.75 0 0 0 12 18Z" />
      </svg>
    ),
  },
  {
    title: 'It breaks at loan #2',
    description:
      "One loan in a spreadsheet is manageable. Three loans across two borrowers with different terms, one of which is interest-only — now you have multiple tabs, manual cross-references, and no single view of what you're owed.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 16.875h3.375m0 0h3.375m-3.375 0V13.5m0 3.375v3.375M6 10.5h2.25a2.25 2.25 0 0 0 2.25-2.25V6a2.25 2.25 0 0 0-2.25-2.25H6A2.25 2.25 0 0 0 3.75 6v2.25A2.25 2.25 0 0 0 6 10.5Zm0 9.75h2.25A2.25 2.25 0 0 0 10.5 18v-2.25a2.25 2.25 0 0 0-2.25-2.25H6a2.25 2.25 0 0 0-2.25 2.25V18A2.25 2.25 0 0 0 6 20.25Zm9.75-9.75H18a2.25 2.25 0 0 0 2.25-2.25V6A2.25 2.25 0 0 0 18 3.75h-2.25A2.25 2.25 0 0 0 13.5 6v2.25a2.25 2.25 0 0 0 2.25 2.25Z" />
      </svg>
    ),
  },
]

export default function WhyNotSpreadsheets() {
  return (
    <section className="relative py-20 sm:py-28 overflow-hidden" style={{ backgroundColor: '#141210' }}>
      {/* Subtle noise texture — matches other sections */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Top divider line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-amber-400 font-body">
            Why not spreadsheets?
          </p>
          <h2 className="mt-4 text-3xl sm:text-4xl font-bold text-white font-display leading-tight">
            Your spreadsheet doesn't know what it doesn't know.
          </h2>
          <p className="mt-4 text-lg text-white/50 font-body leading-relaxed">
            Most private lenders start in Excel. Here's where it breaks.
          </p>
        </div>

        {/* Failure cards — 2x2 grid */}
        <div className="mt-12 sm:mt-16 grid sm:grid-cols-2 gap-5">
          {FAILURES.map((card) => (
            <div
              key={card.title}
              className="group bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 sm:p-8 hover:-translate-y-1 transition-all duration-300 hover:bg-white/[0.05]"
            >
              <div className="flex items-start gap-4">
                <div
                  className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)' }}
                >
                  <span className="text-amber-400">{card.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-white font-display">{card.title}</h3>
                  <p className="mt-3 text-sm text-white/50 leading-relaxed font-body">
                    {card.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Closing line */}
        <div className="mt-12 sm:mt-16 text-center">
          <p className="text-lg sm:text-xl text-white/70 font-body max-w-2xl mx-auto leading-relaxed">
            LendSolo doesn't replace your spreadsheet.{' '}
            <span className="font-semibold text-white">It makes the spreadsheet unnecessary.</span>
          </p>
        </div>
      </div>

      {/* Bottom divider line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
    </section>
  )
}
