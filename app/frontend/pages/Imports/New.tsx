import { useState, useCallback, useRef, useMemo } from 'react'
import { router, Link } from '@inertiajs/react'
import AppLayout from '@/layouts/AppLayout'
import { calculateAmortization } from '@/lib/calculations'

// ── Types ────────────────────────────────────────────────────────────────────

interface ParsedData {
  headers: string[]
  rows: string[][]
  total_rows: number
  filename: string
}

interface ImportResult {
  created: number
  skipped: number
  errors: { row: number; errors: string[] }[]
}

interface Props {
  parsed_data?: ParsedData
  auto_mappings?: Record<string, number>
  import_result?: ImportResult
  can_import?: boolean
}

interface MappedLoan {
  borrower_name: string
  principal: string
  annual_rate: string
  term_months: string
  start_date: string
  loan_type: string
  purpose: string
  collateral: string
  status: string
  notes: string
  monthly_payment?: number
  issues: string[]
  included: boolean
}

const LOAN_FIELDS = [
  { key: 'borrower_name', label: 'Borrower Name', required: true },
  { key: 'principal', label: 'Principal', required: true },
  { key: 'annual_rate', label: 'Interest Rate (%)', required: true },
  { key: 'term_months', label: 'Term (months)', required: true },
  { key: 'start_date', label: 'Start Date', required: false },
  { key: 'loan_type', label: 'Loan Type', required: false },
  { key: 'purpose', label: 'Purpose', required: false },
  { key: 'collateral', label: 'Collateral', required: false },
  { key: 'status', label: 'Status', required: false },
  { key: 'notes', label: 'Notes', required: false },
] as const

type FieldKey = typeof LOAN_FIELDS[number]['key']

// ── Main Component ───────────────────────────────────────────────────────────

export default function ImportsNew({ parsed_data, auto_mappings, import_result, can_import = true }: Props) {
  // Determine which step to show based on props
  const initialStep = import_result ? 4 : parsed_data ? 2 : 1
  const [step, setStep] = useState(initialStep)
  const [mappings, setMappings] = useState<Record<string, number | ''>>(auto_mappings || {})
  const [loans, setLoans] = useState<MappedLoan[]>([])
  const [editingRow, setEditingRow] = useState<number | null>(null)
  const [importing, setImporting] = useState(false)

  // When we get parsed_data from the server response, jump to step 2
  // (handled by initialStep above)

  function handleMappingComplete() {
    if (!parsed_data) return

    const mapped = parsed_data.rows.map((row) => {
      const loan: MappedLoan = {
        borrower_name: getVal(row, 'borrower_name'),
        principal: getVal(row, 'principal'),
        annual_rate: getVal(row, 'annual_rate'),
        term_months: getVal(row, 'term_months'),
        start_date: getVal(row, 'start_date'),
        loan_type: getVal(row, 'loan_type'),
        purpose: getVal(row, 'purpose'),
        collateral: getVal(row, 'collateral'),
        status: getVal(row, 'status'),
        notes: getVal(row, 'notes'),
        issues: [],
        included: true,
      }

      // Validate and compute
      loan.issues = validateLoan(loan)

      // Compute monthly payment if valid
      const principal = parseCurrency(loan.principal)
      const rate = parseNumber(loan.annual_rate)
      const term = parseInt(loan.term_months)
      if (principal > 0 && rate >= 0 && term > 0) {
        try {
          const calc = calculateAmortization(principal, rate, term, 'standard')
          loan.monthly_payment = calc.monthlyPayment
        } catch {
          // leave undefined
        }
      }

      return loan
    })

    setLoans(mapped)
    setStep(3)
  }

  function getVal(row: string[], field: string): string {
    const colIndex = mappings[field]
    if (colIndex === '' || colIndex === undefined) return ''
    return (row[colIndex as number] || '').trim()
  }

  function handleImport() {
    const validLoans = loans.filter((l) => l.included)
    if (validLoans.length === 0) return

    setImporting(true)

    const loansPayload = validLoans.map((l) => ({
      borrower_name: l.borrower_name,
      principal: l.principal,
      annual_rate: l.annual_rate,
      term_months: l.term_months,
      start_date: l.start_date,
      loan_type: l.loan_type,
      purpose: l.purpose,
      collateral: l.collateral,
      status: l.status,
      notes: l.notes,
    }))

    router.post('/import/process', { loans: loansPayload }, {
      onFinish: () => setImporting(false),
    })
  }

  function updateLoan(index: number, field: string, value: string) {
    setLoans((prev) => {
      const updated = [...prev]
      const loan = { ...updated[index], [field]: value }
      loan.issues = validateLoan(loan)

      const principal = parseCurrency(loan.principal)
      const rate = parseNumber(loan.annual_rate)
      const term = parseInt(loan.term_months)
      if (principal > 0 && rate >= 0 && term > 0) {
        try {
          const calc = calculateAmortization(principal, rate, term, 'standard')
          loan.monthly_payment = calc.monthlyPayment
        } catch {
          loan.monthly_payment = undefined
        }
      } else {
        loan.monthly_payment = undefined
      }

      updated[index] = loan
      return updated
    })
  }

  function toggleLoan(index: number) {
    setLoans((prev) => {
      const updated = [...prev]
      updated[index] = { ...updated[index], included: !updated[index].included }
      return updated
    })
  }

  const setMapping = (field: string, value: number | '') => {
    setMappings((prev) => ({ ...prev, [field]: value }))
  }

  const includedCount = loans.filter((l) => l.included).length
  const issueCount = loans.filter((l) => l.included && l.issues.length > 0).length

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Import Loans</h1>
          <p className="text-sm text-gray-500 mt-1">Upload a spreadsheet to bulk-create loans.</p>
        </div>

        {/* Solo gate banner */}
        {!can_import && (
          <div className="mb-6 px-5 py-4 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-amber-800">Solo Feature</p>
                <p className="text-xs text-amber-700">
                  Spreadsheet import is available on the Solo plan ($29/mo) and above. Upgrade to bulk-import your loans.
                </p>
              </div>
            </div>
            <Link
              href="/billing"
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg transition-colors shrink-0 ml-4"
            >
              Upgrade to Solo
            </Link>
          </div>
        )}

        {/* Stepper */}
        {can_import && <StepIndicator current={step} />}

        {/* Steps */}
        {can_import && step === 1 && <UploadStep />}
        {can_import && step === 2 && parsed_data && (
          <MappingStep
            parsedData={parsed_data}
            mappings={mappings}
            setMapping={setMapping}
            onNext={handleMappingComplete}
            onBack={() => setStep(1)}
          />
        )}
        {can_import && step === 3 && (
          <ReviewStep
            loans={loans}
            editingRow={editingRow}
            setEditingRow={setEditingRow}
            updateLoan={updateLoan}
            toggleLoan={toggleLoan}
            includedCount={includedCount}
            issueCount={issueCount}
            onBack={() => setStep(2)}
            onImport={handleImport}
            importing={importing}
          />
        )}
        {can_import && step === 4 && import_result && (
          <ResultStep result={import_result} />
        )}
      </div>
    </AppLayout>
  )
}

// ── Step Indicator ───────────────────────────────────────────────────────────

function StepIndicator({ current }: { current: number }) {
  const steps = ['Upload', 'Map Columns', 'Review', 'Import']
  return (
    <div className="flex items-center gap-2 mb-8">
      {steps.map((label, i) => {
        const num = i + 1
        const isActive = num === current
        const isDone = num < current
        return (
          <div key={label} className="flex items-center gap-2">
            {i > 0 && (
              <div className={`w-8 h-px ${isDone ? 'bg-emerald-400' : 'bg-gray-200'}`} />
            )}
            <div className="flex items-center gap-1.5">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  isDone
                    ? 'bg-emerald-500 text-white'
                    : isActive
                      ? 'bg-emerald-100 text-emerald-700 ring-2 ring-emerald-500'
                      : 'bg-gray-100 text-gray-400'
                }`}
              >
                {isDone ? '✓' : num}
              </div>
              <span className={`text-xs font-medium ${isActive ? 'text-gray-900' : 'text-gray-400'}`}>
                {label}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── Step 1: Upload ───────────────────────────────────────────────────────────

function UploadStep() {
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [])

  function handleFile(file: File) {
    const ext = file.name.split('.').pop()?.toLowerCase()
    if (!['csv', 'xlsx', 'xls'].includes(ext || '')) {
      alert('Please upload a .csv or .xlsx file')
      return
    }
    setSelectedFile(file)
  }

  function handleUpload() {
    if (!selectedFile) return
    setUploading(true)

    const formData = new FormData()
    formData.append('file', selectedFile)

    router.post('/import', formData, {
      forceFormData: true,
      onFinish: () => setUploading(false),
    })
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-8">
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all ${
          dragging
            ? 'border-emerald-400 bg-emerald-50'
            : selectedFile
              ? 'border-emerald-300 bg-emerald-50/50'
              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
        }`}
      >
        <input
          ref={fileRef}
          type="file"
          accept=".csv,.xlsx,.xls"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />

        {selectedFile ? (
          <>
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-emerald-100 flex items-center justify-center">
              <svg className="w-7 h-7 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-gray-900 mb-1">{selectedFile.name}</p>
            <p className="text-xs text-gray-400">
              {(selectedFile.size / 1024).toFixed(1)} KB · Click to change file
            </p>
          </>
        ) : (
          <>
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gray-100 flex items-center justify-center">
              <svg className="w-7 h-7 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-gray-900 mb-1">
              Drop your spreadsheet here or click to browse
            </p>
            <p className="text-xs text-gray-400">Supports .csv and .xlsx files</p>
          </>
        )}
      </div>

      {selectedFile && (
        <div className="mt-6 flex items-center justify-between">
          <button
            onClick={() => setSelectedFile(null)}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Remove file
          </button>
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50"
          >
            {uploading ? 'Parsing...' : 'Upload & Parse'}
          </button>
        </div>
      )}

      {/* Template hint */}
      <div className="mt-8 p-4 rounded-lg bg-gray-50 border border-gray-100">
        <h4 className="text-xs font-semibold text-gray-700 mb-2">Expected columns</h4>
        <p className="text-xs text-gray-500 leading-relaxed">
          Your spreadsheet should have a header row. We'll auto-detect columns like{' '}
          <span className="font-mono text-gray-700">Borrower Name</span>,{' '}
          <span className="font-mono text-gray-700">Principal</span>,{' '}
          <span className="font-mono text-gray-700">Rate</span>,{' '}
          <span className="font-mono text-gray-700">Term</span>, etc.
          You can map columns manually in the next step if auto-detection doesn't match.
        </p>
      </div>
    </div>
  )
}

// ── Step 2: Column Mapping ───────────────────────────────────────────────────

function MappingStep({
  parsedData,
  mappings,
  setMapping,
  onNext,
  onBack,
}: {
  parsedData: ParsedData
  mappings: Record<string, number | ''>
  setMapping: (field: string, value: number | '') => void
  onNext: () => void
  onBack: () => void
}) {
  const previewRows = parsedData.rows.slice(0, 5)
  const requiredFields = LOAN_FIELDS.filter((f) => f.required).map((f) => f.key)
  const allRequiredMapped = requiredFields.every((f) => mappings[f] !== '' && mappings[f] !== undefined)

  // Which column indices are already mapped
  const usedColumns = new Set(
    Object.values(mappings).filter((v): v is number => v !== '' && v !== undefined)
  )

  return (
    <div className="space-y-6">
      {/* File info */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-900">{parsedData.filename}</p>
            <p className="text-xs text-gray-400 mt-0.5">
              {parsedData.total_rows} rows · {parsedData.headers.length} columns
            </p>
          </div>
          <button onClick={onBack} className="text-xs text-gray-500 hover:text-gray-700">
            ← Upload different file
          </button>
        </div>
      </div>

      {/* Mapping Grid */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-1">Map your columns</h3>
        <p className="text-xs text-gray-400 mb-5">
          Match each LendSolo field to a column from your spreadsheet. Required fields are marked with *.
        </p>

        <div className="grid sm:grid-cols-2 gap-4">
          {LOAN_FIELDS.map((field) => (
            <div key={field.key}>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                {field.label} {field.required && <span className="text-red-500">*</span>}
              </label>
              <select
                value={mappings[field.key] ?? ''}
                onChange={(e) => setMapping(field.key, e.target.value === '' ? '' : parseInt(e.target.value))}
                className={`w-full text-sm px-3 py-2 border rounded-lg bg-white ${
                  mappings[field.key] !== '' && mappings[field.key] !== undefined
                    ? 'border-emerald-300 text-gray-900'
                    : 'border-gray-200 text-gray-400'
                }`}
              >
                <option value="">— Skip this field —</option>
                {parsedData.headers.map((header, i) => (
                  <option key={i} value={i} disabled={usedColumns.has(i) && mappings[field.key] !== i}>
                    {header || `Column ${i + 1}`}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </div>

      {/* Preview Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900">Data Preview</h3>
          <p className="text-xs text-gray-400">First {previewRows.length} rows from your file</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                {parsedData.headers.map((h, i) => {
                  const mappedField = Object.entries(mappings).find(([, v]) => v === i)
                  return (
                    <th key={i} className="text-left py-2 px-3 font-medium text-gray-500 whitespace-nowrap">
                      <div>{h || `Col ${i + 1}`}</div>
                      {mappedField && (
                        <div className="text-[9px] font-semibold text-emerald-600 mt-0.5">
                          → {LOAN_FIELDS.find((f) => f.key === mappedField[0])?.label}
                        </div>
                      )}
                    </th>
                  )
                })}
              </tr>
            </thead>
            <tbody>
              {previewRows.map((row, ri) => (
                <tr key={ri} className="border-b border-gray-50">
                  {parsedData.headers.map((_, ci) => (
                    <td key={ci} className="py-1.5 px-3 text-gray-600 whitespace-nowrap max-w-[200px] truncate">
                      {row[ci] || '—'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="text-sm text-gray-500 hover:text-gray-700">
          ← Back
        </button>
        <div className="flex items-center gap-3">
          {!allRequiredMapped && (
            <span className="text-xs text-amber-600">Map all required fields to continue</span>
          )}
          <button
            onClick={onNext}
            disabled={!allRequiredMapped}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Review Loans →
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Step 3: Review ───────────────────────────────────────────────────────────

function ReviewStep({
  loans,
  editingRow,
  setEditingRow,
  updateLoan,
  toggleLoan,
  includedCount,
  issueCount,
  onBack,
  onImport,
  importing,
}: {
  loans: MappedLoan[]
  editingRow: number | null
  setEditingRow: (i: number | null) => void
  updateLoan: (index: number, field: string, value: string) => void
  toggleLoan: (index: number) => void
  includedCount: number
  issueCount: number
  onBack: () => void
  onImport: () => void
  importing: boolean
}) {
  return (
    <div className="space-y-6">
      {/* Summary banner */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div>
            <p className="text-2xl font-bold font-mono text-gray-900">{includedCount}</p>
            <p className="text-xs text-gray-400">loans to import</p>
          </div>
          {issueCount > 0 && (
            <div>
              <p className="text-2xl font-bold font-mono text-amber-600">{issueCount}</p>
              <p className="text-xs text-gray-400">with warnings</p>
            </div>
          )}
          <div>
            <p className="text-2xl font-bold font-mono text-gray-300">{loans.length - includedCount}</p>
            <p className="text-xs text-gray-400">excluded</p>
          </div>
        </div>
      </div>

      {/* Loans table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="w-10 py-3 px-3"></th>
                <th className="text-left py-3 px-3 font-medium text-gray-500 text-xs">Borrower</th>
                <th className="text-right py-3 px-3 font-medium text-gray-500 text-xs">Principal</th>
                <th className="text-right py-3 px-3 font-medium text-gray-500 text-xs">Rate</th>
                <th className="text-right py-3 px-3 font-medium text-gray-500 text-xs">Term</th>
                <th className="text-left py-3 px-3 font-medium text-gray-500 text-xs">Start</th>
                <th className="text-right py-3 px-3 font-medium text-gray-500 text-xs">Monthly</th>
                <th className="text-left py-3 px-3 font-medium text-gray-500 text-xs">Issues</th>
                <th className="w-10 py-3 px-3"></th>
              </tr>
            </thead>
            <tbody>
              {loans.map((loan, i) => (
                editingRow === i ? (
                  <EditRow
                    key={i}
                    loan={loan}
                    index={i}
                    updateLoan={updateLoan}
                    onDone={() => setEditingRow(null)}
                  />
                ) : (
                  <tr
                    key={i}
                    className={`border-b border-gray-50 ${!loan.included ? 'opacity-40' : ''} ${
                      loan.issues.length > 0 && loan.included ? 'bg-amber-50/50' : ''
                    }`}
                  >
                    <td className="py-2 px-3">
                      <input
                        type="checkbox"
                        checked={loan.included}
                        onChange={() => toggleLoan(i)}
                        className="w-3.5 h-3.5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                      />
                    </td>
                    <td className="py-2 px-3 font-medium text-gray-900 whitespace-nowrap">
                      {loan.borrower_name || <span className="text-red-400 italic">Missing</span>}
                    </td>
                    <td className="py-2 px-3 text-right font-mono text-gray-900">
                      {loan.principal ? `$${parseCurrency(loan.principal).toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '—'}
                    </td>
                    <td className="py-2 px-3 text-right text-gray-900">
                      {loan.annual_rate ? `${parseNumber(loan.annual_rate)}%` : '—'}
                    </td>
                    <td className="py-2 px-3 text-right text-gray-900">
                      {loan.term_months ? `${loan.term_months} mo` : '—'}
                    </td>
                    <td className="py-2 px-3 text-gray-600 text-xs">{loan.start_date || '—'}</td>
                    <td className="py-2 px-3 text-right font-mono text-gray-600">
                      {loan.monthly_payment
                        ? `$${loan.monthly_payment.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
                        : '—'
                      }
                    </td>
                    <td className="py-2 px-3">
                      {loan.issues.length > 0 && loan.included && (
                        <span className="text-[10px] font-medium text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded-full" title={loan.issues.join(', ')}>
                          {loan.issues.length} {loan.issues.length === 1 ? 'issue' : 'issues'}
                        </span>
                      )}
                    </td>
                    <td className="py-2 px-3">
                      <button
                        onClick={() => setEditingRow(i)}
                        className="text-gray-300 hover:text-emerald-600 transition-colors"
                        title="Edit row"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                )
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="text-sm text-gray-500 hover:text-gray-700">
          ← Back to mapping
        </button>
        <div className="flex items-center gap-3">
          {issueCount > 0 && (
            <span className="text-xs text-amber-600">
              {issueCount} loan{issueCount > 1 ? 's' : ''} with warnings will still be imported
            </span>
          )}
          <button
            onClick={onImport}
            disabled={includedCount === 0 || importing}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {importing ? (
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Importing...
              </span>
            ) : (
              `Import ${includedCount} Loan${includedCount > 1 ? 's' : ''}`
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Inline Edit Row ──────────────────────────────────────────────────────────

function EditRow({
  loan,
  index,
  updateLoan,
  onDone,
}: {
  loan: MappedLoan
  index: number
  updateLoan: (i: number, field: string, value: string) => void
  onDone: () => void
}) {
  return (
    <tr className="border-b border-gray-100 bg-emerald-50/30">
      <td colSpan={9} className="p-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
          <div>
            <label className="block text-[10px] font-medium text-gray-500 mb-0.5">Borrower Name *</label>
            <input
              value={loan.borrower_name}
              onChange={(e) => updateLoan(index, 'borrower_name', e.target.value)}
              className="w-full text-sm px-2 py-1.5 border border-gray-200 rounded-lg bg-white"
            />
          </div>
          <div>
            <label className="block text-[10px] font-medium text-gray-500 mb-0.5">Principal *</label>
            <input
              value={loan.principal}
              onChange={(e) => updateLoan(index, 'principal', e.target.value)}
              className="w-full text-sm px-2 py-1.5 border border-gray-200 rounded-lg bg-white font-mono"
            />
          </div>
          <div>
            <label className="block text-[10px] font-medium text-gray-500 mb-0.5">Rate (%) *</label>
            <input
              value={loan.annual_rate}
              onChange={(e) => updateLoan(index, 'annual_rate', e.target.value)}
              className="w-full text-sm px-2 py-1.5 border border-gray-200 rounded-lg bg-white"
            />
          </div>
          <div>
            <label className="block text-[10px] font-medium text-gray-500 mb-0.5">Term (months) *</label>
            <input
              value={loan.term_months}
              onChange={(e) => updateLoan(index, 'term_months', e.target.value)}
              className="w-full text-sm px-2 py-1.5 border border-gray-200 rounded-lg bg-white"
            />
          </div>
          <div>
            <label className="block text-[10px] font-medium text-gray-500 mb-0.5">Start Date</label>
            <input
              value={loan.start_date}
              onChange={(e) => updateLoan(index, 'start_date', e.target.value)}
              className="w-full text-sm px-2 py-1.5 border border-gray-200 rounded-lg bg-white"
            />
          </div>
          <div>
            <label className="block text-[10px] font-medium text-gray-500 mb-0.5">Loan Type</label>
            <select
              value={loan.loan_type}
              onChange={(e) => updateLoan(index, 'loan_type', e.target.value)}
              className="w-full text-sm px-2 py-1.5 border border-gray-200 rounded-lg bg-white"
            >
              <option value="">Standard</option>
              <option value="standard">Standard</option>
              <option value="interest_only">Interest Only</option>
              <option value="balloon">Balloon</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-medium text-gray-500 mb-0.5">Purpose</label>
            <input
              value={loan.purpose}
              onChange={(e) => updateLoan(index, 'purpose', e.target.value)}
              className="w-full text-sm px-2 py-1.5 border border-gray-200 rounded-lg bg-white"
            />
          </div>
          <div>
            <label className="block text-[10px] font-medium text-gray-500 mb-0.5">Notes</label>
            <input
              value={loan.notes}
              onChange={(e) => updateLoan(index, 'notes', e.target.value)}
              className="w-full text-sm px-2 py-1.5 border border-gray-200 rounded-lg bg-white"
            />
          </div>
        </div>
        {loan.issues.length > 0 && (
          <div className="mb-3">
            {loan.issues.map((issue, j) => (
              <span key={j} className="text-[10px] text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full mr-1">
                {issue}
              </span>
            ))}
          </div>
        )}
        <button
          onClick={onDone}
          className="text-xs font-medium text-emerald-600 hover:text-emerald-700"
        >
          Done editing
        </button>
      </td>
    </tr>
  )
}

// ── Step 4: Results ──────────────────────────────────────────────────────────

function ResultStep({ result }: { result: ImportResult }) {
  const allSuccess = result.skipped === 0
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
      <div className={`w-16 h-16 mx-auto mb-5 rounded-2xl flex items-center justify-center ${
        allSuccess ? 'bg-emerald-100' : 'bg-amber-100'
      }`}>
        {allSuccess ? (
          <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
        ) : (
          <svg className="w-8 h-8 text-amber-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
          </svg>
        )}
      </div>

      <h2 className="text-xl font-bold text-gray-900 mb-2">Import Complete</h2>
      <p className="text-sm text-gray-500 mb-6">
        {result.created} loan{result.created !== 1 ? 's' : ''} imported successfully
        {result.skipped > 0 && `, ${result.skipped} skipped`}.
      </p>

      {/* Stats */}
      <div className="flex items-center justify-center gap-8 mb-8">
        <div>
          <p className="text-3xl font-bold font-mono text-emerald-600">{result.created}</p>
          <p className="text-xs text-gray-400">Created</p>
        </div>
        {result.skipped > 0 && (
          <div>
            <p className="text-3xl font-bold font-mono text-amber-600">{result.skipped}</p>
            <p className="text-xs text-gray-400">Skipped</p>
          </div>
        )}
      </div>

      {/* Error details */}
      {result.errors.length > 0 && (
        <div className="text-left max-w-md mx-auto mb-8">
          <h4 className="text-xs font-semibold text-gray-700 mb-2">Skipped rows:</h4>
          <div className="space-y-1">
            {result.errors.map((err, i) => (
              <div key={i} className="text-xs text-gray-500 p-2 rounded bg-gray-50">
                <span className="font-medium">Row {err.row}:</span> {err.errors.join(', ')}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-center gap-3">
        <Link
          href="/loans"
          className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg transition-colors"
        >
          View Loans
        </Link>
        <Link
          href="/import"
          className="px-6 py-2.5 border border-gray-200 text-sm font-medium rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
        >
          Import More
        </Link>
      </div>
    </div>
  )
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function parseCurrency(value: string): number {
  if (!value) return 0
  return parseFloat(value.replace(/[$,\s]/g, '')) || 0
}

function parseNumber(value: string): number {
  if (!value) return 0
  return parseFloat(value.replace(/[%,\s]/g, '')) || 0
}

function validateLoan(loan: MappedLoan): string[] {
  const issues: string[] = []

  if (!loan.borrower_name.trim()) issues.push('Missing borrower name')

  const principal = parseCurrency(loan.principal)
  if (!loan.principal.trim()) issues.push('Missing principal')
  else if (principal <= 0) issues.push('Principal must be > 0')

  const rate = parseNumber(loan.annual_rate)
  if (!loan.annual_rate.trim()) issues.push('Missing rate')
  else if (rate < 0) issues.push('Rate cannot be negative')
  else if (rate > 100) issues.push('Rate > 100%')

  const term = parseInt(loan.term_months)
  if (!loan.term_months.trim()) issues.push('Missing term')
  else if (isNaN(term) || term <= 0) issues.push('Term must be > 0')
  else if (term > 360) issues.push('Term > 360 months')

  return issues
}
