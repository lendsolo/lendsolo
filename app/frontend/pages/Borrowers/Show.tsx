import { Link, router } from '@inertiajs/react'
import AppLayout from '@/layouts/AppLayout'
import type { BorrowerDetail } from '@/types/borrower'
import type { LoanProps } from '@/types/loan'

interface Props {
  borrower: BorrowerDetail
  loans: LoanProps[]
}

const STATUS_BADGES: Record<string, { label: string; bg: string; text: string }> = {
  active: { label: 'Active', bg: 'bg-emerald-50', text: 'text-emerald-700' },
  paid_off: { label: 'Paid Off', bg: 'bg-gray-100', text: 'text-gray-600' },
  defaulted: { label: 'Defaulted', bg: 'bg-red-50', text: 'text-red-700' },
  written_off: { label: 'Written Off', bg: 'bg-amber-50', text: 'text-amber-700' },
}

export default function BorrowerShow({ borrower, loans }: Props) {
  const totalPrincipal = loans.reduce((sum, l) => sum + l.principal, 0)
  const totalInterest = loans.reduce((sum, l) => sum + l.interest_earned, 0)
  const totalPaid = loans.reduce((sum, l) => sum + l.total_paid, 0)

  function handleArchive() {
    if (confirm(`Archive ${borrower.name}? They will be hidden from the borrower list but their loans will remain.`)) {
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
          <Link href="/borrowers" className="hover:text-gray-600">Borrowers</Link>
          <span>/</span>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">{borrower.name}</h1>
              {borrower.archived && (
                <span className="px-2 py-0.5 text-xs font-medium rounded bg-gray-100 text-gray-500">
                  Archived
                </span>
              )}
            </div>
            {borrower.email && <p className="text-sm text-gray-500 mt-1">{borrower.email}</p>}
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

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left: Contact Info */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Contact Info</h3>
              <div className="space-y-2 text-sm">
                <InfoRow label="Phone" value={borrower.phone} />
                <InfoRow label="Email" value={borrower.email} />
                {(borrower.address_line1 || borrower.city) && (
                  <div>
                    <span className="text-gray-400 text-xs">Address</span>
                    <p className="text-gray-900">
                      {borrower.address_line1}
                      {borrower.address_line2 && <><br />{borrower.address_line2}</>}
                      {(borrower.city || borrower.state || borrower.zip) && (
                        <><br />{[borrower.city, borrower.state].filter(Boolean).join(', ')} {borrower.zip}</>
                      )}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {borrower.notes && (
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Notes</h3>
                <p className="text-sm text-gray-600 whitespace-pre-wrap">{borrower.notes}</p>
              </div>
            )}

            {/* Stats */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Loans</span>
                  <span className="font-semibold font-mono text-gray-900">{loans.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Principal</span>
                  <span className="font-semibold font-mono text-gray-900">
                    ${totalPrincipal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Interest Earned</span>
                  <span className="font-semibold font-mono text-indigo-600">
                    ${totalInterest.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Paid</span>
                  <span className="font-semibold font-mono text-emerald-600">
                    ${totalPaid.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Loans */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-900">Loans</h3>
                <Link
                  href="/loans/new"
                  className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                >
                  New Loan
                </Link>
              </div>

              {loans.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">No loans for this borrower yet.</p>
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
                              ${loan.principal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </span>
                            <span className="text-xs text-gray-400">@ {loan.annual_rate}%</span>
                          </div>
                          <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full ${badge.bg} ${badge.text}`}>
                            {badge.label}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-400">
                          <span>{loan.term_months} months &middot; Started {loan.start_date}</span>
                          <span className="font-mono">{loan.repayment_percentage}% repaid</span>
                        </div>
                        <div className="h-1 bg-gray-100 rounded-full mt-2 overflow-hidden">
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
          </div>
        </div>
      </div>
    </AppLayout>
  )
}

function InfoRow({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <span className="text-gray-400 text-xs">{label}</span>
      <p className="text-gray-900">{value || '—'}</p>
    </div>
  )
}
