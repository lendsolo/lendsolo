import { Link, router } from '@inertiajs/react'
import AppLayout from '@/layouts/AppLayout'

interface QualifyingBorrower {
  id: number
  name: string
  total_interest: number
  loan_count: number
  tin_present: boolean
  address_present: boolean
}

interface Props {
  year: number
  available_years: number[]
  preview: {
    total_interest: number
    total_principal: number
    total_expenses: number
    net_income: number
    loans_count: number
    payments_count: number
    has_data: boolean
  }
  form_1098: {
    qualifying_borrowers: QualifyingBorrower[]
    missing_tin_count: number
    lender_tax_info_complete: boolean
    lender_tin_present: boolean
  }
  can_export: boolean
}

export default function ExportsIndex({ year, available_years, preview, form_1098, can_export }: Props) {
  const currentYear = new Date().getFullYear()
  const isPartialYear = year === currentYear

  function changeYear(newYear: number) {
    router.get('/exports', { year: newYear }, { preserveState: false })
  }

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Accountant Exports</h1>
            <p className="text-sm text-gray-500 mt-1">
              Download your year-end summaries, ready to hand to your CPA or import into QuickBooks.
            </p>
          </div>
        </div>

        {/* Pro gate banner */}
        {!can_export && (
          <div className="mb-6 mt-4 px-5 py-4 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-amber-800">Pro Feature</p>
                <p className="text-xs text-amber-700">
                  Accountant exports are available on the Pro plan ($49/mo). Upgrade to download your year-end summaries.
                </p>
              </div>
            </div>
            <Link
              href="/billing"
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg transition-colors shrink-0 ml-4"
            >
              Upgrade to Pro
            </Link>
          </div>
        )}

        {/* Year Selector */}
        <div className="flex items-center gap-3 mb-6 mt-4">
          <label className="text-sm font-medium text-gray-700">Tax Year:</label>
          <select
            value={year}
            onChange={(e) => changeYear(parseInt(e.target.value))}
            className="text-sm px-3 py-2 border border-gray-200 rounded-lg bg-white text-gray-900 font-mono"
          >
            {available_years.map((y) => (
              <option key={y} value={y}>{y}{y === currentYear ? ' (current)' : ''}</option>
            ))}
          </select>
        </div>

        {/* Partial year note */}
        {isPartialYear && preview.has_data && (
          <div className="mb-6 px-4 py-3 rounded-lg bg-blue-50 border border-blue-200 text-xs text-blue-700">
            This export includes data through today. Run it again in January for the complete year.
          </div>
        )}

        {/* Preview Stats */}
        {preview.has_data ? (
          <div className="grid sm:grid-cols-5 gap-3 mb-8">
            <PreviewStat label="Interest Income" value={preview.total_interest} color="text-emerald-600" />
            <PreviewStat label="Expenses" value={preview.total_expenses} color="text-red-600" />
            <PreviewStat label="Net Income" value={preview.net_income} color={preview.net_income >= 0 ? 'text-gray-900' : 'text-red-600'} />
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">Active Loans</p>
              <p className="text-xl font-bold font-mono text-gray-900">{preview.loans_count}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">Payments</p>
              <p className="text-xl font-bold font-mono text-gray-900">{preview.payments_count}</p>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 mb-8 bg-white rounded-xl border border-gray-200">
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gray-100 flex items-center justify-center">
              <svg className="w-7 h-7 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">No data for {year}</h3>
            <p className="text-sm text-gray-500">No payments or expenses recorded for this year. Try selecting a different year.</p>
          </div>
        )}

        {/* 1098 Forms Section */}
        <Form1098Section
          year={year}
          form1098={form_1098}
          canExport={can_export}
        />

        {/* Export Cards */}
        <h2 className="text-lg font-semibold text-gray-900 mt-2 mb-4">Accountant Exports</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <ExportCard
            icon={<FileTextIcon />}
            title="Year-End Summary (PDF)"
            description="Complete interest income and expense report. Send this directly to your accountant."
            buttonLabel="Download PDF"
            href={`/exports/year_end_summary.pdf?year=${year}`}
            locked={!can_export}
            disabled={!preview.has_data}
          />
          <ExportCard
            icon={<TableIcon />}
            title="Interest Income (CSV)"
            description="Loan-by-loan interest breakdown. Import into Excel or share with your CPA."
            buttonLabel="Download CSV"
            href={`/exports/year_end_summary.csv?year=${year}`}
            locked={!can_export}
            disabled={!preview.has_data}
          />
          <ExportCard
            icon={<RefreshIcon />}
            title="QuickBooks Import (.qbo)"
            description="Import your interest income directly into QuickBooks. Use File → Import → Bank Transactions."
            buttonLabel="Download .qbo"
            href={`/exports/quickbooks.qbo?year=${year}`}
            helperText="Works with QuickBooks Online and QuickBooks Desktop"
            locked={!can_export}
            disabled={!preview.has_data}
          />
          <ExportCard
            icon={<ReceiptIcon />}
            title="Expense Report (CSV)"
            description="All business expenses by category, formatted for Schedule C reporting."
            buttonLabel="Download CSV"
            href={`/exports/expenses.csv?year=${year}`}
            locked={!can_export}
            disabled={!preview.has_data}
          />
        </div>
      </div>
    </AppLayout>
  )
}

function Form1098Section({
  year,
  form1098,
  canExport,
}: {
  year: number
  form1098: Props['form_1098']
  canExport: boolean
}) {
  const { qualifying_borrowers, missing_tin_count, lender_tax_info_complete, lender_tin_present } = form1098
  const hasQualifying = qualifying_borrowers.length > 0
  const readyBorrowers = qualifying_borrowers.filter((b) => b.tin_present && b.address_present)
  const missingInfoBorrowers = qualifying_borrowers.filter((b) => !b.tin_present || !b.address_present)

  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">1098 Forms</h2>

      {/* Lender TIN missing warning */}
      {!lender_tin_present && hasQualifying && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
            </svg>
            <p className="text-sm text-red-700">Your tax ID is required to generate 1098s.</p>
          </div>
          <Link
            href="/settings"
            className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg transition-colors shrink-0 ml-4"
          >
            Go to Settings
          </Link>
        </div>
      )}

      {/* Missing borrower TIN warning */}
      {missing_tin_count > 0 && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-amber-50 border border-amber-200">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-4 h-4 text-amber-500 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
            </svg>
            <p className="text-sm text-amber-700">
              {missing_tin_count} borrower{missing_tin_count > 1 ? 's are' : ' is'} missing tax ID or address — 1098s cannot be generated for them.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 ml-6">
            {missingInfoBorrowers.map((b) => (
              <Link
                key={b.id}
                href={`/borrowers/${b.id}/edit`}
                className="text-xs text-amber-700 underline hover:text-amber-900"
              >
                {b.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      {hasQualifying ? (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Borrower</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Interest</th>
                  <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Loans</th>
                  <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">TIN</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {qualifying_borrowers.map((b) => {
                  const ready = b.tin_present && b.address_present
                  return (
                    <tr key={b.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{b.name}</td>
                      <td className="px-4 py-3 text-right font-mono text-gray-900">
                        ${b.total_interest.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-3 text-center text-gray-600">{b.loan_count}</td>
                      <td className="px-4 py-3 text-center">
                        {ready ? (
                          <span className="text-emerald-600" title="TIN and address on file">&#10003;</span>
                        ) : (
                          <Link href={`/borrowers/${b.id}/edit`} className="text-amber-500 hover:text-amber-700" title="Missing TIN or address">
                            &#9888;
                          </Link>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {canExport ? (
                          ready && lender_tax_info_complete ? (
                            <a
                              href={`/exports/form_1098/${b.id}.pdf?year=${year}`}
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors"
                            >
                              <DownloadIcon />
                              Generate
                            </a>
                          ) : (
                            <span className="text-xs text-gray-400">Missing info</span>
                          )
                        ) : (
                          <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-400 text-xs font-semibold rounded-lg cursor-not-allowed">
                            <LockIcon />
                            Pro Feature
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Bulk generate button */}
          <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
            <p className="text-xs text-gray-500">
              {readyBorrowers.length} of {qualifying_borrowers.length} borrower{qualifying_borrowers.length !== 1 ? 's' : ''} ready for generation
            </p>
            {canExport ? (
              readyBorrowers.length > 0 && lender_tax_info_complete ? (
                <a
                  href={`/exports/form_1098s.zip?year=${year}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors"
                >
                  <DownloadIcon />
                  Generate All 1098s (ZIP)
                </a>
              ) : (
                <button disabled className="inline-flex items-center gap-1.5 px-4 py-2 bg-gray-100 text-gray-400 text-xs font-semibold rounded-lg cursor-not-allowed">
                  Complete tax info to generate
                </button>
              )
            ) : (
              <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-gray-100 text-gray-400 text-xs font-semibold rounded-lg cursor-not-allowed">
                <LockIcon />
                Pro Feature
              </span>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-8 bg-white rounded-xl border border-gray-200">
          <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-gray-100 flex items-center justify-center">
            <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
            </svg>
          </div>
          <h3 className="text-sm font-semibold text-gray-900 mb-1">No 1098s needed for {year}</h3>
          <p className="text-xs text-gray-500">No borrowers received more than $600 in mortgage interest this year.</p>
        </div>
      )}
    </div>
  )
}

function DownloadIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
    </svg>
  )
}

function LockIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
    </svg>
  )
}

function PreviewStat({ label, value, color = 'text-gray-900' }: { label: string; value: number; color?: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">{label}</p>
      <p className={`text-xl font-bold font-mono ${color}`}>
        ${value.toLocaleString('en-US', { minimumFractionDigits: 2 })}
      </p>
    </div>
  )
}

function ExportCard({
  icon,
  title,
  description,
  buttonLabel,
  href,
  helperText,
  locked,
  disabled,
}: {
  icon: React.ReactNode
  title: string
  description: string
  buttonLabel: string
  href: string
  helperText?: string
  locked: boolean
  disabled: boolean
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center shrink-0 text-gray-500">
          {icon}
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
          <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{description}</p>
        </div>
      </div>

      {locked ? (
        <button
          disabled
          className="w-full py-2.5 text-xs font-semibold rounded-lg bg-gray-100 text-gray-400 cursor-not-allowed flex items-center justify-center gap-1.5"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
          </svg>
          Pro Feature
        </button>
      ) : (
        <a
          href={disabled ? undefined : href}
          className={`w-full py-2.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
            disabled
              ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
              : 'bg-emerald-600 hover:bg-emerald-700 text-white'
          }`}
          onClick={(e) => disabled && e.preventDefault()}
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
          {buttonLabel}
        </a>
      )}

      {helperText && (
        <p className="text-[10px] text-gray-400 text-center mt-2">{helperText}</p>
      )}
    </div>
  )
}

// Icons
function FileTextIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
    </svg>
  )
}

function TableIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 0 1-1.125-1.125M3.375 19.5h7.5c.621 0 1.125-.504 1.125-1.125m-9.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-7.5A1.125 1.125 0 0 1 12 18.375m9.75-12.75c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125m19.5 0v1.5c0 .621-.504 1.125-1.125 1.125M2.25 5.625v1.5c0 .621.504 1.125 1.125 1.125m0 0h17.25m-17.25 0h7.5c.621 0 1.125.504 1.125 1.125M3.375 8.25c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m17.25-3.75h-7.5c-.621 0-1.125.504-1.125 1.125m8.625-1.125c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125M12 10.875v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 10.875c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125M12 12v-1.5c0-.621-.504-1.125-1.125-1.125M12 12c0-.621.504-1.125 1.125-1.125m-2.25 0c.621 0 1.125.504 1.125 1.125m0 1.5v-1.5m0 0c0-.621.504-1.125 1.125-1.125m0 0c.621 0 1.125.504 1.125 1.125" />
    </svg>
  )
}

function RefreshIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182M2.985 19.644l3.181-3.18" />
    </svg>
  )
}

function ReceiptIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 14.25l6-6m4.5-3.493V21.75l-3.75-1.5-3.75 1.5-3.75-1.5-3.75 1.5V4.757c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0c1.1.128 1.907 1.077 1.907 2.185Z" />
    </svg>
  )
}
