import { useState, useMemo } from 'react'
import { Link, router } from '@inertiajs/react'
import AppLayout from '@/layouts/AppLayout'
import type { BorrowerSummary } from '@/types/borrower'

type SortBy = 'name' | 'total_principal' | 'last_activity' | 'loan_count'

interface Props {
  borrowers: BorrowerSummary[]
  show_archived: boolean
}

const STATUS_BADGES: Record<string, { label: string; bg: string; text: string }> = {
  active: { label: 'Active', bg: 'bg-emerald-50', text: 'text-emerald-700' },
  paid_off: { label: 'Paid Off', bg: 'bg-gray-100', text: 'text-gray-600' },
  archived: { label: 'Archived', bg: 'bg-amber-50', text: 'text-amber-700' },
  none: { label: 'No Loans', bg: 'bg-gray-50', text: 'text-gray-400' },
}

export default function BorrowersIndex({ borrowers, show_archived }: Props) {
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<SortBy>('name')

  const filtered = useMemo(() => {
    let result = borrowers

    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        (b) =>
          b.name.toLowerCase().includes(q) ||
          b.email?.toLowerCase().includes(q) ||
          b.phone?.includes(q)
      )
    }

    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case 'total_principal':
          return b.total_principal - a.total_principal
        case 'loan_count':
          return b.loan_count - a.loan_count
        case 'last_activity':
          return (b.last_activity || '').localeCompare(a.last_activity || '')
        default:
          return a.name.localeCompare(b.name)
      }
    })

    return result
  }, [borrowers, search, sortBy])

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Borrowers</h1>
            <p className="text-sm text-gray-500 mt-1">Your lending relationships</p>
          </div>
          <Link
            href="/borrowers/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Borrower
          </Link>
        </div>

        {/* Search + Filters */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
          <div className="flex flex-col sm:flex-row gap-3 flex-1 w-full sm:w-auto">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, or phone..."
              className="flex-1 text-sm px-3 py-2 border border-gray-200 rounded-lg bg-white text-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
            <button
              onClick={() =>
                router.visit(`/borrowers${show_archived ? '' : '?show_archived=true'}`)
              }
              className={`px-3 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                show_archived
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {show_archived ? 'Hide Archived' : 'Show Archived'}
            </button>
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortBy)}
            className="text-xs px-3 py-2 border border-gray-200 rounded-lg bg-white text-gray-600"
          >
            <option value="name">Sort: Name</option>
            <option value="total_principal">Sort: Principal</option>
            <option value="loan_count">Sort: Loan Count</option>
            <option value="last_activity">Sort: Last Activity</option>
          </select>
        </div>

        {/* Content */}
        {filtered.length === 0 ? (
          <EmptyState hasBorrowers={borrowers.length > 0} />
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Name</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Contact</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-500">Loans</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-500">Total Principal</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-500">Interest Received</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Last Activity</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((b) => {
                      const badge = STATUS_BADGES[b.status] || STATUS_BADGES.none
                      return (
                        <tr
                          key={b.id}
                          className="border-b border-gray-50 hover:bg-gray-50/50 cursor-pointer"
                          onClick={() => router.visit(`/borrowers/${b.id}`)}
                        >
                          <td className="py-2.5 px-4">
                            <span className="text-sm font-medium text-emerald-600 hover:text-emerald-700">
                              {b.name}
                            </span>
                          </td>
                          <td className="py-2.5 px-4">
                            <div className="text-xs text-gray-500">
                              {b.email && <span>{b.email}</span>}
                              {b.email && b.phone && <span className="mx-1">&middot;</span>}
                              {b.phone && <span>{b.phone}</span>}
                              {!b.email && !b.phone && <span className="text-gray-300">—</span>}
                            </div>
                          </td>
                          <td className="py-2.5 px-4 text-right font-mono text-gray-900">
                            {b.active_loan_count > 0 ? (
                              <span>
                                {b.active_loan_count}
                                {b.loan_count > b.active_loan_count && (
                                  <span className="text-gray-400 text-xs ml-0.5">/{b.loan_count}</span>
                                )}
                              </span>
                            ) : (
                              <span className="text-gray-400">{b.loan_count}</span>
                            )}
                          </td>
                          <td className="py-2.5 px-4 text-right font-mono text-gray-900">
                            ${b.total_principal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-2.5 px-4 text-right font-mono text-indigo-500">
                            ${b.total_interest_received.toLocaleString('en-US', {
                              minimumFractionDigits: 2,
                            })}
                          </td>
                          <td className="py-2.5 px-4 text-gray-400 text-xs">
                            {b.last_activity || '—'}
                          </td>
                          <td className="py-2.5 px-4">
                            <span
                              className={`px-2 py-0.5 text-[10px] font-medium rounded-full ${badge.bg} ${badge.text}`}
                            >
                              {badge.label}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-3">
              {filtered.map((b) => {
                const badge = STATUS_BADGES[b.status] || STATUS_BADGES.none
                return (
                  <div
                    key={b.id}
                    onClick={() => router.visit(`/borrowers/${b.id}`)}
                    className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md hover:border-gray-300 transition-all cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="min-w-0">
                        <h3 className="text-sm font-semibold text-emerald-600 truncate">
                          {b.name}
                        </h3>
                        {(b.email || b.phone) && (
                          <p className="text-xs text-gray-400 mt-0.5 truncate">
                            {b.email || b.phone}
                          </p>
                        )}
                      </div>
                      <span
                        className={`px-2 py-0.5 text-[10px] font-medium rounded-full shrink-0 ${badge.bg} ${badge.text}`}
                      >
                        {badge.label}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                      <div>
                        <span className="text-gray-400">Loans</span>
                        <p className="font-semibold text-gray-900 font-mono">
                          {b.active_loan_count} active
                          {b.loan_count > b.active_loan_count && (
                            <span className="text-gray-400"> / {b.loan_count} total</span>
                          )}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-400">Principal</span>
                        <p className="font-semibold text-gray-900 font-mono">
                          ${b.total_principal.toLocaleString('en-US', { minimumFractionDigits: 0 })}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-400">Interest Earned</span>
                        <p className="font-semibold text-indigo-500 font-mono">
                          ${b.total_interest_received.toLocaleString('en-US', {
                            minimumFractionDigits: 0,
                          })}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-400">Last Activity</span>
                        <p className="font-semibold text-gray-900">{b.last_activity || '—'}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>
    </AppLayout>
  )
}

function EmptyState({ hasBorrowers }: { hasBorrowers: boolean }) {
  return (
    <div className="text-center py-16">
      <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-100 flex items-center justify-center">
        <svg
          className="w-8 h-8 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
          />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-1">
        {hasBorrowers ? 'No borrowers match your search' : 'No borrowers yet'}
      </h3>
      <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
        {hasBorrowers
          ? 'Try a different search term.'
          : "No borrowers yet. They'll appear here automatically when you create loans, or you can add them manually."}
      </p>
      {!hasBorrowers && (
        <div className="flex items-center justify-center gap-3">
          <Link
            href="/borrowers/new"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Add Borrower
          </Link>
          <Link
            href="/loans/new"
            className="px-6 py-2.5 border border-gray-200 text-sm font-medium rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Create a Loan
          </Link>
        </div>
      )}
    </div>
  )
}
