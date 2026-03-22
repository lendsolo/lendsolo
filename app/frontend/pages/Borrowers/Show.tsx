import { useState, useMemo } from 'react'
import { Link, router } from '@inertiajs/react'
import AppLayout from '@/layouts/AppLayout'
import type { BorrowerDetail, BorrowerPayment, BorrowerStats } from '@/types/borrower'
import type { LoanProps } from '@/types/loan'

interface Props {
  borrower: BorrowerDetail
  loans: LoanProps[]
  payments: BorrowerPayment[]
  stats: BorrowerStats
}

const STATUS_BADGES: Record<string, { label: string; bg: string; text: string }> = {
  active: { label: 'Active', bg: 'bg-emerald-50', text: 'text-emerald-700' },
  paid_off: { label: 'Paid Off', bg: 'bg-gray-100', text: 'text-gray-600' },
  defaulted: { label: 'Defaulted', bg: 'bg-red-50', text: 'text-red-700' },
  written_off: { label: 'Written Off', bg: 'bg-amber-50', text: 'text-amber-700' },
}

const PAYMENTS_PER_PAGE = 25

export default function BorrowerShow({ borrower, loans, payments, stats }: Props) {
  const [paymentPage, setPaymentPage] = useState(1)
  const [paymentSort, setPaymentSort] = useState<'desc' | 'asc'>('desc')

  const sortedPayments = useMemo(() => {
    const sorted = [...payments].sort((a, b) => {
      return paymentSort === 'desc'
        ? b.date.localeCompare(a.date)
        : a.date.localeCompare(b.date)
    })
    return sorted
  }, [payments, paymentSort])

  const pagedPayments = useMemo(() => {
    return sortedPayments.slice(0, paymentPage * PAYMENTS_PER_PAGE)
  }, [sortedPayments, paymentPage])

  const hasMorePayments = pagedPayments.length < sortedPayments.length

  function handleArchive() {
    if (
      confirm(
        `Archive ${borrower.name}? They will be hidden from the borrower list but their loans will remain.`
      )
    ) {
      router.patch(`/borrowers/${borrower.id}/archive`)
    }
  }

  function handleUnarchive() {
    router.patch(`/borrowers/${borrower.id}/unarchive`)
  }

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-1 text-sm text-gray-400">
          <Link href="/borrowers" className="hover:text-gray-600 transition-colors">
            Borrowers
          </Link>
          <span>/</span>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">{borrower.name}</h1>
              {borrower.archived && (
                <span className="px-2 py-0.5 text-xs font-medium rounded bg-gray-100 text-gray-500">
                  Archived
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 mt-1">
              {borrower.email && (
                <span className="text-sm text-gray-500">{borrower.email}</span>
              )}
              {borrower.phone && (
                <span className="text-sm text-gray-400">{borrower.phone}</span>
              )}
              {!borrower.email && !borrower.phone && (
                <span className="text-sm text-gray-400">No contact info</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={`/borrowers/${borrower.id}/edit`}
              className="px-4 py-2 border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm font-medium rounded-lg transition-colors"
            >
              Edit
            </Link>
            {borrower.archived ? (
              <button
                onClick={handleUnarchive}
                className="px-4 py-2 border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm font-medium rounded-lg transition-colors"
              >
                Restore
              </button>
            ) : (
              <button
                onClick={handleArchive}
                className="px-4 py-2 border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm font-medium rounded-lg transition-colors"
              >
                Archive
              </button>
            )}
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard label="Active Loans" value={stats.active_loans.toString()} color="text-emerald-600" icon={<BanknotesIcon />} />
          <StatCard
            label="Total Principal"
            value={`$${stats.total_principal.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
            color="text-gray-900"
            icon={<ArrowTrendingUpIcon />}
          />
          <StatCard
            label="Interest Earned"
            value={`$${stats.interest_earned.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
            color="text-indigo-600"
            icon={<SparklesIcon />}
          />
          <StatCard
            label="Average Rate"
            value={`${stats.avg_rate}%`}
            color="text-amber-600"
            icon={<ChartBarIcon />}
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column: Contact + Notes */}
          <div className="space-y-4">
            {/* Contact Info */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Contact Info</h3>
              <div className="space-y-2 text-sm">
                <InfoRow label="Phone" value={borrower.phone} placeholder="Not provided" />
                <InfoRow label="Email" value={borrower.email} placeholder="Not provided" />
                <div>
                  <span className="text-gray-400 text-xs">Address</span>
                  {borrower.address_line1 || borrower.city ? (
                    <p className="text-gray-900">
                      {borrower.address_line1}
                      {borrower.address_line2 && (
                        <>
                          <br />
                          {borrower.address_line2}
                        </>
                      )}
                      {(borrower.city || borrower.state || borrower.zip) && (
                        <>
                          <br />
                          {[borrower.city, borrower.state].filter(Boolean).join(', ')}{' '}
                          {borrower.zip}
                        </>
                      )}
                    </p>
                  ) : (
                    <p className="text-gray-300">Not provided</p>
                  )}
                </div>
              </div>
            </div>

            {/* Notes — inline editable */}
            <NotesCard borrowerId={borrower.id} initialNotes={borrower.notes} />
          </div>

          {/* Right Column: Loans + Payments */}
          <div className="lg:col-span-2 space-y-6">
            {/* Loans Section */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-900">Loans</h3>
                <Link
                  href={`/loans/new?borrower_id=${borrower.id}`}
                  className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                >
                  + New Loan for {borrower.name}
                </Link>
              </div>

              {loans.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-gray-400 mb-4">
                    No loans for this borrower yet.
                  </p>
                  <Link
                    href={`/loans/new?borrower_id=${borrower.id}`}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors"
                  >
                    Create a loan for {borrower.name}
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {loans.map((loan) => {
                    const badge = STATUS_BADGES[loan.status] || STATUS_BADGES.active
                    return (
                      <Link
                        key={loan.id}
                        href={`/loans/${loan.id}`}
                        className="block p-4 rounded-lg border border-gray-100 hover:border-gray-200 hover:bg-gray-50/50 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-gray-900">
                              ${loan.principal.toLocaleString('en-US', {
                                minimumFractionDigits: 2,
                              })}
                            </span>
                            <span className="text-xs text-gray-400">@ {loan.annual_rate}%</span>
                          </div>
                          <span
                            className={`px-2 py-0.5 text-[10px] font-medium rounded-full ${badge.bg} ${badge.text}`}
                          >
                            {badge.label}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
                          <span>
                            {loan.term_months} months &middot; Started {loan.start_date}
                          </span>
                          <span className="font-mono">
                            Balance: $
                            {loan.remaining_balance.toLocaleString('en-US', {
                              minimumFractionDigits: 2,
                            })}
                          </span>
                        </div>
                        <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full"
                            style={{ width: `${loan.repayment_percentage}%` }}
                          />
                        </div>
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Payment History Section */}
            {payments.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="flex items-center justify-between px-5 pt-5 pb-3">
                  <h3 className="text-sm font-semibold text-gray-900">
                    Payment History
                    <span className="text-gray-400 font-normal ml-1.5">
                      ({payments.length})
                    </span>
                  </h3>
                  <button
                    onClick={() => setPaymentSort(paymentSort === 'desc' ? 'asc' : 'desc')}
                    className="text-xs text-gray-500 hover:text-gray-700 font-medium transition-colors"
                  >
                    {paymentSort === 'desc' ? 'Newest first' : 'Oldest first'}
                    <svg className="w-3 h-3 inline ml-1" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d={paymentSort === 'desc' ? 'M19.5 8.25l-7.5 7.5-7.5-7.5' : 'M4.5 15.75l7.5-7.5 7.5 7.5'} />
                    </svg>
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left py-2.5 px-5 font-medium text-gray-500">Date</th>
                        <th className="text-left py-2.5 px-4 font-medium text-gray-500">Loan</th>
                        <th className="text-right py-2.5 px-4 font-medium text-gray-500">Amount</th>
                        <th className="text-right py-2.5 px-4 font-medium text-gray-500 hidden sm:table-cell">
                          Principal
                        </th>
                        <th className="text-right py-2.5 px-4 font-medium text-gray-500 hidden sm:table-cell">
                          Interest
                        </th>
                        <th className="text-left py-2.5 px-4 font-medium text-gray-500 hidden md:table-cell">
                          Note
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {pagedPayments.map((p) => (
                        <tr
                          key={p.id}
                          className="border-b border-gray-50 hover:bg-gray-50/50"
                        >
                          <td className="py-2 px-5 text-gray-600 text-xs">{p.date}</td>
                          <td className="py-2 px-4">
                            <Link
                              href={`/loans/${p.loan_id}`}
                              className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                            >
                              {p.loan_label}
                            </Link>
                          </td>
                          <td className="py-2 px-4 text-right font-mono font-semibold text-gray-900">
                            ${p.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-2 px-4 text-right font-mono text-emerald-600 hidden sm:table-cell">
                            ${p.principal_portion.toLocaleString('en-US', {
                              minimumFractionDigits: 2,
                            })}
                          </td>
                          <td className="py-2 px-4 text-right font-mono text-indigo-500 hidden sm:table-cell">
                            ${p.interest_portion.toLocaleString('en-US', {
                              minimumFractionDigits: 2,
                            })}
                          </td>
                          <td className="py-2 px-4 text-gray-400 text-xs max-w-[180px] truncate hidden md:table-cell">
                            {p.note || '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {hasMorePayments && (
                  <div className="px-5 py-3 border-t border-gray-100 text-center">
                    <button
                      onClick={() => setPaymentPage(paymentPage + 1)}
                      className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                    >
                      Load more payments ({sortedPayments.length - pagedPayments.length} remaining)
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}

// --- Sub-components ---

function NotesCard({
  borrowerId,
  initialNotes,
}: {
  borrowerId: number
  initialNotes: string | null
}) {
  const [editing, setEditing] = useState(false)
  const [notes, setNotes] = useState(initialNotes || '')
  const [saved, setSaved] = useState(initialNotes || '')
  const [saving, setSaving] = useState(false)

  function handleSave() {
    if (notes === saved) {
      setEditing(false)
      return
    }
    setSaving(true)
    fetch(`/borrowers/${borrowerId}/update_notes`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token':
          document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        Accept: 'application/json',
      },
      body: JSON.stringify({ notes }),
    })
      .then((res) => res.json())
      .then((data) => {
        setSaved(data.notes || '')
        setNotes(data.notes || '')
        setEditing(false)
      })
      .catch(() => {
        // revert on error
        setNotes(saved)
        setEditing(false)
      })
      .finally(() => setSaving(false))
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-gray-900">Notes</h3>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
          >
            Edit
          </button>
        )}
      </div>
      {editing ? (
        <div>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                handleSave()
              }
              if (e.key === 'Escape') {
                setNotes(saved)
                setEditing(false)
              }
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none"
            placeholder="Add private notes about this borrower..."
          />
          <div className="flex items-center justify-between mt-2">
            <span className="text-[10px] text-gray-400">
              Cmd+Enter to save &middot; Esc to cancel
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setNotes(saved)
                  setEditing(false)
                }}
                className="px-3 py-1 text-xs text-gray-500 hover:text-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-3 py-1 bg-emerald-600 text-white text-xs font-medium rounded hover:bg-emerald-700 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      ) : saved ? (
        <p
          className="text-sm text-gray-600 whitespace-pre-wrap cursor-pointer hover:bg-gray-50 rounded p-1 -m-1 transition-colors"
          onClick={() => setEditing(true)}
        >
          {saved}
        </p>
      ) : (
        <p
          className="text-sm text-gray-300 cursor-pointer hover:text-gray-400 transition-colors"
          onClick={() => setEditing(true)}
        >
          Click to add notes...
        </p>
      )}
    </div>
  )
}

function InfoRow({
  label,
  value,
  placeholder = '—',
}: {
  label: string
  value: string | null
  placeholder?: string
}) {
  return (
    <div>
      <span className="text-gray-400 text-xs">{label}</span>
      <p className={value ? 'text-gray-900' : 'text-gray-300'}>{value || placeholder}</p>
    </div>
  )
}

function StatCard({
  label,
  value,
  color,
  icon,
}: {
  label: string
  value: string
  color: string
  icon: React.ReactNode
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs text-gray-500">{label}</p>
        <div className="text-gray-400">{icon}</div>
      </div>
      <p className={`text-2xl font-bold font-mono ${color}`}>{value}</p>
    </div>
  )
}

// Icons
function BanknotesIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    </svg>
  )
}

function ArrowTrendingUpIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941" />
    </svg>
  )
}

function SparklesIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
    </svg>
  )
}

function ChartBarIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
    </svg>
  )
}
