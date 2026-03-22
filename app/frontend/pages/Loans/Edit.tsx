import { useForm } from '@inertiajs/react'
import { useMemo } from 'react'
import AppLayout from '@/layouts/AppLayout'
import AnimatedNumber from '@/components/AnimatedNumber'
import BorrowerSelector from '@/components/BorrowerSelector'
import { calculateAmortization, type LoanType } from '@/lib/calculations'
import type { LoanProps } from '@/types/loan'

interface BorrowerOption {
  id: number
  name: string
}

interface Props {
  loan: LoanProps
  borrowers?: BorrowerOption[]
}

export default function EditLoan({ loan, borrowers = [] }: Props) {
  const { data, setData, patch, processing, errors } = useForm({
    borrower_id: loan.borrower_id || ('' as string | number),
    borrower_name: loan.borrower_name,
    principal: String(loan.principal),
    annual_rate: String(loan.annual_rate),
    term_months: String(loan.term_months),
    loan_type: loan.loan_type as LoanType,
    start_date: loan.start_date,
    purpose: loan.purpose || '',
    collateral_description: loan.collateral_description || '',
    notes: loan.notes || '',
  })

  const preview = useMemo(() => {
    const p = parseFloat(data.principal) || 0
    const r = parseFloat(data.annual_rate) || 0
    const t = parseInt(data.term_months) || 0
    if (p <= 0 || t <= 0) return null
    return calculateAmortization(p, r, t, new Date(data.start_date), data.loan_type)
  }, [data.principal, data.annual_rate, data.term_months, data.loan_type, data.start_date])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    patch(`/loans/${loan.id}`)
  }

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-2 mb-1 text-sm text-gray-400">
          <a href="/loans" className="hover:text-gray-600">Loans</a>
          <span>/</span>
          <a href={`/loans/${loan.id}`} className="hover:text-gray-600">{loan.borrower_name}</a>
          <span>/</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Edit Loan</h1>

        <div className="grid lg:grid-cols-[1fr_340px] gap-8">
          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
              <h2 className="text-lg font-semibold text-gray-900">Borrower & Terms</h2>

              <BorrowerSelector
                borrowers={borrowers}
                selectedId={data.borrower_id ? Number(data.borrower_id) : null}
                selectedName={data.borrower_name}
                onSelect={(id, name) => {
                  setData(prev => ({ ...prev, borrower_id: id || '', borrower_name: name }))
                }}
                error={errors.borrower_name || errors.borrower_id}
              />

              <div className="grid sm:grid-cols-2 gap-5">
                <Field label="Principal Amount" error={errors.principal} required>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                    <input
                      type="number"
                      step="0.01"
                      value={data.principal}
                      onChange={(e) => setData('principal', e.target.value)}
                      className={`${inputClass(errors.principal)} pl-7`}
                    />
                  </div>
                </Field>

                <Field label="Annual Rate" error={errors.annual_rate} required>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.25"
                      value={data.annual_rate}
                      onChange={(e) => setData('annual_rate', e.target.value)}
                      className={`${inputClass(errors.annual_rate)} pr-8`}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">%</span>
                  </div>
                </Field>

                <Field label="Term (Months)" error={errors.term_months} required>
                  <input
                    type="number"
                    value={data.term_months}
                    onChange={(e) => setData('term_months', e.target.value)}
                    className={inputClass(errors.term_months)}
                  />
                </Field>

                <Field label="Loan Type" error={errors.loan_type} required>
                  <select
                    value={data.loan_type}
                    onChange={(e) => setData('loan_type', e.target.value as LoanType)}
                    className={inputClass(errors.loan_type)}
                  >
                    <option value="standard">Standard (Fully Amortizing)</option>
                    <option value="interest_only">Interest Only</option>
                    <option value="balloon">Balloon</option>
                  </select>
                </Field>
              </div>

              <Field label="Start Date" error={errors.start_date} required>
                <input
                  type="date"
                  value={data.start_date}
                  onChange={(e) => setData('start_date', e.target.value)}
                  className={inputClass(errors.start_date)}
                />
              </Field>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
              <h2 className="text-lg font-semibold text-gray-900">Details</h2>

              <Field label="Purpose" error={errors.purpose}>
                <input
                  type="text"
                  value={data.purpose}
                  onChange={(e) => setData('purpose', e.target.value)}
                  className={inputClass(errors.purpose)}
                />
              </Field>

              <Field label="Collateral Description" error={errors.collateral_description}>
                <textarea
                  value={data.collateral_description}
                  onChange={(e) => setData('collateral_description', e.target.value)}
                  rows={3}
                  className={inputClass(errors.collateral_description)}
                />
              </Field>

              <Field label="Notes" error={errors.notes}>
                <textarea
                  value={data.notes}
                  onChange={(e) => setData('notes', e.target.value)}
                  rows={3}
                  className={inputClass(errors.notes)}
                />
              </Field>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={processing}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50"
              >
                {processing ? 'Saving...' : 'Save Changes'}
              </button>
              <a href={`/loans/${loan.id}`} className="px-6 py-2.5 text-sm text-gray-600 hover:text-gray-800">
                Cancel
              </a>
            </div>
          </form>

          {/* Live Preview */}
          <div className="lg:sticky lg:top-6 h-fit">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Live Preview</h3>
              {preview ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Monthly Payment</p>
                    <AnimatedNumber value={preview.monthlyPayment} prefix="$" className="text-2xl font-bold text-gray-900" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Total Interest</p>
                    <AnimatedNumber value={preview.totalInterest} prefix="$" className="text-lg font-bold text-gray-900" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Total Repayment</p>
                    <AnimatedNumber value={preview.totalCost} prefix="$" className="text-lg font-bold text-gray-900" />
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-400">Enter valid loan details to see preview.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}

function Field({ label, error, required, children }: { label: string; error?: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
}

function inputClass(error?: string) {
  return `w-full py-2.5 px-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
    error ? 'border-red-300 bg-red-50' : 'border-gray-300'
  }`
}
