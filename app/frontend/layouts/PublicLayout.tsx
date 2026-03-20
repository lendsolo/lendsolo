import { Link } from '@inertiajs/react'
import { ReactNode } from 'react'

interface Props {
  children: ReactNode
  title: string
  description: string
}

export default function PublicLayout({ children, title, description }: Props) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#0F1419' }}>
              <span className="text-emerald-400 font-bold text-sm">LS</span>
            </div>
            <span className="text-lg font-bold text-gray-900">LendSolo</span>
          </Link>

          <nav className="flex items-center gap-3">
            <Link
              href="/tools/loan-amortization-calculator"
              className="hidden sm:inline-block text-sm text-gray-600 hover:text-gray-900 px-3 py-2"
            >
              Calculators
            </Link>
            <Link
              href="/users/sign_in"
              className="text-sm text-gray-600 hover:text-gray-900 px-3 py-2"
            >
              Sign In
            </Link>
            <Link
              href="/users/sign_up"
              className="text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-lg transition-colors"
            >
              Get Started
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <div style={{ backgroundColor: '#0F1419' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <h1 className="text-3xl sm:text-4xl font-bold text-white">{title}</h1>
          <p className="mt-3 text-lg text-gray-400 max-w-2xl">{description}</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {children}
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded flex items-center justify-center" style={{ backgroundColor: '#0F1419' }}>
                <span className="text-emerald-400 font-bold text-xs">LS</span>
              </div>
              <span className="text-sm text-gray-500">LendSolo — Loan management for private lenders</span>
            </div>
            <nav className="flex gap-6 text-sm text-gray-500">
              <Link href="/tools/loan-amortization-calculator" className="hover:text-gray-700">Amortization</Link>
              <Link href="/tools/roi-calculator" className="hover:text-gray-700">ROI Calculator</Link>
              <Link href="/tools/loan-comparison" className="hover:text-gray-700">Loan Comparison</Link>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  )
}
