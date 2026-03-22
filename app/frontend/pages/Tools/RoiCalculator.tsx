import { useState, useMemo } from 'react'
import PublicLayout from '@/layouts/PublicLayout'
import SeoHead from '@/components/SeoHead'
import AnimatedNumber from '@/components/AnimatedNumber'
import CtaBanner from '@/components/CtaBanner'
import { calculateRoi } from '@/lib/calculations'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

export default function RoiCalculatorPage() {
  const [purchasePrice, setPurchasePrice] = useState(150000)
  const [rehabCost, setRehabCost] = useState(30000)
  const [holdingCosts, setHoldingCosts] = useState(5000)
  const [salePrice, setSalePrice] = useState(250000)
  const [loanAmount, setLoanAmount] = useState(120000)
  const [loanRate, setLoanRate] = useState(12)
  const [holdMonths, setHoldMonths] = useState(6)

  const result = useMemo(
    () => calculateRoi(purchasePrice, rehabCost, holdingCosts, salePrice, loanAmount, loanRate, holdMonths),
    [purchasePrice, rehabCost, holdingCosts, salePrice, loanAmount, loanRate, holdMonths],
  )

  const interestCost = useMemo(
    () => Math.round((loanAmount * loanRate / 100) * (holdMonths / 12) * 100) / 100,
    [loanAmount, loanRate, holdMonths],
  )

  const barData = useMemo(() => {
    const items = [
      { name: 'Purchase', value: purchasePrice, color: '#6366f1' },
      { name: 'Rehab', value: rehabCost, color: '#8b5cf6' },
      { name: 'Holding', value: holdingCosts, color: '#a78bfa' },
      { name: 'Interest', value: interestCost, color: '#c4b5fd' },
      { name: 'Profit', value: Math.max(0, result.netProfit), color: '#34D399' },
    ]
    if (result.netProfit < 0) {
      items[4] = { name: 'Loss', value: Math.abs(result.netProfit), color: '#f87171' }
    }
    return items
  }, [purchasePrice, rehabCost, holdingCosts, interestCost, result.netProfit])

  return (
    <PublicLayout
      title="ROI Calculator"
      description="Analyze the return on investment for your private lending deals. Calculate net profit, ROI, annualized returns, and cash-on-cash yield."
    >
      <SeoHead
        title="Private Lending ROI Calculator — Free | LendSolo"
        description="Calculate net profit, ROI, and cash-on-cash return for private lending deals. Input purchase price, rehab, and loan terms to see your projected return."
        canonicalUrl="https://lendsolo.com/tools/roi-calculator"
        schema={{
          '@type': 'FinancialProduct',
          name: 'Private Lending ROI Calculator',
          description: 'Calculate net profit, ROI, and cash-on-cash return for private lending deals. Input purchase price, rehab, and loan terms to see your projected return.',
          url: 'https://lendsolo.com/tools/roi-calculator',
          provider: { '@type': 'Organization', name: 'LendSolo' },
        }}
      />

      <div className="grid lg:grid-cols-[400px_1fr] gap-8">
        {/* Inputs */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8 h-fit">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Deal Details</h2>

          <div className="space-y-5">
            <InputField label="Purchase Price" prefix="$" value={purchasePrice} onChange={setPurchasePrice} />
            <InputField label="Rehab / Renovation Cost" prefix="$" value={rehabCost} onChange={setRehabCost} />
            <InputField label="Holding Costs" prefix="$" value={holdingCosts} onChange={setHoldingCosts} />
            <InputField label="Expected Sale Price" prefix="$" value={salePrice} onChange={setSalePrice} />

            <div className="border-t border-gray-100 pt-5">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-4">Financing</p>
              <div className="space-y-5">
                <InputField label="Loan Amount" prefix="$" value={loanAmount} onChange={setLoanAmount} />
                <InputField label="Loan Rate" suffix="%" value={loanRate} onChange={setLoanRate} step="0.25" />
                <InputField label="Hold Period (Months)" value={holdMonths} onChange={setHoldMonths} />
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-6">
          {/* Metric Cards */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className={`rounded-xl shadow-sm border p-5 ${result.netProfit >= 0 ? 'bg-white border-gray-200' : 'bg-red-50 border-red-200'}`}>
              <p className="text-sm text-gray-500 mb-1">Net Profit</p>
              <AnimatedNumber
                value={result.netProfit}
                prefix="$"
                className={`text-2xl font-bold ${result.netProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}
              />
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <p className="text-sm text-gray-500 mb-1">ROI</p>
              <AnimatedNumber value={result.roiPercent} suffix="%" className="text-2xl font-bold text-gray-900" />
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <p className="text-sm text-gray-500 mb-1">Annualized ROI</p>
              <AnimatedNumber value={result.annualizedRoi} suffix="%" className="text-2xl font-bold text-gray-900" />
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <p className="text-sm text-gray-500 mb-1">Cash-on-Cash Return</p>
              <AnimatedNumber value={result.cashOnCashReturn} suffix="%" className="text-2xl font-bold text-gray-900" />
            </div>
          </div>

          {/* Cost Breakdown Chart */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Where the Money Goes</h3>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={barData} layout="vertical" margin={{ left: 20 }}>
                <XAxis type="number" tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 12 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 13 }} width={80} />
                <Tooltip
                  formatter={(value: number) => `$${value.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                />
                <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                  {barData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Summary Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <tbody>
                <SummaryRow label="Total Investment" value={purchasePrice + rehabCost + holdingCosts} />
                <SummaryRow label="Cash Invested (equity)" value={purchasePrice + rehabCost + holdingCosts - loanAmount} />
                <SummaryRow label="Interest Cost" value={interestCost} />
                <SummaryRow label="Sale Price" value={salePrice} />
                <SummaryRow label="Net Profit" value={result.netProfit} highlight />
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <CtaBanner headline="Manage your lending portfolio" buttonText="Try LendSolo free" />
    </PublicLayout>
  )
}

function SummaryRow({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <tr className={highlight ? 'bg-gray-50 font-semibold' : 'border-b border-gray-50'}>
      <td className="py-3 px-6 text-gray-700">{label}</td>
      <td className={`py-3 px-6 text-right ${highlight && value >= 0 ? 'text-emerald-600' : highlight && value < 0 ? 'text-red-600' : 'text-gray-900'}`}>
        ${value.toLocaleString('en-US', { minimumFractionDigits: 2 })}
      </td>
    </tr>
  )
}

function InputField({
  label, prefix, suffix, value, onChange, step,
}: {
  label: string; prefix?: string; suffix?: string; value: number; onChange: (v: number) => void; step?: string
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      <div className="relative">
        {prefix && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">{prefix}</span>}
        <input
          type="number"
          step={step}
          value={value}
          onChange={(e) => onChange(Math.max(0, Number(e.target.value)))}
          className={`w-full py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
            prefix ? 'pl-7 pr-3' : suffix ? 'pl-3 pr-8' : 'px-3'
          }`}
        />
        {suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">{suffix}</span>}
      </div>
    </div>
  )
}
