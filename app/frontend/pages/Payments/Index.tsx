import { useState, useMemo } from 'react'
import { router } from '@inertiajs/react'
import AppLayout from '@/layouts/AppLayout'
import RecordPaymentModal from '@/components/RecordPaymentModal'

interface PaymentItem {
  id: number
  amount: number
  date: string
  principal_portion: number
  interest_portion: number
  late_fee: number
  note: string | null
  loan_id: number
  borrower_name: string
}

interface LoanOption {
  id: number
  borrower_name: string
}

interface Props {
  payments: PaymentItem[]
  loans: LoanOption[]
  stats: {
    total_collected_month: number
    interest_earned_month: number
    principal_returned_month: number
  }
}

export default function PaymentsIndex({ payments, loans, stats }: Props) {
  const [modalOpen, setModalOpen] = useState(false)
  const [filterLoan, setFilterLoan] = useState<number | ''>('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const filtered = useMemo(() => {
    let result = payments

    if (filterLoan) {
      result = result.filter((p) => p.loan_id === filterLoan)
    }
    if (dateFrom) {
      result = result.filter((p) => p.date >= dateFrom)
    }
    if (dateTo) {
      result = result.filter((p) => p.date <= dateTo)
    }

    return result
  }, [payments, filterLoan, dateFrom, dateTo])

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
            <p className="text-sm text-gray-500 mt-1">{payments.length} total payments</p>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Record Payment
          </button>
        </div>

        {/* Summary Stats */}
        <div className="grid sm:grid-cols-3 gap-4 mb-6">
          <StatCard label="Collected This Month" value={stats.total_collected_month} />
          <StatCard label="Interest Earned This Month" value={stats.interest_earned_month} color="text-indigo-600" />
          <StatCard label="Principal Returned This Month" value={stats.principal_returned_month} color="text-emerald-600" />
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <select
            value={filterLoan}
            onChange={(e) => setFilterLoan(Number(e.target.value) || '')}
            className="text-sm px-3 py-2 border border-gray-200 rounded-lg bg-white text-gray-600"
          >
            <option value="">All Loans</option>
            {loans.map((l) => (
              <option key={l.id} value={l.id}>{l.borrower_name}</option>
            ))}
          </select>

          <div className="flex items-center gap-2">
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="text-sm px-3 py-2 border border-gray-200 rounded-lg bg-white text-gray-600"
            />
            <span className="text-gray-400 text-xs">to</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="text-sm px-3 py-2 border border-gray-200 rounded-lg bg-white text-gray-600"
            />
          </div>

          {(filterLoan || dateFrom || dateTo) && (
            <button
              onClick={() => { setFilterLoan(''); setDateFrom(''); setDateTo('') }}
              className="text-xs text-gray-500 hover:text-gray-700 px-3 py-2"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Payments Table */}
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">No payments yet</h3>
            <p className="text-sm text-gray-500 mb-6">Record your first payment to start tracking.</p>
            <button
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              Record Payment
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Borrower</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Date</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-500">Amount</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-500">Principal</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-500">Interest</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Note</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p) => (
                    <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                      <td className="py-2.5 px-4">
                        <button
                          onClick={() => router.visit(`/loans/${p.loan_id}`)}
                          className="text-sm font-medium text-emerald-600 hover:text-emerald-700"
                        >
                          {p.borrower_name}
                        </button>
                      </td>
                      <td className="py-2.5 px-4 text-gray-600">{p.date}</td>
                      <td className="py-2.5 px-4 text-right font-mono font-semibold text-gray-900">
                        ${p.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono text-emerald-600">
                        ${p.principal_portion.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono text-indigo-500">
                        ${p.interest_portion.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-4 text-gray-400 text-xs max-w-[200px] truncate">
                        {p.note || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <RecordPaymentModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        loans={loans}
      />
    </AppLayout>
  )
}

function StatCard({ label, value, color = 'text-gray-900' }: { label: string; value: number; color?: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className={`text-2xl font-bold font-mono ${color}`}>
        ${value.toLocaleString('en-US', { minimumFractionDigits: 2 })}
      </p>
    </div>
  )
}
