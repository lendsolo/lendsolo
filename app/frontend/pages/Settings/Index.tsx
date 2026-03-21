import { useState } from 'react'
import { useForm, router, usePage } from '@inertiajs/react'
import AppLayout from '@/layouts/AppLayout'

interface Props {
  user: {
    business_name: string
    total_capital: number
    email: string
  }
}

export default function SettingsIndex({ user }: Props) {
  const { flash } = usePage<{ flash: { notice?: string; alert?: string } }>().props
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [resetConfirmText, setResetConfirmText] = useState('')

  const form = useForm({
    business_name: user.business_name,
    total_capital: user.total_capital.toString(),
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    form.patch('/settings')
  }

  function handleReset() {
    router.delete('/settings/reset_data', {
      onSuccess: () => {
        setShowResetConfirm(false)
        setResetConfirmText('')
      },
    })
  }

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Settings</h1>
        <p className="text-sm text-gray-500 mb-8">Manage your business profile and preferences.</p>

        {/* Flash messages */}
        {flash?.notice && (
          <div className="mb-6 px-4 py-3 rounded-lg bg-emerald-50 border border-emerald-200 text-sm text-emerald-700">
            {flash.notice}
          </div>
        )}
        {flash?.alert && (
          <div className="mb-6 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
            {flash.alert}
          </div>
        )}

        {/* Profile Section */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Business Profile</h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Email</label>
              <input
                type="email"
                value={user.email}
                disabled
                className="w-full text-sm px-3 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-400 cursor-not-allowed"
              />
              <p className="text-[10px] text-gray-400 mt-1">Email cannot be changed here.</p>
            </div>

            <div>
              <label htmlFor="business_name" className="block text-xs font-medium text-gray-500 mb-1.5">
                Business Name
              </label>
              <input
                id="business_name"
                type="text"
                value={form.data.business_name}
                onChange={(e) => form.setData('business_name', e.target.value)}
                placeholder="e.g. Smith Capital LLC"
                className="w-full text-sm px-3 py-2.5 border border-gray-200 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              />
              <p className="text-[10px] text-gray-400 mt-1">Displayed in the sidebar header.</p>
            </div>

            <div>
              <label htmlFor="total_capital" className="block text-xs font-medium text-gray-500 mb-1.5">
                Total Available Capital
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">$</span>
                <input
                  id="total_capital"
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.data.total_capital}
                  onChange={(e) => form.setData('total_capital', e.target.value)}
                  placeholder="0.00"
                  className="w-full text-sm pl-7 pr-3 py-2.5 border border-gray-200 rounded-lg bg-white text-gray-900 placeholder-gray-400 font-mono focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                />
              </div>
              <p className="text-[10px] text-gray-400 mt-1">
                Total funds you have available for lending. Used to calculate capital utilization and concentration alerts.
              </p>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={form.processing}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50"
              >
                {form.processing ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>

        {/* Danger Zone */}
        <div className="bg-white rounded-xl border border-red-200 p-6">
          <h2 className="text-sm font-semibold text-red-700 mb-1">Danger Zone</h2>
          <p className="text-xs text-gray-500 mb-4">
            Permanently delete all your loans, payments, and expenses. This action cannot be undone.
          </p>

          {!showResetConfirm ? (
            <button
              onClick={() => setShowResetConfirm(true)}
              className="px-5 py-2 border border-red-200 text-sm font-medium rounded-lg text-red-600 hover:bg-red-50 transition-colors"
            >
              Reset All Data
            </button>
          ) : (
            <div className="p-4 rounded-lg bg-red-50 border border-red-200">
              <p className="text-sm text-red-700 font-medium mb-3">
                Are you sure? Type <span className="font-mono font-bold">DELETE</span> to confirm.
              </p>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={resetConfirmText}
                  onChange={(e) => setResetConfirmText(e.target.value)}
                  placeholder="Type DELETE"
                  className="text-sm px-3 py-2 border border-red-200 rounded-lg bg-white text-gray-900 placeholder-gray-400 font-mono w-40"
                />
                <button
                  onClick={handleReset}
                  disabled={resetConfirmText !== 'DELETE'}
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Confirm Reset
                </button>
                <button
                  onClick={() => { setShowResetConfirm(false); setResetConfirmText('') }}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
