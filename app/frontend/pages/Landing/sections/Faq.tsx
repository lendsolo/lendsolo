import { useState } from 'react'

const QUESTIONS = [
  {
    q: 'Is this for me if I only have 2–3 loans?',
    a: "Yes — especially if you're planning to do more. The loan limit on our Solo plan is 5, which covers most people starting out. More importantly, the habits you build now (documenting collateral, tracking principal/interest separately, keeping records for tax time) matter even at 2 loans. Starting on a real system is easier than migrating from a spreadsheet later.",
  },
  {
    q: "What about compliance? I'm worried about lending laws.",
    a: "LendSolo is a tracking and reporting tool — it doesn't provide legal advice and isn't a compliance engine. What it does do is nudge you toward better practices: documenting collateral, keeping payment records, flagging unusual rate structures. For actual compliance (state lending laws, usury limits, licensing requirements), you need an attorney in your state. We'll publish guides on this — but we're a software tool, not a law firm.",
  },
  {
    q: 'Can I import my existing spreadsheet?',
    a: "Yes. LendSolo has a spreadsheet import tool that accepts .csv and .xlsx files. You map your columns to our fields, review the loans before they're created, and import in one click. We try to auto-detect column names (\"borrower,\" \"principal,\" \"rate\") to minimize the manual mapping. It's not perfect for every spreadsheet format, but it handles the common patterns well.",
  },
  {
    q: 'How is this different from QuickBooks?',
    a: "QuickBooks is accounting software that can track money coming in and going out. It can't generate amortization schedules, split payments into principal and interest automatically, produce borrower statements, calculate your portfolio's LTV exposure, or tell you when a payment is overdue based on loan terms. It also can't warn you that one borrower represents 70% of your capital. For a private lender, QuickBooks tracks the money — LendSolo understands the loans.",
  },
  {
    q: 'What happens to my data if I cancel?',
    a: "You can export everything as CSV at any time. If you cancel, your account goes into read-only mode for 30 days so you can export before we delete anything. We'll always give you a way out with your data intact.",
  },
]

export default function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section className="py-20 sm:py-28 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-[#1A7A50] font-body">
            Questions we actually get
          </p>
        </div>

        {/* Accordion */}
        <div className="mt-10 sm:mt-12 divide-y divide-[#E4E3DB]">
          {QUESTIONS.map((item, i) => {
            const isOpen = openIndex === i
            return (
              <div key={i}>
                <button
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="w-full flex items-center justify-between py-5 sm:py-6 text-left group"
                >
                  <span className="text-base sm:text-lg font-semibold text-[#1C1C19] pr-8 font-display group-hover:text-[#1A7A50] transition-colors">
                    {item.q}
                  </span>
                  <svg
                    className={`w-5 h-5 text-[#8A8A7E] shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    isOpen ? 'max-h-96 opacity-100 pb-6' : 'max-h-0 opacity-0'
                  }`}
                >
                  <p className="text-[15px] text-[#4D4D45] leading-relaxed font-body">{item.a}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
