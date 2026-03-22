import { useState, useMemo } from 'react'
import PublicLayout from '@/layouts/PublicLayout'
import SeoHead from '@/components/SeoHead'
import CtaBanner from '@/components/CtaBanner'
import { calculateAmortization, type LoanType, type AmortizationResult } from '@/lib/calculations'

interface LoanInput {
  label: string
  principal: number
  annualRate: number
  termMonths: number
  loanType: LoanType
}

const DEFAULT_LOANS: LoanInput[] = [
  { label: 'Loan A', principal: 100000, annualRate: 10, termMonths: 12, loanType: 'standard' },
  { label: 'Loan B', principal: 100000, annualRate: 12, termMonths: 12, loanType: 'standard' },
  { label: 'Loan C', principal: 100000, annualRate: 10, termMonths: 24, loanType: 'interest_only' },
]

export default function LoanComparisonPage() {
  const [loans, setLoans] = useState<LoanInput[]>(DEFAULT_LOANS)
  const [activeLoanCount, setActiveLoanCount] = useState(2)

  const startDate = useMemo(() => new Date(), [])

  const results = useMemo(
    () =>
      loans.slice(0, activeLoanCount).map((loan) =>
        calculateAmortization(loan.principal, loan.annualRate, loan.termMonths, startDate, loan.loanType),
      ),
    [loans, activeLoanCount, startDate],
  )

  function updateLoan(index: number, patch: Partial<LoanInput>) {
    setLoans((prev) => prev.map((l, i) => (i === index ? { ...l, ...patch } : l)))
  }

  // Determine winners
  const winners = useMemo(() => {
    if (results.length < 2) return { payment: -1, interest: -1, cost: -1 }
    const payments = results.map((r) => r.monthlyPayment)
    const interests = results.map((r) => r.totalInterest)
    const costs = results.map((r) => r.totalCost)
    return {
      payment: payments.indexOf(Math.min(...payments)),
      interest: interests.indexOf(Math.min(...interests)),
      cost: costs.indexOf(Math.min(...costs)),
    }
  }, [results])

  return (
    <PublicLayout
      title="Loan Comparison Tool"
      description="Compare up to 3 loan structures side by side. See which option has the lowest monthly payment, least total interest, and best overall cost."
    >
      <SeoHead
        title="Loan Comparison Tool — Compare Up to 3 Loans | LendSolo"
        description="Compare up to 3 loan structures side by side. See which has the lowest payment, least interest, and lowest total cost. Free for private lenders."
        canonicalUrl="https://lendsolo.com/tools/loan-comparison"
        schema={{
          '@type': 'FinancialProduct',
          name: 'Loan Comparison Tool',
          description: 'Compare up to 3 loan structures side by side. See which has the lowest payment, least interest, and lowest total cost. Free for private lenders.',
          url: 'https://lendsolo.com/tools/loan-comparison',
          provider: { '@type': 'Organization', name: 'LendSolo' },
        }}
      />

      {/* Loan count toggle */}
      <div className="flex items-center gap-3 mb-6">
        <span className="text-sm font-medium text-gray-700">Compare</span>
        <div className="flex bg-gray-100 rounded-lg p-0.5">
          {[2, 3].map((n) => (
            <button
              key={n}
              onClick={() => setActiveLoanCount(n)}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                activeLoanCount === n ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {n} Loans
            </button>
          ))}
        </div>
      </div>

      {/* Input columns */}
      <div className={`grid gap-6 ${activeLoanCount === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-2'}`}>
        {loans.slice(0, activeLoanCount).map((loan, i) => (
          <LoanInputCard key={i} loan={loan} index={i} onChange={(patch) => updateLoan(i, patch)} />
        ))}
      </div>

      {/* Comparison Results */}
      <div className="mt-10">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Comparison Results</h3>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-3 px-6 font-medium text-gray-500">Metric</th>
                {loans.slice(0, activeLoanCount).map((loan, i) => (
                  <th key={i} className="text-right py-3 px-6 font-medium text-gray-500">{loan.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <ComparisonRow
                label="Monthly Payment"
                values={results.map((r) => r.monthlyPayment)}
                winnerIndex={winners.payment}
              />
              <ComparisonRow
                label="Total Interest"
                values={results.map((r) => r.totalInterest)}
                winnerIndex={winners.interest}
              />
              <ComparisonRow
                label="Total Cost"
                values={results.map((r) => r.totalCost)}
                winnerIndex={winners.cost}
              />
              <ComparisonRow
                label="Term"
                values={loans.slice(0, activeLoanCount).map((l) => l.termMonths)}
                winnerIndex={-1}
                suffix=" mo"
                isCurrency={false}
              />
              <ComparisonRow
                label="Type"
                textValues={loans.slice(0, activeLoanCount).map((l) => formatLoanType(l.loanType))}
              />
            </tbody>
          </table>
        </div>
      </div>

      {/* Per-loan schedule summaries */}
      <div className={`mt-8 grid gap-6 ${activeLoanCount === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-2'}`}>
        {results.map((result, i) => (
          <ScheduleSummary key={i} label={loans[i].label} result={result} />
        ))}
      </div>

      <CtaBanner headline="Stop comparing in spreadsheets" buttonText="Try LendSolo free" />
    </PublicLayout>
  )
}

function LoanInputCard({
  loan, index, onChange,
}: {
  loan: LoanInput; index: number; onChange: (patch: Partial<LoanInput>) => void
}) {
  const colors = ['emerald', 'indigo', 'amber'] as const
  const color = colors[index] || 'gray'
  const borderClass = `border-${color}-200`
  const headerBg = index === 0 ? 'bg-emerald-50' : index === 1 ? 'bg-indigo-50' : 'bg-amber-50'
  const headerText = index === 0 ? 'text-emerald-800' : index === 1 ? 'text-indigo-800' : 'text-amber-800'

  return (
    <div className={`bg-white rounded-2xl shadow-sm border ${borderClass} overflow-hidden`}>
      <div className={`${headerBg} px-6 py-3 flex items-center justify-between`}>
        <input
          value={loan.label}
          onChange={(e) => onChange({ label: e.target.value })}
          className={`bg-transparent font-semibold ${headerText} focus:outline-none text-sm w-32`}
        />
        <span className={`text-xs font-medium ${headerText} opacity-60`}>#{index + 1}</span>
      </div>
      <div className="p-6 space-y-4">
        <CompactInput label="Amount" prefix="$" value={loan.principal} onChange={(v) => onChange({ principal: v })} />
        <CompactInput label="Rate" suffix="%" value={loan.annualRate} onChange={(v) => onChange({ annualRate: v })} step="0.25" />
        <CompactInput label="Term" suffix="mo" value={loan.termMonths} onChange={(v) => onChange({ termMonths: Math.max(1, Math.round(v)) })} />
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Type</label>
          <select
            value={loan.loanType}
            onChange={(e) => onChange({ loanType: e.target.value as LoanType })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          >
            <option value="standard">Standard</option>
            <option value="interest_only">Interest Only</option>
            <option value="balloon">Balloon</option>
          </select>
        </div>
      </div>
    </div>
  )
}

function CompactInput({
  label, prefix, suffix, value, onChange, step,
}: {
  label: string; prefix?: string; suffix?: string; value: number; onChange: (v: number) => void; step?: string
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
      <div className="relative">
        {prefix && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">{prefix}</span>}
        <input
          type="number"
          step={step}
          value={value}
          onChange={(e) => onChange(Math.max(0, Number(e.target.value)))}
          className={`w-full py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
            prefix ? 'pl-7 pr-3' : suffix ? 'pl-3 pr-10' : 'px-3'
          }`}
        />
        {suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">{suffix}</span>}
      </div>
    </div>
  )
}

function ComparisonRow({
  label, values, winnerIndex = -1, suffix = '', isCurrency = true, textValues,
}: {
  label: string
  values?: number[]
  winnerIndex?: number
  suffix?: string
  isCurrency?: boolean
  textValues?: string[]
}) {
  return (
    <tr className="border-b border-gray-50">
      <td className="py-3 px-6 font-medium text-gray-700">{label}</td>
      {textValues
        ? textValues.map((v, i) => (
            <td key={i} className="py-3 px-6 text-right text-gray-900">{v}</td>
          ))
        : values?.map((v, i) => {
            const isWinner = i === winnerIndex
            return (
              <td key={i} className={`py-3 px-6 text-right ${isWinner ? 'text-emerald-600 font-semibold' : 'text-gray-900'}`}>
                {isWinner && <span className="inline-block mr-1 text-emerald-500 text-xs">&#x2713;</span>}
                {isCurrency ? `$${v.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : `${v}${suffix}`}
              </td>
            )
          })}
    </tr>
  )
}

function ScheduleSummary({ label, result }: { label: string; result: AmortizationResult }) {
  const firstFive = result.schedule.slice(0, 5)
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-3 border-b border-gray-100">
        <h4 className="text-sm font-semibold text-gray-900">{label} — First 5 Payments</h4>
      </div>
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-gray-50">
            <th className="text-left py-2 px-4 font-medium text-gray-400">#</th>
            <th className="text-right py-2 px-4 font-medium text-gray-400">Payment</th>
            <th className="text-right py-2 px-4 font-medium text-gray-400">Principal</th>
            <th className="text-right py-2 px-4 font-medium text-gray-400">Interest</th>
          </tr>
        </thead>
        <tbody>
          {firstFive.map((row) => (
            <tr key={row.month} className="border-b border-gray-50">
              <td className="py-1.5 px-4 text-gray-600">{row.month}</td>
              <td className="py-1.5 px-4 text-right text-gray-900">${row.payment.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
              <td className="py-1.5 px-4 text-right text-emerald-600">${row.principalPortion.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
              <td className="py-1.5 px-4 text-right text-indigo-500">${row.interestPortion.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function formatLoanType(type: LoanType): string {
  switch (type) {
    case 'standard': return 'Standard'
    case 'interest_only': return 'Interest Only'
    case 'balloon': return 'Balloon'
  }
}
