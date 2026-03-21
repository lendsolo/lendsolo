import { useState, useMemo } from 'react'
import { Link } from '@inertiajs/react'
import PublicLayout from '@/layouts/PublicLayout'
import SeoHead from '@/components/SeoHead'
import AnimatedNumber from '@/components/AnimatedNumber'
import CtaBanner from '@/components/CtaBanner'
import { calculateAmortization, type LoanType, type ScheduleRow } from '@/lib/calculations'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'

type ViewMode = 'table' | 'chart'

export default function AmortizationCalculatorPage() {
  const [principal, setPrincipal] = useState(100000)
  const [annualRate, setAnnualRate] = useState(12)
  const [termMonths, setTermMonths] = useState(12)
  const [loanType, setLoanType] = useState<LoanType>('standard')
  const [startDate, setStartDate] = useState(() => new Date().toISOString().split('T')[0])
  const [viewMode, setViewMode] = useState<ViewMode>('table')

  const result = useMemo(
    () => calculateAmortization(principal, annualRate, termMonths, new Date(startDate), loanType),
    [principal, annualRate, termMonths, startDate, loanType],
  )

  const chartData = useMemo(
    () =>
      result.schedule.map((row) => ({
        month: `M${row.month}`,
        Principal: row.principalPortion,
        Interest: row.interestPortion,
      })),
    [result.schedule],
  )

  return (
    <PublicLayout
      title="Loan Amortization Calculator"
      description="Calculate monthly payments, total interest, and view full amortization schedules for standard, interest-only, and balloon loans."
    >
      <SeoHead
        title="Free Loan Amortization Calculator"
        description="Calculate monthly payments, total interest, and view full amortization schedules for private lending. Supports standard, interest-only, and balloon loan structures."
        canonicalPath="/tools/loan-amortization-calculator"
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Loan Type</label>
              <select
                value={loanType}
                onChange={(e) => setLoanType(e.target.value as LoanType)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="standard">Standard (Fully Amortizing)</option>
                <option value="interest_only">Interest Only</option>
                <option value="balloon">Balloon</option>
              </select>
            </div>
            <InputField
              label="Start Date"
              type="date"
              value={startDate}
              onChange={(v) => setStartDate(String(v))}
            />
          </div>
        </div>

        {/* Results */}
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid sm:grid-cols-3 gap-4">
            <MetricCard label="Monthly Payment" value={result.monthlyPayment} prefix="$" />
            <MetricCard label="Total Interest" value={result.totalInterest} prefix="$" />
            <MetricCard label="Total Cost" value={result.totalCost} prefix="$" />
          </div>

          {/* Schedule */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">Amortization Schedule</h3>
              <div className="flex bg-gray-100 rounded-lg p-0.5">
                <button
                  onClick={() => setViewMode('table')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    viewMode === 'table' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Table
                </button>
                <button
                  onClick={() => setViewMode('chart')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    viewMode === 'chart' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Chart
                </button>
              </div>
            </div>

            {viewMode === 'chart' ? (
              <div className="p-6">
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} interval={Math.max(0, Math.floor(termMonths / 12) - 1)} />
                    <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `$${v.toLocaleString()}`} />
                    <Tooltip
                      formatter={(value: number) => `$${value.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
                      contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                    />
                    <Legend />
                    <Area type="monotone" dataKey="Principal" stackId="1" stroke="#34D399" fill="#34D399" fillOpacity={0.6} />
                    <Area type="monotone" dataKey="Interest" stackId="1" stroke="#818cf8" fill="#818cf8" fillOpacity={0.6} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <ScheduleTable schedule={result.schedule} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cross-link */}
      <div className="mt-8 text-center">
        <Link
          href="/tools/interest-only-calculator"
          className="inline-flex items-center gap-1.5 text-sm text-emerald-600 hover:text-emerald-700 font-medium"
        >
          Comparing loan structures? Try our interest-only calculator
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Link>
      </div>

      <CtaBanner headline="Track this loan for real" buttonText="Create free account" />
    </PublicLayout>
  )
}

function MetricCard({ label, value, prefix = '' }: { label: string; value: number; prefix?: string }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <AnimatedNumber value={value} prefix={prefix} className="text-2xl font-bold text-gray-900" />
    </div>
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

function ScheduleTable({ schedule }: { schedule: ScheduleRow[] }) {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-gray-100">
          <th className="text-left py-3 px-4 font-medium text-gray-500">Month</th>
          <th className="text-left py-3 px-4 font-medium text-gray-500">Due Date</th>
          <th className="text-right py-3 px-4 font-medium text-gray-500">Payment</th>
          <th className="text-right py-3 px-4 font-medium text-gray-500">Principal</th>
          <th className="text-right py-3 px-4 font-medium text-gray-500">Interest</th>
          <th className="text-right py-3 px-4 font-medium text-gray-500">Balance</th>
        </tr>
      </thead>
      <tbody>
        {schedule.map((row) => (
          <tr key={row.month} className="border-b border-gray-50 hover:bg-gray-50/50">
            <td className="py-2.5 px-4 text-gray-900">{row.month}</td>
            <td className="py-2.5 px-4 text-gray-600">{row.dueDate}</td>
            <td className="py-2.5 px-4 text-right text-gray-900">${row.payment.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
            <td className="py-2.5 px-4 text-right text-emerald-600">${row.principalPortion.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
            <td className="py-2.5 px-4 text-right text-indigo-500">${row.interestPortion.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
            <td className="py-2.5 px-4 text-right text-gray-900">${row.remainingBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
