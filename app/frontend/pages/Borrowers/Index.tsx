import { useState, useMemo } from 'react'
import { Link, router } from '@inertiajs/react'
import AppLayout from '@/layouts/AppLayout'
import type { BorrowerSummary } from '@/types/borrower'

interface Props {
  borrowers: BorrowerSummary[]
  show_archived: boolean
}

export default function BorrowersIndex({ borrowers, show_archived }: Props) {
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    if (!search) return borrowers
    const q = search.toLowerCase()
    return borrowers.filter((b) =>
      b.name.toLowerCase().includes(q) ||
      b.email?.toLowerCase().includes(q) ||
      b.phone?.includes(q)
    )
  }, [borrowers, search])

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Borrowers</h1>
            <p className="text-sm text-gray-500 mt-1">{borrowers.length} borrower{borrowers.length !== 1 ? 's' : ''}</p>
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

        {/* Search + Archive Toggle */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search borrowers..."
            className="flex-1 text-sm px-3 py-2 border border-gray-200 rounded-lg bg-white text-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
          <button
            onClick={() => router.visit(`/borrowers${show_archived ? '' : '?show_archived=true'}`)}
            className={`px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
              show_archived
                ? 'bg-amber-100 text-amber-800'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {show_archived ? 'Hide Archived' : 'Show Archived'}
          </button>
        </div>

        {/* Borrowers Table */}
        {filtered.length === 0 ? (
          <EmptyState hasBorrowers={borrowers.length > 0} />
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Name</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Email</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-500">Loans</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-500">Total Principal</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-500">Interest Received</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Last Payment</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((b) => (
                    <tr key={b.id} className="border-b border-gray-50 hover:bg-gray-50/50 cursor-pointer" onClick={() => router.visit(`/borrowers/${b.id}`)}>
                      <td className="py-2.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-emerald-600 hover:text-emerald-700">
                            {b.name}
                          </span>
                          {b.archived && (
                            <span className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-gray-100 text-gray-500">
                              Archived
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-2.5 px-4 text-gray-600">{b.email || '—'}</td>
                      <td className="py-2.5 px-4 text-right font-mono text-gray-900">{b.loan_count}</td>
                      <td className="py-2.5 px-4 text-right font-mono text-gray-900">
                        ${b.total_principal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono text-indigo-500">
                        ${b.total_interest_received.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-4 text-gray-400 text-xs">
                        {b.last_payment_date || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}

function EmptyState({ hasBorrowers }: { hasBorrowers: boolean }) {
  return (
    <div className="text-center py-16">
      <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-100 flex items-center justify-center">
        <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-1">
        {hasBorrowers ? 'No borrowers match your search' : 'No borrowers yet'}
      </h3>
      <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
        {hasBorrowers
          ? 'Try a different search term.'
          : 'Add a borrower to start organizing your loan contacts.'}
      </p>
      {!hasBorrowers && (
        <Link
          href="/borrowers/new"
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg transition-colors"
        >
          Add Borrower
        </Link>
      )}
    </div>
  )
}
