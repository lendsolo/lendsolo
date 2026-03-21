import { Link } from '@inertiajs/react'
import { useState, useEffect } from 'react'

export default function StickyNav() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-[#0E4D30]/95 backdrop-blur-md shadow-lg' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center border border-white/20">
              <span className="text-[#34D399] font-bold text-sm font-mono">LS</span>
            </div>
            <span className="text-lg font-bold text-white font-display">LendSolo</span>
          </Link>

          {/* Desktop links */}
          <div className="hidden lg:flex items-center gap-8">
            <a href="#calculators" className="text-sm text-white/70 hover:text-white transition-colors">
              Calculators
            </a>
            <a href="#features" className="text-sm text-white/70 hover:text-white transition-colors">
              Features
            </a>
            <a href="#pricing" className="text-sm text-white/70 hover:text-white transition-colors">
              Pricing
            </a>
          </div>

          {/* Desktop CTAs */}
          <div className="hidden lg:flex items-center gap-3">
            <Link
              href="/users/sign_in"
              className="text-sm text-white/80 hover:text-white px-4 py-2 rounded-lg border border-white/20 hover:border-white/40 transition-all"
            >
              Sign In
            </Link>
            <Link
              href="/users/sign_up"
              className="text-sm font-semibold text-[#081C12] bg-[#34D399] hover:bg-[#2fc48d] px-5 py-2.5 rounded-lg transition-colors shadow-[0_0_20px_rgba(52,211,153,0.3)]"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden text-white p-2"
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-[#0E4D30]/98 backdrop-blur-lg border-t border-white/10">
          <div className="px-4 py-4 space-y-2">
            <a href="#calculators" onClick={() => setMobileOpen(false)} className="block px-4 py-3 text-white/80 hover:text-white rounded-lg hover:bg-white/5">
              Calculators
            </a>
            <a href="#features" onClick={() => setMobileOpen(false)} className="block px-4 py-3 text-white/80 hover:text-white rounded-lg hover:bg-white/5">
              Features
            </a>
            <a href="#pricing" onClick={() => setMobileOpen(false)} className="block px-4 py-3 text-white/80 hover:text-white rounded-lg hover:bg-white/5">
              Pricing
            </a>
            <div className="pt-2 border-t border-white/10 flex flex-col gap-2">
              <Link href="/users/sign_in" className="block text-center px-4 py-3 text-white/80 border border-white/20 rounded-lg">
                Sign In
              </Link>
              <Link href="/users/sign_up" className="block text-center px-4 py-3 font-semibold text-[#081C12] bg-[#34D399] rounded-lg">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
