import { useState, useRef, useEffect, useCallback } from 'react'

interface BorrowerOption {
  id: number
  name: string
}

interface Props {
  borrowers: BorrowerOption[]
  selectedId: number | null
  selectedName: string
  onSelect: (id: number | null, name: string) => void
  error?: string
}

export default function BorrowerSelector({ borrowers, selectedId, selectedName, onSelect, error }: Props) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [showNewForm, setShowNewForm] = useState(false)
  const [newName, setNewName] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newPhone, setNewPhone] = useState('')
  const [creating, setCreating] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const filtered = borrowers.filter((b) =>
    b.name.toLowerCase().includes(search.toLowerCase())
  )

  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
      setOpen(false)
      setShowNewForm(false)
    }
  }, [])

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [handleClickOutside])

  function handleSelect(b: BorrowerOption) {
    onSelect(b.id, b.name)
    setOpen(false)
    setSearch('')
  }

  function handleCreateNew() {
    if (!newName.trim()) return
    setCreating(true)

    const body: Record<string, string> = { name: newName.trim() }
    if (newEmail.trim()) body.email = newEmail.trim()
    if (newPhone.trim()) body.phone = newPhone.trim()

    fetch('/borrowers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ borrower: body }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.id) {
          onSelect(data.id, data.name || newName.trim())
          resetNewForm()
          setOpen(false)
        }
      })
      .catch(() => {
        // Fallback: just set the name without a borrower_id, the controller will handle find-or-create
        onSelect(null, newName.trim())
        resetNewForm()
        setOpen(false)
      })
      .finally(() => setCreating(false))
  }

  function resetNewForm() {
    setShowNewForm(false)
    setNewName('')
    setNewEmail('')
    setNewPhone('')
  }

  const displayValue = selectedId
    ? borrowers.find((b) => b.id === selectedId)?.name || selectedName
    : selectedName

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        Borrower<span className="text-red-400 ml-0.5">*</span>
      </label>
      <div ref={containerRef} className="relative">
        <button
          type="button"
          onClick={() => { setOpen(!open); setTimeout(() => inputRef.current?.focus(), 50) }}
          className={`w-full py-2.5 px-3 border rounded-lg text-sm text-left focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 flex items-center justify-between ${
            error ? 'border-red-300 bg-red-50' : 'border-gray-300'
          }`}
        >
          <span className={displayValue ? 'text-gray-900' : 'text-gray-400'}>
            {displayValue || 'Select a borrower...'}
          </span>
          <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
          </svg>
        </button>

        {open && (
          <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-hidden">
            {/* Search input */}
            <div className="p-2 border-b border-gray-100">
              <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search borrowers..."
                className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            {/* Options */}
            <div className="max-h-40 overflow-y-auto">
              {filtered.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => handleSelect(b)}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-emerald-50 transition-colors flex items-center justify-between ${
                    selectedId === b.id ? 'bg-emerald-50 text-emerald-700' : 'text-gray-700'
                  }`}
                >
                  {b.name}
                  {selectedId === b.id && (
                    <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                  )}
                </button>
              ))}
              {filtered.length === 0 && search && (
                <p className="px-3 py-2 text-sm text-gray-400">No borrowers found</p>
              )}
            </div>

            {/* Create new */}
            <div className="border-t border-gray-100">
              {showNewForm ? (
                <div className="p-3 space-y-2">
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleCreateNew())}
                    placeholder="Name *"
                    className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    autoFocus
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="Email (optional)"
                      className="px-2 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                    <input
                      type="tel"
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                      placeholder="Phone (optional)"
                      className="px-2 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={resetNewForm}
                      className="px-3 py-1.5 text-xs text-gray-500 hover:text-gray-700"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleCreateNew}
                      disabled={creating || !newName.trim()}
                      className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-medium rounded hover:bg-emerald-700 disabled:opacity-50"
                    >
                      {creating ? 'Creating...' : 'Create & Select'}
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => { setShowNewForm(true); setNewName(search) }}
                  className="w-full text-left px-3 py-2 text-sm text-emerald-600 hover:bg-emerald-50 font-medium transition-colors"
                >
                  + Create new borrower
                </button>
              )}
            </div>
          </div>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
}
