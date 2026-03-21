import { useState, useMemo } from 'react'
import { Link, router } from '@inertiajs/react'
import AppLayout from '@/layouts/AppLayout'
import RecordPaymentModal from '@/components/RecordPaymentModal'
import type { LoanProps, PaymentRecord } from '@/types/loan'
import { calculateAmortization, type LoanType } from '@/lib/calculations'

interface Props {
  loan: LoanProps
  total_capital: number
}

const STATUS_BADGES: Record<string, { label: string; bg: string; text: string }> = {
  active: { label: 'Active', bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700' },
  paid_off: { label: 'Paid Off', bg: 'bg-gray-100 border-gray-200', text: 'text-gray-600' },
  defaulted: { label: 'Defaulted', bg: 'bg-red-50 border-red-200', text: 'text-red-700' },
  written_off: { label: 'Written Off', bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700' },
}

const LOAN_TYPE_LABELS: Record<string, string> = {
  standard: 'Standard',
  interest_only: 'Interest Only',
  balloon: 'Balloon',
}

export default function LoansShow({ loan, total_capital }: Props) {
  const [actionsOpen, setActionsOpen] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [paymentModalOpen, setPaymentModalOpen] = useState(false)

  const badge = STATUS_BADGES[loan.status] || STATUS_BADGES.active

  const schedule = useMemo(
    () =>
      calculateAmortization(
        loan.principal,
        loan.annual_rate,
        loan.term_months,
        new Date(loan.start_date),
        loan.loan_type as LoanType,
      ).schedule,
    [loan],
  )

  const guardrails = useMemo(() => {
    const alerts: { type: 'red' | 'amber' | 'blue'; message: string }[] = []

    if (loan.overdue && loan.days_overdue > 0) {
      const expectedAmt = loan.expected_next_payment?.amount
      alerts.push({
        type: 'red',
        message: `Payment is ${loan.days_overdue} days overdue${expectedAmt ? ` — $${expectedAmt.toLocaleString('en-US', { minimumFractionDigits: 2 })} expected` : ''}.`,
      })
    } else if (loan.status === 'active' && loan.payments_made_count === 0 && loan.days_since_start >= 30) {
      alerts.push({ type: 'red', message: 'No payments recorded — is this loan current?' })
    }
    if (loan.capital_percentage > 50) {
      alerts.push({ type: 'amber', message: `This loan represents ${loan.capital_percentage}% of your total capital.` })
    }
    if (!loan.collateral_description || loan.collateral_description.trim() === '') {
      alerts.push({ type: 'blue', message: 'Consider documenting collateral for this loan.' })
    }

    return alerts
  }, [loan])

  function handleDelete() {
    router.delete(`/loans/${loan.id}`, { preserveScroll: true })
  }

  function handleMarkPaidOff() {
    router.patch(`/loans/${loan.id}/mark_paid_off`, {}, { preserveScroll: true })
  }

  function handleMarkDefaulted() {
    router.patch(`/loans/${loan.id}/mark_defaulted`, {}, { preserveScroll: true })
  }

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto">
        {/* Guardrail Alerts */}
        {guardrails.map((alert, i) => (
          <AlertBanner key={i} type={alert.type} message={alert.message} />
        ))}

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Link href="/loans" className="text-sm text-gray-400 hover:text-gray-600">
                Loans
              </Link>
              <span className="text-gray-300">/</span>
            </div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">{loan.borrower_name}</h1>
              <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full border ${badge.bg} ${badge.text}`}>
                {badge.label}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {LOAN_TYPE_LABELS[loan.loan_type]} &middot; Started {loan.start_date}
              {loan.purpose && <> &middot; {loan.purpose}</>}
            </p>
          </div>

          <div className="relative flex items-center gap-2">
            <Link
              href={`/loans/${loan.id}/edit`}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Edit Loan
            </Link>

            <div className="relative">
              <button
                onClick={() => setActionsOpen(!actionsOpen)}
                className="px-3 py-2 text-sm text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" />
                </svg>
              </button>

              {actionsOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white border border-gray-200 rounded-xl shadow-lg py-1 z-50">
                  {loan.status === 'active' && (
                    <>
                      <button onClick={handleMarkPaidOff} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                        Mark as Paid Off
                      </button>
                      <button onClick={handleMarkDefaulted} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                        Mark as Defaulted
                      </button>
                      <div className="border-t border-gray-100 my-1" />
                    </>
                  )}
                  <button
                    onClick={() => { setActionsOpen(false); setDeleteConfirm(true) }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    Delete Loan
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Key Metrics Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <MetricCard label="Principal" value={`$${loan.principal.toLocaleString()}`} />
          <MetricCard label="Rate" value={`${loan.annual_rate}%`} />
          <MetricCard label="Term" value={`${loan.term_months} months`} />
          <MetricCard label="Monthly Payment" value={`$${loan.monthly_payment.toLocaleString('en-US', { minimumFractionDigits: 2 })}`} accent />
        </div>

        {/* Repayment Progress */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-700">Repayment Progress</h3>
            <span className="text-sm font-bold text-emerald-600">{loan.repayment_percentage}%</span>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-700"
              style={{ width: `${loan.repayment_percentage}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-2">
            <span>{loan.payments_made_count} of {loan.term_months} payments made</span>
            <span>${loan.remaining_balance.toLocaleString('en-US', { minimumFractionDigits: 2 })} remaining</span>
          </div>
        </div>

        {/* Two-Column Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard label="Interest Earned" value={loan.interest_earned} prefix="$" color="text-indigo-600" />
          <StatCard label="Principal Returned" value={loan.principal_returned} prefix="$" color="text-emerald-600" />
          <StatCard label="Remaining Balance" value={loan.remaining_balance} prefix="$" color="text-gray-900" />
          <StatCard label="Next Payment Due" textValue={loan.next_payment_due || 'N/A'} color={loan.overdue ? 'text-red-600' : 'text-gray-900'} />
        </div>

        {/* Amortization Schedule */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6">
          <div className="p-5 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">Amortization Schedule</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-4 font-medium text-gray-500 w-8" />
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Month</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Due Date</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500">Payment</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500">Principal</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500">Interest</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500">Balance</th>
                </tr>
              </thead>
              <tbody>
                {schedule.map((row) => {
                  const isPaid = row.month <= loan.payments_made_count
                  return (
                    <tr
                      key={row.month}
                      className={`border-b border-gray-50 ${isPaid ? 'bg-emerald-50/40' : ''}`}
                    >
                      <td className="py-2.5 px-4">
                        {isPaid && (
                          <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </td>
                      <td className={`py-2.5 px-4 ${isPaid ? 'text-emerald-700' : 'text-gray-900'}`}>{row.month}</td>
                      <td className={`py-2.5 px-4 ${isPaid ? 'text-emerald-600' : 'text-gray-600'}`}>{row.dueDate}</td>
                      <td className={`py-2.5 px-4 text-right font-mono ${isPaid ? 'text-emerald-700' : 'text-gray-900'}`}>
                        ${row.payment.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono text-emerald-600">
                        ${row.principalPortion.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono text-indigo-500">
                        ${row.interestPortion.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className={`py-2.5 px-4 text-right font-mono ${isPaid ? 'text-emerald-700' : 'text-gray-900'}`}>
                        ${row.remainingBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Payment History */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Payment History</h3>
            {loan.status === 'active' && (
              <button
                onClick={() => setPaymentModalOpen(true)}
                className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors"
              >
                Record Payment
              </button>
            )}
          </div>

          {loan.payments.length === 0 ? (
            <div className="p-8 text-center text-sm text-gray-400">
              No payments recorded yet.
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {loan.payments.map((p) => (
                <PaymentRow key={p.id} payment={p} />
              ))}
            </div>
          )}
        </div>

        {/* Collateral & Notes (collapsible) */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6">
          <button
            onClick={() => setDetailsOpen(!detailsOpen)}
            className="w-full p-5 flex items-center justify-between text-left"
          >
            <h3 className="text-lg font-semibold text-gray-900">Collateral & Notes</h3>
            <svg
              className={`w-5 h-5 text-gray-400 transition-transform ${detailsOpen ? 'rotate-180' : ''}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {detailsOpen && (
            <div className="px-5 pb-5 space-y-4 border-t border-gray-100 pt-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">Collateral</h4>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {loan.collateral_description || 'None documented'}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">Notes</h4>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {loan.notes || 'No notes'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4 shadow-xl">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Delete this loan?</h3>
              <p className="text-sm text-gray-500 mb-6">
                This will permanently delete the loan for <strong>{loan.borrower_name}</strong> and
                all associated payment records. This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setDeleteConfirm(false)}
                  className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg"
                >
                  Delete Loan
                </button>
              </div>
            </div>
          </div>
        )}

        <RecordPaymentModal
          open={paymentModalOpen}
          onClose={() => setPaymentModalOpen(false)}
          loan={loan}
        />
      </div>
    </AppLayout>
  )
}

/* ── Sub-components ── */

function AlertBanner({ type, message }: { type: 'red' | 'amber' | 'blue'; message: string }) {
  const styles = {
    red: 'bg-red-50 border-red-200 text-red-800',
    amber: 'bg-amber-50 border-amber-200 text-amber-800',
    blue: 'bg-blue-50 border-blue-200 text-blue-800',
  }
  const icons = {
    red: (
      <svg className="w-5 h-5 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
      </svg>
    ),
    amber: (
      <svg className="w-5 h-5 text-amber-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
      </svg>
    ),
    blue: (
      <svg className="w-5 h-5 text-blue-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
      </svg>
    ),
  }

  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm mb-4 ${styles[type]}`}>
      {icons[type]}
      {message}
    </div>
  )
}

function MetricCard({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className={`text-lg font-bold ${accent ? 'text-emerald-600' : 'text-gray-900'}`}>{value}</p>
    </div>
  )
}

function StatCard({ label, value, prefix = '', textValue, color }: { label: string; value?: number; prefix?: string; textValue?: string; color: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className={`text-lg font-bold font-mono ${color}`}>
        {textValue ?? `${prefix}${(value ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
      </p>
    </div>
  )
}

function PaymentRow({ payment }: { payment: PaymentRecord }) {
  return (
    <div className="flex items-center justify-between px-5 py-3">
      <div>
        <p className="text-sm font-medium text-gray-900">{payment.date}</p>
        {payment.note && <p className="text-xs text-gray-400 mt-0.5">{payment.note}</p>}
      </div>
      <div className="text-right">
        <p className="text-sm font-semibold text-gray-900 font-mono">
          ${payment.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </p>
        <p className="text-[10px] text-gray-400">
          ${payment.principal_portion.toLocaleString('en-US', { minimumFractionDigits: 2 })} P &middot;{' '}
          ${payment.interest_portion.toLocaleString('en-US', { minimumFractionDigits: 2 })} I
          {payment.late_fee > 0 && <> &middot; ${payment.late_fee.toFixed(2)} fee</>}
        </p>
      </div>
    </div>
  )
}
