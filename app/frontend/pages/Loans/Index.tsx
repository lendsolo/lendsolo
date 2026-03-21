import { useState, useMemo } from 'react'
import { Link, router } from '@inertiajs/react'
import AppLayout from '@/layouts/AppLayout'
import type { LoanProps } from '@/types/loan'

type StatusFilter = 'all' | 'active' | 'paid_off' | 'defaulted'
type SortBy = 'created_at' | 'principal' | 'annual_rate'

interface Props {
  loans: LoanProps[]
}

const STATUS_BADGES: Record<string, { label: string; bg: string; text: string }> = {
  active: { label: 'Active', bg: 'bg-emerald-50', text: 'text-emerald-700' },
  paid_off: { label: 'Paid Off', bg: 'bg-gray-100', text: 'text-gray-600' },
  defaulted: { label: 'Defaulted', bg: 'bg-red-50', text: 'text-red-700' },
  written_off: { label: 'Written Off', bg: 'bg-amber-50', text: 'text-amber-700' },
}

const LOAN_TYPE_LABELS: Record<string, string> = {
  standard: 'Standard',
  interest_only: 'Interest Only',
  balloon: 'Balloon',
}

export default function LoansIndex({ loans }: Props) {
  const [filter, setFilter] = useState<StatusFilter>('all')
  const [sortBy, setSortBy] = useState<SortBy>('created_at')

  const filtered = useMemo(() => {
    let result = filter === 'all' ? loans : loans.filter((l) => l.status === filter)

    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case 'principal':
          return b.principal - a.principal
        case 'annual_rate':
          return b.annual_rate - a.annual_rate
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      }
    })

    return result
  }, [loans, filter, sortBy])

  const counts = useMemo(() => ({
    all: loans.length,
    active: loans.filter((l) => l.status === 'active').length,
    paid_off: loans.filter((l) => l.status === 'paid_off').length,
    defaulted: loans.filter((l) => l.status === 'defaulted').length,
  }), [loans])

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Loans</h1>
            <p className="text-sm text-gray-500 mt-1">{loans.length} total loans</p>
          </div>
          <Link
            href="/loans/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Loan
          </Link>
        </div>

        {/* Filters + Sort */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
          <div className="flex gap-2 flex-wrap">
            {(['all', 'active', 'paid_off', 'defaulted'] as StatusFilter[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                  filter === f
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {f === 'all' ? 'All' : f === 'paid_off' ? 'Paid Off' : f.charAt(0).toUpperCase() + f.slice(1)}
                <span className="ml-1 text-[10px] opacity-60">{counts[f]}</span>
              </button>
            ))}
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortBy)}
            className="text-xs px-3 py-1.5 border border-gray-200 rounded-lg bg-white text-gray-600"
          >
            <option value="created_at">Sort: Date Created</option>
            <option value="principal">Sort: Principal</option>
            <option value="annual_rate">Sort: Rate</option>
          </select>
        </div>

        {/* Loan Cards or Empty State */}
        {filtered.length === 0 ? (
          <EmptyState hasLoans={loans.length > 0} />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((loan) => (
              <LoanCard key={loan.id} loan={loan} />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  )
}

function LoanCard({ loan }: { loan: LoanProps }) {
  const badge = STATUS_BADGES[loan.status] || STATUS_BADGES.active

  return (
    <div
      onClick={() => router.visit(`/loans/${loan.id}`)}
      className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:border-gray-300 transition-all cursor-pointer group"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-gray-900 truncate group-hover:text-emerald-700 transition-colors">
            {loan.borrower_name}
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">{LOAN_TYPE_LABELS[loan.loan_type]}</p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {loan.overdue && (
            <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-red-50 text-red-700">
              Overdue
            </span>
          )}
          <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full ${badge.bg} ${badge.text}`}>
            {badge.label}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs mb-4">
        <div>
          <span className="text-gray-400">Principal</span>
          <p className="font-semibold text-gray-900 font-mono">${loan.principal.toLocaleString()}</p>
        </div>
        <div>
          <span className="text-gray-400">Rate</span>
          <p className="font-semibold text-gray-900">{loan.annual_rate}%</p>
        </div>
        <div>
          <span className="text-gray-400">Term</span>
          <p className="font-semibold text-gray-900">{loan.term_months} mo</p>
        </div>
        <div>
          <span className="text-gray-400">Monthly</span>
          <p className="font-semibold text-gray-900 font-mono">
            ${loan.monthly_payment.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div>
        <div className="flex justify-between text-[10px] text-gray-400 mb-1">
          <span>Repayment</span>
          <span>{loan.repayment_percentage}%</span>
        </div>
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all duration-500"
            style={{ width: `${loan.repayment_percentage}%` }}
          />
        </div>
      </div>
    </div>
  )
}

function EmptyState({ hasLoans }: { hasLoans: boolean }) {
  return (
    <div className="text-center py-16">
      <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-100 flex items-center justify-center">
        <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-1">
        {hasLoans ? 'No loans match this filter' : 'Create your first loan'}
      </h3>
      <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
        {hasLoans
          ? 'Try changing the filter or creating a new loan.'
          : "Track your private loans, generate amortization schedules, and manage payments — all in one place."}
      </p>
      {!hasLoans && (
        <Link
          href="/loans/new"
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create Loan
        </Link>
      )}
    </div>
  )
}
