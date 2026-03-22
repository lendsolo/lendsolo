import { useState, useMemo } from 'react'
import { Link } from '@inertiajs/react'
import PublicLayout from '@/layouts/PublicLayout'
import SeoHead from '@/components/SeoHead'
import AnimatedNumber from '@/components/AnimatedNumber'
import CtaBanner from '@/components/CtaBanner'
import {
  calculateInterestOnly,
  calculateAmortization,
  type ScheduleRow,
} from '@/lib/calculations'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'

export default function InterestOnlyCalculatorPage() {
  const [principal, setPrincipal] = useState(100000)
  const [annualRate, setAnnualRate] = useState(12)
  const [termMonths, setTermMonths] = useState(12)
  const [startDate, setStartDate] = useState(() => new Date().toISOString().split('T')[0])

  const ioResult = useMemo(
    () => calculateInterestOnly(principal, annualRate, termMonths, new Date(startDate)),
    [principal, annualRate, termMonths, startDate],
  )

  const stdResult = useMemo(
    () => calculateAmortization(principal, annualRate, termMonths, new Date(startDate), 'standard'),
    [principal, annualRate, termMonths, startDate],
  )

  const monthlySavings = useMemo(
    () => Math.round((stdResult.monthlyPayment - ioResult.monthlyInterestPayment) * 100) / 100,
    [stdResult.monthlyPayment, ioResult.monthlyInterestPayment],
  )

  const extraInterest = useMemo(
    () => Math.round((ioResult.totalInterest - stdResult.totalInterest) * 100) / 100,
    [ioResult.totalInterest, stdResult.totalInterest],
  )

  const comparisonChartData = useMemo(() => [
    {
      name: 'Interest-Only',
      'Total Interest': ioResult.totalInterest,
      'Principal': principal,
    },
    {
      name: 'Fully Amortizing',
      'Total Interest': stdResult.totalInterest,
      'Principal': principal,
    },
  ], [ioResult.totalInterest, stdResult.totalInterest, principal])

  return (
    <PublicLayout
      title="Interest-Only Loan Calculator"
      description="See your monthly payment, balloon amount, and how interest-only compares to a fully amortizing loan."
    >
      <SeoHead
        title="Interest-Only Loan Calculator — Private Lending | LendSolo"
        description="Calculate monthly payments, balloon amount, and total interest for interest-only private loans. Free calculator for hard money and bridge loan structures."
        canonicalUrl="https://lendsolo.com/tools/interest-only-calculator"
        schema={{
          '@type': 'FinancialProduct',
          name: 'Interest-Only Loan Calculator',
          description: 'Calculate monthly payments, balloon amount, and total interest for interest-only private loans. Free calculator for hard money and bridge loan structures.',
          url: 'https://lendsolo.com/tools/interest-only-calculator',
          provider: { '@type': 'Organization', name: 'LendSolo' },
        }}
      />

      <div className="grid lg:grid-cols-[400px_1fr] gap-8">
        {/* Inputs */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8 h-fit">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Loan Details</h2>

          <div className="space-y-5">
            <InputField
              label="Loan Amount"
              prefix="$"
              type="number"
              value={principal}
              onChange={(v) => setPrincipal(Math.max(0, Number(v)))}
            />
            <InputField
              label="Annual Interest Rate"
              suffix="%"
              type="number"
              step="0.25"
              value={annualRate}
              onChange={(v) => setAnnualRate(Math.max(0, Number(v)))}
            />
            <InputField
              label="Term (Months)"
              type="number"
              value={termMonths}
              onChange={(v) => setTermMonths(Math.max(1, Math.round(Number(v))))}
            />
            <InputField
              label="Start Date"
              type="date"
              value={startDate}
              onChange={(v) => setStartDate(String(v))}
            />
          </div>

          {/* Cross-link */}
          <div className="mt-6 pt-5 border-t border-gray-100">
            <Link
              href="/tools/loan-amortization-calculator"
              className="text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1.5"
            >
              Compare all loan structures
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid sm:grid-cols-2 gap-4">
            {/* Monthly Interest Payment — primary */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <p className="text-sm text-gray-500 mb-1">Monthly Interest Payment</p>
              <AnimatedNumber
                value={ioResult.monthlyInterestPayment}
                prefix="$"
                className="text-3xl font-bold text-gray-900"
              />
              <p className="mt-1 text-xs text-gray-400">Interest only — no principal reduction</p>
            </div>

            {/* Balloon Payment — amber styling */}
            <div className="bg-amber-50 rounded-xl shadow-sm border border-amber-200 p-5">
              <p className="text-sm text-amber-700 mb-1">Balloon Payment at Maturity</p>
              <AnimatedNumber
                value={ioResult.balloonPayment}
                prefix="$"
                className="text-3xl font-bold text-amber-800"
              />
              <p className="mt-1 text-xs text-amber-600">Full principal due at end of term</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <p className="text-sm text-gray-500 mb-1">Total Interest Paid</p>
              <AnimatedNumber value={ioResult.totalInterest} prefix="$" className="text-2xl font-bold text-gray-900" />
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <p className="text-sm text-gray-500 mb-1">Total Cost</p>
              <AnimatedNumber value={ioResult.totalCost} prefix="$" className="text-2xl font-bold text-gray-900" />
              <p className="mt-1 text-xs text-gray-400">Principal + interest</p>
            </div>
          </div>

          {/* Payment Schedule */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">Payment Schedule</h3>
            </div>
            <div className="overflow-x-auto">
              <ScheduleTable schedule={ioResult.schedule} termMonths={termMonths} />
            </div>
          </div>

          {/* Informational Callout */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6">
            <h4 className="text-sm font-semibold text-emerald-800 mb-2">When does interest-only make sense?</h4>
            <p className="text-sm text-emerald-700 leading-relaxed">
              Interest-only structures work well for fix-and-flip loans where the borrower plans to sell before the term ends,
              bridge loans waiting on permanent financing or a property sale, and rehab projects where lower monthly payments
              during the construction period matter more than building equity. The trade-off is a large balloon payment at
              maturity — the borrower needs a clear exit strategy.
            </p>
          </div>

          {/* ── Comparison Panel ── */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">Interest-Only vs. Fully Amortizing</h3>
              <p className="mt-1 text-sm text-gray-500">Same principal, rate, and term — different structure</p>
            </div>

            {/* Comparison table */}
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-6 font-medium text-gray-500">Metric</th>
                  <th className="text-right py-3 px-6 font-medium text-gray-500">Interest-Only</th>
                  <th className="text-right py-3 px-6 font-medium text-gray-500">Fully Amortizing</th>
                </tr>
              </thead>
              <tbody>
                <CompRow
                  label="Monthly Payment"
                  ioVal={ioResult.monthlyInterestPayment}
                  stdVal={stdResult.monthlyPayment}
                  lowerIsGreen
                />
                <CompRow
                  label="Total Interest"
                  ioVal={ioResult.totalInterest}
                  stdVal={stdResult.totalInterest}
                  lowerIsGreen
                />
                <CompRow
                  label="Total Cost"
                  ioVal={ioResult.totalCost}
                  stdVal={stdResult.totalCost}
                  lowerIsGreen
                />
                <tr className="border-b border-gray-50">
                  <td className="py-3 px-6 font-medium text-gray-700">Balloon at Maturity</td>
                  <td className="py-3 px-6 text-right text-amber-700 font-semibold">
                    ${principal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-6 text-right text-emerald-600 font-semibold">$0.00</td>
                </tr>
              </tbody>
            </table>

            {/* Insight line */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
              <p className="text-sm text-gray-600">
                {monthlySavings > 0 ? (
                  <>
                    Interest-only saves{' '}
                    <span className="font-semibold text-emerald-600">
                      ${monthlySavings.toLocaleString('en-US', { minimumFractionDigits: 2 })}/month
                    </span>
                    {extraInterest > 0 && (
                      <>
                        {' '}but costs{' '}
                        <span className="font-semibold text-amber-700">
                          ${extraInterest.toLocaleString('en-US', { minimumFractionDigits: 2 })} more
                        </span>
                        {' '}in total interest.
                      </>
                    )}
                  </>
                ) : (
                  'Both structures have the same monthly payment at this rate and term.'
                )}
              </p>
            </div>

            {/* Comparison chart */}
            <div className="p-6">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={comparisonChartData} barGap={8}>
                  <XAxis dataKey="name" tick={{ fontSize: 13 }} />
                  <YAxis tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 12 }} />
                  <Tooltip
                    formatter={(value: number) => `$${value.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                  />
                  <Legend />
                  <Bar dataKey="Total Interest" fill="#818cf8" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Principal" fill="#34D399" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      <CtaBanner headline="Track this loan for real" buttonText="Create free account" />
    </PublicLayout>
  )
}

/* ── Sub-components ── */

function CompRow({
  label, ioVal, stdVal, lowerIsGreen,
}: {
  label: string; ioVal: number; stdVal: number; lowerIsGreen?: boolean
}) {
  const ioWins = lowerIsGreen ? ioVal <= stdVal : ioVal >= stdVal
  const stdWins = !ioWins
  return (
    <tr className="border-b border-gray-50">
      <td className="py-3 px-6 font-medium text-gray-700">{label}</td>
      <td className={`py-3 px-6 text-right font-semibold ${ioWins ? 'text-emerald-600' : 'text-gray-900'}`}>
        {ioWins && <span className="mr-1 text-emerald-500 text-xs">&#x2713;</span>}
        ${ioVal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
      </td>
      <td className={`py-3 px-6 text-right font-semibold ${stdWins ? 'text-emerald-600' : 'text-gray-900'}`}>
        {stdWins && <span className="mr-1 text-emerald-500 text-xs">&#x2713;</span>}
        ${stdVal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
      </td>
    </tr>
  )
}

function ScheduleTable({ schedule, termMonths }: { schedule: ScheduleRow[]; termMonths: number }) {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-gray-100">
          <th className="text-left py-3 px-4 font-medium text-gray-500">Month</th>
          <th className="text-left py-3 px-4 font-medium text-gray-500">Due Date</th>
          <th className="text-right py-3 px-4 font-medium text-gray-500">Interest</th>
          <th className="text-right py-3 px-4 font-medium text-gray-500">Principal</th>
          <th className="text-right py-3 px-4 font-medium text-gray-500">Balance</th>
        </tr>
      </thead>
      <tbody>
        {schedule.map((row) => {
          const isBalloon = row.month === termMonths
          return (
            <tr
              key={row.month}
              className={
                isBalloon
                  ? 'bg-amber-50 border-b border-amber-200'
                  : 'border-b border-gray-50 hover:bg-gray-50/50'
              }
            >
              <td className={`py-2.5 px-4 ${isBalloon ? 'text-amber-800 font-semibold' : 'text-gray-900'}`}>
                {row.month}
                {isBalloon && <span className="ml-2 text-xs font-normal text-amber-600">Balloon</span>}
              </td>
              <td className={`py-2.5 px-4 ${isBalloon ? 'text-amber-700' : 'text-gray-600'}`}>{row.dueDate}</td>
              <td className={`py-2.5 px-4 text-right ${isBalloon ? 'text-amber-700' : 'text-indigo-500'}`}>
                ${row.interestPortion.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </td>
              <td className={`py-2.5 px-4 text-right ${isBalloon ? 'text-amber-800 font-semibold' : 'text-gray-400'}`}>
                ${row.principalPortion.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </td>
              <td className={`py-2.5 px-4 text-right ${isBalloon ? 'text-amber-800 font-semibold' : 'text-gray-900'}`}>
                ${row.remainingBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

function InputField({
  label, prefix, suffix, ...props
}: {
  label: string
  prefix?: string
  suffix?: string
  type: string
  value: string | number
  onChange: (val: string | number) => void
  step?: string
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      <div className="relative">
        {prefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">{prefix}</span>
        )}
        <input
          type={props.type}
          step={props.step}
          value={props.value}
          onChange={(e) => props.onChange(e.target.value)}
          className={`w-full py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
            prefix ? 'pl-7 pr-3' : suffix ? 'pl-3 pr-8' : 'px-3'
          }`}
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">{suffix}</span>
        )}
      </div>
    </div>
  )
}
