import { Fragment, useState, useMemo, useEffect } from 'react'
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react'
import { router } from '@inertiajs/react'
import type { LoanProps } from '@/types/loan'

interface LoanOption {
  id: number
  borrower_name: string
}

interface Props {
  open: boolean
  onClose: () => void
  /** Full loan data when opened from a loan detail page */
  loan?: LoanProps
  /** Minimal loan list for the dropdown when opened from payments page */
  loans?: LoanOption[]
  /** All user loans with full data, for computing expected payment */
  loansData?: LoanProps[]
}

export default function RecordPaymentModal({ open, onClose, loan, loans, loansData }: Props) {
  const [selectedLoanId, setSelectedLoanId] = useState<number | ''>(loan?.id ?? '')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [note, setNote] = useState('')
  const [lateFee, setLateFee] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Resolve the active loan
  const activeLoan = useMemo(() => {
    if (loan) return loan
    if (loansData && selectedLoanId) return loansData.find((l) => l.id === selectedLoanId) ?? null
    return null
  }, [loan, loansData, selectedLoanId])

  const expected = activeLoan?.expected_next_payment ?? null

  // Pre-fill amount when loan changes
  useEffect(() => {
    if (expected) {
      setAmount(String(expected.amount))
    }
  }, [expected])

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setSelectedLoanId(loan?.id ?? '')
      setDate(new Date().toISOString().split('T')[0])
      setNote('')
      setLateFee('')
      setSubmitting(false)
      if (expected) setAmount(String(expected.amount))
      else setAmount('')
    }
  }, [open, loan?.id])

  // Live P/I split calculation
  const liveSplit = useMemo(() => {
    const amt = parseFloat(amount) || 0
    if (!expected || amt <= 0) return null

    const expInterest = expected.interest
    const expPrincipal = expected.principal

    let interest: number, principal: number

    if (amt >= expInterest + expPrincipal) {
      interest = expInterest
      principal = Math.round((amt - expInterest) * 100) / 100
    } else if (amt <= expInterest) {
      interest = amt
      principal = 0
    } else {
      interest = expInterest
      principal = Math.round((amt - expInterest) * 100) / 100
    }

    return { interest, principal }
  }, [amount, expected])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const loanId = loan?.id ?? selectedLoanId
    if (!loanId) return

    setSubmitting(true)
    router.post(`/loans/${loanId}/payments`, {
      payment: {
        amount: parseFloat(amount),
        date,
        note: note || null,
        late_fee: parseFloat(lateFee) || 0,
      },
    }, {
      onSuccess: () => {
        onClose()
        setSubmitting(false)
      },
      onError: () => {
        setSubmitting(false)
      },
      preserveScroll: true,
    })
  }

  return (
    <Transition show={open} as={Fragment}>
      <Dialog onClose={onClose} className="relative z-50">
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-200" enterFrom="opacity-0" enterTo="opacity-100"
          leave="ease-in duration-150" leaveFrom="opacity-100" leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/40" />
        </TransitionChild>

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-200" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100"
            leave="ease-in duration-150" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95"
          >
            <DialogPanel className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6">
              <DialogTitle className="text-lg font-bold text-gray-900 mb-4">Record Payment</DialogTitle>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Loan selector (only if not pre-selected) */}
                {!loan && loans && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Loan</label>
                    <select
                      value={selectedLoanId}
                      onChange={(e) => setSelectedLoanId(Number(e.target.value) || '')}
                      className="w-full py-2.5 px-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      required
                    >
                      <option value="">Select a loan...</option>
                      {loans.map((l) => (
                        <option key={l.id} value={l.id}>{l.borrower_name}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Expected payment info card */}
                {expected && (
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      Payment #{expected.payment_number} — Due {expected.due_date}
                    </p>
                    <div className="grid grid-cols-3 gap-3 text-sm">
                      <div>
                        <span className="text-gray-400 text-xs">Expected</span>
                        <p className="font-semibold text-gray-900 font-mono">
                          ${expected.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-400 text-xs">Principal</span>
                        <p className="font-semibold text-emerald-600 font-mono">
                          ${expected.principal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-400 text-xs">Interest</span>
                        <p className="font-semibold text-indigo-500 font-mono">
                          ${expected.interest.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Amount</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                    <input
                      type="number"
                      step="0.01"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full py-2.5 pl-7 pr-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                  </div>
                </div>

                {/* Live P/I split */}
                {liveSplit && (
                  <div className="flex gap-4 text-sm">
                    <div className="flex-1 bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-center">
                      <span className="text-emerald-600 text-xs font-medium">To Principal</span>
                      <p className="font-bold text-emerald-700 font-mono mt-0.5">
                        ${liveSplit.principal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div className="flex-1 bg-indigo-50 border border-indigo-200 rounded-lg p-3 text-center">
                      <span className="text-indigo-600 text-xs font-medium">To Interest</span>
                      <p className="font-bold text-indigo-700 font-mono mt-0.5">
                        ${liveSplit.interest.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                )}

                {/* Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full py-2.5 px-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>

                {/* Late Fee (optional) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Late Fee (optional)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                    <input
                      type="number"
                      step="0.01"
                      value={lateFee}
                      onChange={(e) => setLateFee(e.target.value)}
                      placeholder="0.00"
                      className="w-full py-2.5 pl-7 pr-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {/* Note */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Note (optional)</label>
                  <input
                    type="text"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="e.g. Check #1234, Venmo payment"
                    className="w-full py-2.5 px-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-3 justify-end pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2.5 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || !amount || (!loan && !selectedLoanId)}
                    className="px-6 py-2.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {submitting ? 'Recording...' : 'Record Payment'}
                  </button>
                </div>
              </form>
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  )
}
