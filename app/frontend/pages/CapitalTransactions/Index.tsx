import { useState, useMemo } from 'react'
import { useForm, router, usePage } from '@inertiajs/react'
import AppLayout from '@/layouts/AppLayout'

interface Transaction {
  id: number
  transaction_type: 'infusion' | 'withdrawal' | 'adjustment'
  amount: number
  date: string
  source: string | null
  note: string | null
  created_at: string
}

interface Props {
  transactions: Transaction[]
  stats: {
    total_capital: number
    total_infused: number
    total_withdrawn: number
    total_adjustments: number
    net_change_this_year: number
  }
}

type FilterType = 'all' | 'infusion' | 'withdrawal' | 'adjustment'

const TYPE_BADGES: Record<string, { label: string; bg: string; text: string }> = {
  infusion: { label: 'Infusion', bg: 'bg-emerald-50', text: 'text-emerald-700' },
  withdrawal: { label: 'Withdrawal', bg: 'bg-red-50', text: 'text-red-700' },
  adjustment: { label: 'Adjustment', bg: 'bg-gray-100', text: 'text-gray-600' },
}

export default function CapitalTransactionsIndex({ transactions, stats }: Props) {
  const { flash } = usePage<{ flash: { notice?: string; alert?: string } }>().props
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [filter, setFilter] = useState<FilterType>('all')

  const form = useForm({
    transaction_type: 'infusion' as string,
    amount: '',
    date: new Date().toISOString().split('T')[0],
    source: '',
    note: '',
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    router.post('/capital_transactions', { capital_transaction: form.data }, {
      onSuccess: () => {
        form.reset()
        setShowForm(false)
      },
    })
  }

  function handleDelete(id: number) {
    router.delete(`/capital_transactions/${id}`, {
      onSuccess: () => setDeleteId(null),
    })
  }

  const filteredTransactions = transactions.filter((t) => {
    if (filter === 'all') return true
    return t.transaction_type === filter
  })

  // Compute running balance (transactions come newest-first, so reverse for cumulative calc)
  const transactionsWithBalance = useMemo(() => {
    const sorted = [...filteredTransactions].reverse()
    let balance = 0

    // If filtering, we need the starting balance from all transactions before the filtered set
    // For simplicity, compute from all transactions in chronological order
    const allSorted = [...transactions].reverse()
    const balances = new Map<number, number>()
    let runningBalance = 0
    for (const t of allSorted) {
      if (t.transaction_type === 'infusion' || t.transaction_type === 'adjustment') {
        runningBalance += t.amount
      } else {
        runningBalance -= t.amount
      }
      balances.set(t.id, runningBalance)
    }

    return filteredTransactions.map((t) => ({
      ...t,
      running_balance: balances.get(t.id) || 0,
    }))
  }, [transactions, filteredTransactions])

  const sourcePlaceholder = form.data.transaction_type === 'withdrawal'
    ? 'e.g. Owner draw, Operating expenses'
    : 'e.g. Personal savings, Profit reinvestment'

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Capital</h1>
            <p className="text-sm text-gray-500 mt-1">Track money in and out of your lending business</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Transaction
          </button>
        </div>

        {/* Flash messages */}
        {flash?.notice && (
          <div className="mb-6 px-4 py-3 rounded-lg bg-emerald-50 border border-emerald-200 text-sm text-emerald-700">
            {flash.notice}
          </div>
        )}
        {flash?.alert && (
          <div className="mb-6 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
            {flash.alert}
          </div>
        )}

        {/* Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-xs text-gray-500 mb-1">Total Capital</p>
            <p className="text-2xl font-bold font-mono text-emerald-600">
              ${stats.total_capital.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-xs text-gray-500 mb-1">Total Infused</p>
            <p className="text-2xl font-bold font-mono text-gray-900">
              ${stats.total_infused.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-xs text-gray-500 mb-1">Total Withdrawn</p>
            <p className="text-2xl font-bold font-mono text-red-600">
              ${stats.total_withdrawn.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-xs text-gray-500 mb-1">Net Change This Year</p>
            <p className={`text-2xl font-bold font-mono ${stats.net_change_this_year >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {stats.net_change_this_year >= 0 ? '+' : '-'}${Math.abs(stats.net_change_this_year).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        {/* Quick Add Form */}
        {showForm && (
          <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">New Transaction</h3>
            <form onSubmit={handleSubmit}>
              {/* Transaction type pills */}
              <div className="flex gap-2 mb-4">
                {([
                  { value: 'infusion', label: 'Add Capital' },
                  { value: 'withdrawal', label: 'Withdraw' },
                  { value: 'adjustment', label: 'Adjustment' },
                ] as const).map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => form.setData('transaction_type', opt.value)}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                      form.data.transaction_type === opt.value
                        ? opt.value === 'infusion'
                          ? 'bg-emerald-600 text-white'
                          : opt.value === 'withdrawal'
                            ? 'bg-red-600 text-white'
                            : 'bg-gray-800 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1 sm:max-w-[160px]">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">$</span>
                  <input
                    type="number"
                    placeholder="Amount"
                    step="0.01"
                    min="0.01"
                    value={form.data.amount}
                    onChange={(e) => form.setData('amount', e.target.value)}
                    className="w-full text-sm pl-7 pr-3 py-2 border border-gray-200 rounded-lg bg-white text-gray-900 placeholder-gray-400 font-mono"
                    required
                  />
                </div>
                <input
                  type="date"
                  value={form.data.date}
                  onChange={(e) => form.setData('date', e.target.value)}
                  className="w-full sm:w-40 text-sm px-3 py-2 border border-gray-200 rounded-lg bg-white text-gray-600"
                  required
                />
                <input
                  type="text"
                  placeholder={sourcePlaceholder}
                  value={form.data.source}
                  onChange={(e) => form.setData('source', e.target.value)}
                  className="flex-1 text-sm px-3 py-2 border border-gray-200 rounded-lg bg-white text-gray-900 placeholder-gray-400"
                />
                <button
                  type="submit"
                  disabled={form.processing}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 shrink-0"
                >
                  {form.processing ? 'Saving...' : 'Save'}
                </button>
              </div>

              {/* Note field */}
              <div className="mt-3">
                <textarea
                  placeholder="Note (optional)"
                  value={form.data.note}
                  onChange={(e) => form.setData('note', e.target.value)}
                  rows={2}
                  className="w-full text-sm px-3 py-2 border border-gray-200 rounded-lg bg-white text-gray-900 placeholder-gray-400 resize-none"
                />
              </div>

              {form.errors && Object.keys(form.errors).length > 0 && (
                <div className="mt-2 text-xs text-red-600">
                  {Object.values(form.errors).flat().join(', ')}
                </div>
              )}
            </form>
          </div>
        )}

        {/* Filter Chips */}
        {transactions.length > 0 && (
          <div className="flex items-center gap-2 mb-4">
            {([
              { value: 'all' as FilterType, label: 'All' },
              { value: 'infusion' as FilterType, label: 'Infusions' },
              { value: 'withdrawal' as FilterType, label: 'Withdrawals' },
              { value: 'adjustment' as FilterType, label: 'Adjustments' },
            ]).map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                  filter === f.value
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        )}

        {/* Transactions List */}
        {transactions.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-emerald-50 flex items-center justify-center">
              <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0 0 12 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75Z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">No capital transactions yet</h3>
            <p className="text-sm text-gray-500 mb-6">Log your first capital infusion to start tracking your money flow.</p>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              Log First Infusion
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Date</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Type</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-500">Amount</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Source</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Note</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-500">Balance</th>
                    <th className="w-20 py-3 px-4"></th>
                  </tr>
                </thead>
                <tbody>
                  {transactionsWithBalance.map((txn) => {
                    const badge = TYPE_BADGES[txn.transaction_type] || TYPE_BADGES.adjustment
                    const isWithdrawal = txn.transaction_type === 'withdrawal'
                    return (
                      <tr key={txn.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                        <td className="py-2.5 px-4 text-gray-600">{txn.date}</td>
                        <td className="py-2.5 px-4">
                          <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full ${badge.bg} ${badge.text}`}>
                            {badge.label}
                          </span>
                        </td>
                        <td className={`py-2.5 px-4 text-right font-mono font-semibold ${isWithdrawal ? 'text-red-600' : 'text-gray-900'}`}>
                          {isWithdrawal ? '-' : '+'}${txn.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-2.5 px-4 text-gray-600">{txn.source || '-'}</td>
                        <td className="py-2.5 px-4 text-gray-500 max-w-[200px] truncate">{txn.note || '-'}</td>
                        <td className="py-2.5 px-4 text-right font-mono text-gray-400">
                          ${txn.running_balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-2.5 px-4">
                          <div className="flex items-center gap-1 justify-end">
                            {deleteId === txn.id ? (
                              <>
                                <button
                                  onClick={() => handleDelete(txn.id)}
                                  className="text-[10px] font-medium text-red-600 hover:text-red-700 px-1.5 py-0.5 rounded bg-red-50"
                                >
                                  Confirm
                                </button>
                                <button
                                  onClick={() => setDeleteId(null)}
                                  className="text-[10px] font-medium text-gray-500 hover:text-gray-700 px-1.5 py-0.5"
                                >
                                  Cancel
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => setDeleteId(txn.id)}
                                className="text-gray-300 hover:text-red-500 transition-colors"
                                title="Delete transaction (will recalculate total capital)"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                </svg>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
