import { useState } from 'react'
import { useForm, router } from '@inertiajs/react'
import AppLayout from '@/layouts/AppLayout'

interface ExpenseItem {
  id: number
  description: string
  amount: number
  date: string
  category: string
  created_at: string
  recurring: boolean
  frequency: string | null
  next_occurrence_date: string | null
  recurring_parent_id: number | null
  active: boolean
  parent_description: string | null
}

interface Props {
  expenses: ExpenseItem[]
  stats: {
    total_all_time: number
    total_this_month: number
    count_this_month: number
    recurring_monthly: number
  }
  categories: string[]
  can_export_csv?: boolean
}

const CATEGORY_BADGES: Record<string, { label: string; bg: string; text: string }> = {
  legal: { label: 'Legal', bg: 'bg-purple-50', text: 'text-purple-700' },
  filing: { label: 'Filing', bg: 'bg-blue-50', text: 'text-blue-700' },
  software: { label: 'Software', bg: 'bg-indigo-50', text: 'text-indigo-700' },
  marketing: { label: 'Marketing', bg: 'bg-pink-50', text: 'text-pink-700' },
  insurance: { label: 'Insurance', bg: 'bg-cyan-50', text: 'text-cyan-700' },
  travel: { label: 'Travel', bg: 'bg-amber-50', text: 'text-amber-700' },
  office: { label: 'Office', bg: 'bg-emerald-50', text: 'text-emerald-700' },
  other: { label: 'Other', bg: 'bg-gray-100', text: 'text-gray-600' },
}

const FREQUENCY_LABELS: Record<string, string> = {
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  annually: 'Annually',
}

type FilterType = 'all' | 'one_time' | 'recurring'

export default function ExpensesIndex({ expenses, stats, categories, can_export_csv = false }: Props) {
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [filter, setFilter] = useState<FilterType>('all')

  const form = useForm({
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    category: 'other',
    recurring: false,
    frequency: 'monthly',
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const data = {
      ...form.data,
      recurring: form.data.recurring ? 'true' : 'false',
      frequency: form.data.recurring ? form.data.frequency : '',
    }
    router.post('/expenses', { expense: data }, {
      onSuccess: () => {
        form.reset()
        setShowForm(false)
      },
    })
  }

  function handleDelete(id: number) {
    router.delete(`/expenses/${id}`, {
      onSuccess: () => setDeleteId(null),
    })
  }

  function handleStopRecurring(id: number) {
    router.patch(`/expenses/${id}/stop_recurring`)
  }

  function handleResumeRecurring(id: number) {
    router.patch(`/expenses/${id}/resume_recurring`)
  }

  const filteredExpenses = expenses.filter((e) => {
    if (filter === 'one_time') return !e.recurring && !e.recurring_parent_id
    if (filter === 'recurring') return e.recurring || !!e.recurring_parent_id
    return true
  })

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Expenses</h1>
            <p className="text-sm text-gray-500 mt-1">{expenses.length} total expenses</p>
          </div>
          <div className="flex items-center gap-3">
            {expenses.length > 0 && (
              can_export_csv ? (
                <a
                  href="/expenses/export_csv"
                  className="inline-flex items-center gap-2 px-4 py-2.5 border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm font-medium rounded-lg transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                  </svg>
                  Export CSV
                </a>
              ) : (
                <button
                  disabled
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-gray-100 text-gray-400 text-sm font-medium rounded-lg cursor-not-allowed"
                  title="CSV export requires the Pro plan"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                  </svg>
                  Pro Feature
                </button>
              )
            )}
            <button
              onClick={() => setShowForm(!showForm)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Expense
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-xs text-gray-500 mb-1">Total All Time</p>
            <p className="text-2xl font-bold font-mono text-gray-900">
              ${stats.total_all_time.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-xs text-gray-500 mb-1">This Month</p>
            <p className="text-2xl font-bold font-mono text-red-600">
              ${stats.total_this_month.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-xs text-gray-500 mb-1">Transactions This Month</p>
            <p className="text-2xl font-bold font-mono text-gray-900">{stats.count_this_month}</p>
          </div>
        </div>

        {/* Recurring Summary */}
        {stats.recurring_monthly > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
              <span className="text-amber-600 text-sm">↻</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-amber-900">
                Recurring expenses: ${stats.recurring_monthly.toLocaleString('en-US', { minimumFractionDigits: 2 })}/month
              </p>
              <p className="text-xs text-amber-700">Fixed cost burn rate from all active recurring expenses</p>
            </div>
          </div>
        )}

        {/* Quick Add Form */}
        {showForm && (
          <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Add Expense</h3>
            <form onSubmit={handleSubmit}>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  placeholder="Description"
                  value={form.data.description}
                  onChange={(e) => form.setData('description', e.target.value)}
                  className="flex-1 text-sm px-3 py-2 border border-gray-200 rounded-lg bg-white text-gray-900 placeholder-gray-400"
                  required
                />
                <input
                  type="number"
                  placeholder="Amount"
                  step="0.01"
                  min="0.01"
                  value={form.data.amount}
                  onChange={(e) => form.setData('amount', e.target.value)}
                  className="w-full sm:w-32 text-sm px-3 py-2 border border-gray-200 rounded-lg bg-white text-gray-900 placeholder-gray-400 font-mono"
                  required
                />
                <input
                  type="date"
                  value={form.data.date}
                  onChange={(e) => form.setData('date', e.target.value)}
                  className="w-full sm:w-40 text-sm px-3 py-2 border border-gray-200 rounded-lg bg-white text-gray-600"
                  required
                />
                <select
                  value={form.data.category}
                  onChange={(e) => form.setData('category', e.target.value)}
                  className="w-full sm:w-36 text-sm px-3 py-2 border border-gray-200 rounded-lg bg-white text-gray-600"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {CATEGORY_BADGES[c]?.label || c}
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  disabled={form.processing}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 shrink-0"
                >
                  {form.processing ? 'Saving...' : 'Save'}
                </button>
              </div>

              {/* Recurring toggle */}
              <div className="mt-3 flex items-center gap-4">
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={form.data.recurring}
                    onClick={() => form.setData('recurring', !form.data.recurring)}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                      form.data.recurring ? 'bg-emerald-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                        form.data.recurring ? 'translate-x-4' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                  <span className="text-sm text-gray-600">Repeat this expense</span>
                </label>

                {form.data.recurring && (
                  <select
                    value={form.data.frequency}
                    onChange={(e) => form.setData('frequency', e.target.value)}
                    className="text-sm px-3 py-1.5 border border-gray-200 rounded-lg bg-white text-gray-600"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="annually">Annually</option>
                  </select>
                )}
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
        {expenses.length > 0 && (
          <div className="flex items-center gap-2 mb-4">
            {(['all', 'one_time', 'recurring'] as FilterType[]).map((f) => {
              const labels: Record<FilterType, string> = { all: 'All', one_time: 'One-time', recurring: 'Recurring' }
              return (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                    filter === f
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {labels[f]}
                </button>
              )
            })}
          </div>
        )}

        {/* Expenses List */}
        {expenses.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 14.25l6-6m4.5-3.493V21.75l-3.75-1.5-3.75 1.5-3.75-1.5-3.75 1.5V4.757c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0c1.1.128 1.907 1.077 1.907 2.185Z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">No expenses yet</h3>
            <p className="text-sm text-gray-500 mb-6">Track your business expenses for tax reporting and profit calculations.</p>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              Add First Expense
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Description</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Date</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Category</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-500">Amount</th>
                    <th className="w-24 py-3 px-4"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredExpenses.map((expense) => {
                    const badge = CATEGORY_BADGES[expense.category] || CATEGORY_BADGES.other
                    const isAutoGenerated = !!expense.recurring_parent_id
                    return (
                      <tr
                        key={expense.id}
                        className={`border-b border-gray-50 hover:bg-gray-50/50 ${isAutoGenerated ? 'opacity-75' : ''}`}
                      >
                        <td className="py-2.5 px-4">
                          <div className="flex items-center gap-2">
                            <span className={`font-medium ${isAutoGenerated ? 'text-gray-500' : 'text-gray-900'}`}>
                              {expense.recurring && <span className="text-gray-400 mr-1" title="Recurring">↻</span>}
                              {expense.description}
                            </span>
                          </div>
                          {expense.recurring && expense.active && expense.frequency && (
                            <span className="text-[10px] text-emerald-600 font-medium">
                              Recurring · {FREQUENCY_LABELS[expense.frequency] || expense.frequency}
                            </span>
                          )}
                          {expense.recurring && !expense.active && (
                            <span className="text-[10px] text-gray-400 font-medium">Recurring · Stopped</span>
                          )}
                          {isAutoGenerated && expense.parent_description && (
                            <p className="text-[10px] text-gray-400">Auto-logged from {expense.parent_description}</p>
                          )}
                        </td>
                        <td className="py-2.5 px-4 text-gray-600">{expense.date}</td>
                        <td className="py-2.5 px-4">
                          <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full ${badge.bg} ${badge.text}`}>
                            {badge.label}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-right font-mono font-semibold text-gray-900">
                          ${expense.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-2.5 px-4">
                          <div className="flex items-center gap-1 justify-end">
                            {/* Stop/Resume for recurring expenses */}
                            {expense.recurring && expense.active && (
                              <button
                                onClick={() => handleStopRecurring(expense.id)}
                                className="text-[10px] font-medium text-amber-600 hover:text-amber-700 px-1.5 py-0.5 rounded bg-amber-50"
                              >
                                Stop
                              </button>
                            )}
                            {expense.recurring && !expense.active && (
                              <button
                                onClick={() => handleResumeRecurring(expense.id)}
                                className="text-[10px] font-medium text-emerald-600 hover:text-emerald-700 px-1.5 py-0.5 rounded bg-emerald-50"
                              >
                                Resume
                              </button>
                            )}

                            {/* Delete */}
                            {deleteId === expense.id ? (
                              <>
                                <button
                                  onClick={() => handleDelete(expense.id)}
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
                                onClick={() => setDeleteId(expense.id)}
                                className="text-gray-300 hover:text-red-500 transition-colors"
                                title="Delete expense"
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
