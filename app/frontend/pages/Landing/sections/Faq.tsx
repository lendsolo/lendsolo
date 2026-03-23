import { useState } from 'react'

const QUESTIONS = [
  {
    q: 'Is this for me?',
    a: "LendSolo is built for solo private lenders and small lending operations — people managing $50K to $500K across 1 to 15 loans. If you're doing fix-and-flip bridge loans, long-term holds, or any kind of private lending and currently using a spreadsheet, this was built for you.",
  },
  {
    q: 'What about regulatory compliance?',
    a: "LendSolo is a loan tracking and management tool — it doesn't originate loans, collect payments on your behalf, or provide legal advice. Compliance with state lending laws is your responsibility, just as it is with a spreadsheet. That said, the guardrails and documentation features can help you maintain good practices.",
  },
  {
    q: 'Can I import my existing spreadsheet?',
    a: "Yes. Upload a CSV or XLSX file and LendSolo will auto-detect your columns — borrower name, principal, rate, term, and more. Review the mapping, confirm, and your loans are imported in minutes. Solo plan and above.",
  },
  {
    q: 'How is this different from QuickBooks?',
    a: "QuickBooks is accounting software — it tracks income and expenses. LendSolo is lending software — it understands loan structures, amortization, LTV ratios, and borrower relationships. It generates the reports your accountant needs, but it thinks in loans, not journal entries.",
  },
  {
    q: 'Is my data secure?',
    a: "Your data is encrypted at rest and in transit. Each user's data is fully isolated. We don't share, sell, or use your loan data for anything other than running the product. You can export all your data at any time.",
  },
  {
    q: 'What if I outgrow LendSolo?',
    a: "If you scale past 25 loans or need multi-investor fund management, the Fund tier ($99/month, unlimited loans) is on the way. Get on the waitlist and we'll notify you when it launches.",
  },
]

export default function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section id="faq" className="py-20 sm:py-24" style={{ backgroundColor: '#f8f7f4' }}>
      <div className="max-w-[720px] mx-auto px-8">
        <p className="text-[11px] font-mono uppercase tracking-[2px] text-[#1a7a4c] font-medium mb-3">
          FAQ
        </p>
        <h2 className="font-display text-3xl sm:text-[40px] leading-[1.15] text-[#0f1a2e] tracking-tight mb-10">
          Common questions
        </h2>

        <div className="divide-y divide-[#e2e0d8]">
          {QUESTIONS.map((item, i) => {
            const isOpen = openIndex === i
            return (
              <div key={i} className="py-6">
                <button
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="w-full flex items-center justify-between text-left group"
                >
                  <span className="text-base font-semibold text-[#0f1a2e] pr-4">
                    {item.q}
                  </span>
                  <span className="text-xl font-light text-[#8c95a6] min-w-[24px] text-center transition-transform duration-200">
                    {isOpen ? '−' : '+'}
                  </span>
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    isOpen ? 'max-h-[300px] pt-4 opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <p className="text-[15px] leading-relaxed text-[#5a6578]">{item.a}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
