import { useState } from 'react'
import { useForm, router, usePage, Link } from '@inertiajs/react'
import AppLayout from '@/layouts/AppLayout'

interface Props {
  user: {
    business_name: string
    total_capital: number
    email: string
    email_reminders_enabled: boolean
    email_receipts_enabled: boolean
    email_late_notices_enabled: boolean
    email_monthly_summary_enabled: boolean
    reminder_days_before: number
    late_notice_days_after: number
    borrower_notification_email: string
  }
}

export default function SettingsIndex({ user }: Props) {
  const { flash } = usePage<{ flash: { notice?: string; alert?: string } }>().props
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [resetConfirmText, setResetConfirmText] = useState('')
  const [sendingPreview, setSendingPreview] = useState<string | null>(null)

  const form = useForm({
    business_name: user.business_name,
    email_reminders_enabled: user.email_reminders_enabled,
    email_receipts_enabled: user.email_receipts_enabled,
    email_late_notices_enabled: user.email_late_notices_enabled,
    email_monthly_summary_enabled: user.email_monthly_summary_enabled,
    reminder_days_before: user.reminder_days_before.toString(),
    late_notice_days_after: user.late_notice_days_after.toString(),
    borrower_notification_email: user.borrower_notification_email,
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

  function handleSendTestEmail(emailType: string) {
    setSendingPreview(emailType)
    router.post('/settings/send_test_email', { email_type: emailType }, {
      onFinish: () => setSendingPreview(null),
    })
  }

  const emailTypes = [
    {
      key: 'email_reminders_enabled' as const,
      label: 'Payment Reminders',
      description: 'Sent to borrowers before a payment is due',
      previewKey: 'payment_reminder',
      timingField: 'reminder_days_before' as const,
      timingLabel: 'days before due date',
    },
    {
      key: 'email_late_notices_enabled' as const,
      label: 'Late Payment Notices',
      description: 'Sent to borrowers when a payment is overdue',
      previewKey: 'late_payment_notice',
      timingField: 'late_notice_days_after' as const,
      timingLabel: 'days after due date',
    },
    {
      key: 'email_receipts_enabled' as const,
      label: 'Payment Receipts',
      description: 'Sent to borrowers when a payment is recorded',
      previewKey: 'payment_receipt',
    },
    {
      key: 'email_monthly_summary_enabled' as const,
      label: 'Monthly Portfolio Summary',
      description: 'Sent to you on the 1st of each month',
      previewKey: 'monthly_portfolio_summary',
    },
  ]

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Settings</h1>
        <p className="text-sm text-gray-500 mb-8">Manage your business profile, email preferences, and data.</p>

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

        <form onSubmit={handleSubmit}>
          {/* Profile Section */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">Business Profile</h2>
            <div className="space-y-5">
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
                <p className="text-[10px] text-gray-400 mt-1">Displayed in the sidebar header and on email communications.</p>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">
                  Total Capital
                </label>
                <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-gray-50">
                  <span className="text-lg font-bold font-mono text-gray-900">
                    ${user.total_capital.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                  <div className="flex items-center gap-3">
                    <Link
                      href="/capital_transactions"
                      className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                    >
                      View capital history &rarr;
                    </Link>
                    <Link
                      href="/capital_transactions"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors"
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Add Capital
                    </Link>
                  </div>
                </div>
                <p className="text-[10px] text-gray-400 mt-1">
                  Computed from your capital transaction history. Add or withdraw capital from the capital ledger.
                </p>
              </div>
            </div>
          </div>

          {/* Email Notifications Section */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <div className="flex items-center gap-2 mb-1">
              <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
              </svg>
              <h2 className="text-sm font-semibold text-gray-900">Email Notifications</h2>
            </div>
            <p className="text-xs text-gray-500 mb-5">Configure automated emails sent to borrowers and yourself.</p>

            {/* Borrower email */}
            <div className="mb-6 pb-6 border-b border-gray-100">
              <label htmlFor="borrower_notification_email" className="block text-xs font-medium text-gray-500 mb-1.5">
                Borrower Notification Email
              </label>
              <input
                id="borrower_notification_email"
                type="email"
                value={form.data.borrower_notification_email}
                onChange={(e) => form.setData('borrower_notification_email', e.target.value)}
                placeholder="borrower@example.com"
                className="w-full text-sm px-3 py-2.5 border border-gray-200 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              />
              <p className="text-[10px] text-gray-400 mt-1">
                Reminders, receipts, and notices will be sent to this email. Leave blank to disable borrower emails.
              </p>
            </div>

            {/* Email type toggles */}
            <div className="space-y-4">
              {emailTypes.map((emailType) => (
                <div key={emailType.key} className="flex items-start justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors -mx-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        role="switch"
                        aria-checked={form.data[emailType.key]}
                        onClick={() => form.setData(emailType.key, !form.data[emailType.key])}
                        className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${
                          form.data[emailType.key] ? 'bg-emerald-500' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            form.data[emailType.key] ? 'translate-x-4' : 'translate-x-0'
                          }`}
                        />
                      </button>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{emailType.label}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{emailType.description}</p>
                      </div>
                    </div>

                    {/* Timing config for reminder/late notice */}
                    {emailType.timingField && form.data[emailType.key] && (
                      <div className="mt-3 ml-12 flex items-center gap-2">
                        <span className="text-xs text-gray-500">Send</span>
                        <input
                          type="number"
                          min="1"
                          max="30"
                          value={form.data[emailType.timingField]}
                          onChange={(e) => form.setData(emailType.timingField, e.target.value)}
                          className="w-14 text-sm px-2 py-1 border border-gray-200 rounded-md text-center font-mono focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                        />
                        <span className="text-xs text-gray-500">{emailType.timingLabel}</span>
                      </div>
                    )}
                  </div>

                  {/* Preview button */}
                  <button
                    type="button"
                    onClick={() => handleSendTestEmail(emailType.previewKey)}
                    disabled={sendingPreview === emailType.previewKey}
                    className="ml-4 flex-shrink-0 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors disabled:opacity-50"
                  >
                    {sendingPreview === emailType.previewKey ? (
                      <span className="flex items-center gap-1">
                        <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Sending...
                      </span>
                    ) : (
                      'Send Test'
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Save button */}
          <div className="mb-6">
            <button
              type="submit"
              disabled={form.processing}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50"
            >
              {form.processing ? 'Saving...' : 'Save All Settings'}
            </button>
          </div>
        </form>

        {/* Danger Zone */}
        <div className="bg-white rounded-xl border border-red-200 p-6">
          <h2 className="text-sm font-semibold text-red-700 mb-1">Danger Zone</h2>
          <p className="text-xs text-gray-500 mb-4">
            Permanently delete all your loans, payments, expenses, and email logs. This action cannot be undone.
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
