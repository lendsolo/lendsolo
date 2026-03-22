import { useForm } from '@inertiajs/react'
import AppLayout from '@/layouts/AppLayout'
import type { BorrowerDetail } from '@/types/borrower'

interface Props {
  borrower: BorrowerDetail
}

export default function EditBorrower({ borrower }: Props) {
  const { data, setData, patch, processing, errors } = useForm({
    name: borrower.name,
    email: borrower.email || '',
    phone: borrower.phone || '',
    address_line1: borrower.address_line1 || '',
    address_line2: borrower.address_line2 || '',
    city: borrower.city || '',
    state: borrower.state || '',
    zip: borrower.zip || '',
    notes: borrower.notes || '',
    tin: borrower.tin || '',
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    patch(`/borrowers/${borrower.id}`)
  }

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-2 mb-1 text-sm text-gray-400">
          <a href="/borrowers" className="hover:text-gray-600">Borrowers</a>
          <span>/</span>
          <a href={`/borrowers/${borrower.id}`} className="hover:text-gray-600">{borrower.name}</a>
          <span>/</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Edit Borrower</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
            <h2 className="text-lg font-semibold text-gray-900">Basic Info</h2>

            <Field label="Name" error={errors.name} required>
              <input
                type="text"
                value={data.name}
                onChange={(e) => setData('name', e.target.value)}
                className={inputClass(errors.name)}
              />
            </Field>

            <div className="grid sm:grid-cols-2 gap-5">
              <Field label="Email" error={errors.email}>
                <input
                  type="email"
                  value={data.email}
                  onChange={(e) => setData('email', e.target.value)}
                  className={inputClass(errors.email)}
                />
              </Field>

              <Field label="Phone" error={errors.phone}>
                <input
                  type="tel"
                  value={data.phone}
                  onChange={(e) => setData('phone', e.target.value)}
                  className={inputClass(errors.phone)}
                />
              </Field>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
            <h2 className="text-lg font-semibold text-gray-900">Address</h2>

            <Field label="Address Line 1" error={errors.address_line1}>
              <input
                type="text"
                value={data.address_line1}
                onChange={(e) => setData('address_line1', e.target.value)}
                className={inputClass(errors.address_line1)}
              />
            </Field>

            <Field label="Address Line 2" error={errors.address_line2}>
              <input
                type="text"
                value={data.address_line2}
                onChange={(e) => setData('address_line2', e.target.value)}
                className={inputClass(errors.address_line2)}
              />
            </Field>

            <div className="grid sm:grid-cols-3 gap-5">
              <Field label="City" error={errors.city}>
                <input
                  type="text"
                  value={data.city}
                  onChange={(e) => setData('city', e.target.value)}
                  className={inputClass(errors.city)}
                />
              </Field>
              <Field label="State" error={errors.state}>
                <input
                  type="text"
                  value={data.state}
                  onChange={(e) => setData('state', e.target.value)}
                  maxLength={2}
                  className={inputClass(errors.state)}
                />
              </Field>
              <Field label="ZIP" error={errors.zip}>
                <input
                  type="text"
                  value={data.zip}
                  onChange={(e) => setData('zip', e.target.value)}
                  className={inputClass(errors.zip)}
                />
              </Field>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
            <h2 className="text-lg font-semibold text-gray-900">Additional</h2>

            <Field label="TIN (SSN/EIN)" error={errors.tin}>
              <input
                type="password"
                value={data.tin}
                onChange={(e) => setData('tin', e.target.value)}
                placeholder={borrower.tin ? '***-**-****' : '9 digits'}
                maxLength={11}
                className={inputClass(errors.tin)}
              />
              <p className="mt-1 text-xs text-gray-400">Encrypted at rest. Needed for 1098 forms.</p>
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
            <a href={`/borrowers/${borrower.id}`} className="px-6 py-2.5 text-sm text-gray-600 hover:text-gray-800">
              Cancel
            </a>
          </div>
        </form>
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
