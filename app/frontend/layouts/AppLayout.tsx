import { Link, usePage, router } from '@inertiajs/react'
import { ReactNode, useState, useEffect, useCallback, useRef } from 'react'

interface User {
  id: number
  email: string
  business_name: string | null
  subscription_plan: string
  effective_plan: string
  on_trial: boolean
  trial_days_remaining: number
  trial_expired: boolean
  active_loan_count: number
  loan_limit: number | null
}

interface PageProps {
  current_user: User
  [key: string]: unknown
}

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon, gate: null },
  { name: 'Loans', href: '/loans', icon: BanknotesIcon, gate: null },
  { name: 'Borrowers', href: '/borrowers', icon: UserIcon, gate: null },
  { name: 'Payments', href: '/payments', icon: CreditCardIcon, gate: null },
  { name: 'Expenses', href: '/expenses', icon: ReceiptIcon, gate: null },
  { name: 'Capital', href: '/capital_transactions', icon: WalletIcon, gate: null },
  { name: 'Import', href: '/import', icon: ArrowUpTrayIcon, gate: 'solo' as const },
  { name: 'Reports', href: '/reports', icon: DocumentChartIcon, gate: null },
  { name: 'Exports', href: '/exports', icon: ArrowDownTrayIcon, gate: 'pro' as const },
  { name: 'Calculators', href: '/calculators', icon: CalculatorIcon, gate: null },
  { name: 'Billing', href: '/billing', icon: SparklesIcon, gate: null },
  { name: 'Settings', href: '/settings', icon: CogIcon, gate: null },
]

function LockIcon() {
  return (
    <svg className="w-3 h-3 text-gray-500 opacity-60" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
    </svg>
  )
}

const PLAN_RANK: Record<string, number> = { free: 0, solo: 1, pro: 2, fund: 3 }

function isGated(gate: string | null, userPlan: string): boolean {
  if (!gate) return false
  return (PLAN_RANK[userPlan] || 0) < (PLAN_RANK[gate] || 0)
}

function HomeIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
    </svg>
  )
}

function BanknotesIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" />
    </svg>
  )
}

function UserIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
    </svg>
  )
}

function CreditCardIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" />
    </svg>
  )
}

function ReceiptIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 14.25l6-6m4.5-3.493V21.75l-3.75-1.5-3.75 1.5-3.75-1.5-3.75 1.5V4.757c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0c1.1.128 1.907 1.077 1.907 2.185ZM9.75 9h.008v.008H9.75V9Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm4.125 4.5h.008v.008h-.008V13.5Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
    </svg>
  )
}

function WalletIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0 0 12 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75Z" />
    </svg>
  )
}

function ArrowUpTrayIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
    </svg>
  )
}

function DocumentChartIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m.75 12 3 3m0 0 3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
    </svg>
  )
}

function ArrowDownTrayIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
    </svg>
  )
}

function CalculatorIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 15.75V18m-7.5-6.75h.008v.008H8.25v-.008Zm0 2.25h.008v.008H8.25V13.5Zm0 2.25h.008v.008H8.25v-.008Zm0 2.25h.008v.008H8.25V18Zm2.498-6.75h.007v.008h-.007v-.008Zm0 2.25h.007v.008h-.007V13.5Zm0 2.25h.007v.008h-.007v-.008Zm0 2.25h.007v.008h-.007V18Zm2.504-6.75h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V13.5Zm0 2.25h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V18Zm2.498-6.75h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V13.5ZM8.25 6h7.5v2.25h-7.5V6ZM12 2.25c-1.892 0-3.758.11-5.593.322C5.307 2.7 4.5 3.65 4.5 4.757V19.5a2.25 2.25 0 0 0 2.25 2.25h10.5a2.25 2.25 0 0 0 2.25-2.25V4.757c0-1.108-.806-2.057-1.907-2.185A48.507 48.507 0 0 0 12 2.25Z" />
    </svg>
  )
}

function SparklesIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
    </svg>
  )
}

function CogIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    </svg>
  )
}

const PLAN_BADGES: Record<string, { label: string; bg: string; text: string }> = {
  free: { label: 'Free', bg: 'bg-gray-600', text: 'text-gray-300' },
  solo: { label: 'Solo', bg: 'bg-emerald-900', text: 'text-emerald-400' },
  pro: { label: 'Pro', bg: 'bg-indigo-900', text: 'text-indigo-400' },
  fund: { label: 'Fund', bg: 'bg-amber-900', text: 'text-amber-400' },
}

export default function AppLayout({ children }: { children: ReactNode }) {
  const { current_user } = usePage<PageProps>().props
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const currentPath = window.location.pathname

  const touchStartX = useRef(0)
  const touchCurrentX = useRef(0)
  const isSwiping = useRef(false)

  const closeSidebar = useCallback(() => setSidebarOpen(false), [])

  // Close sidebar on Inertia navigation
  useEffect(() => {
    const removeListener = router.on('start', closeSidebar)
    return () => { removeListener() }
  }, [closeSidebar])

  // Close sidebar on Escape key
  useEffect(() => {
    if (!sidebarOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeSidebar()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [sidebarOpen, closeSidebar])

  // Close sidebar when resizing above md breakpoint
  useEffect(() => {
    const mql = window.matchMedia('(min-width: 768px)')
    const handler = (e: MediaQueryListEvent) => {
      if (e.matches) closeSidebar()
    }
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [closeSidebar])

  // Body scroll lock when sidebar is open on mobile
  useEffect(() => {
    if (sidebarOpen) {
      document.body.classList.add('overflow-hidden')
    } else {
      document.body.classList.remove('overflow-hidden')
    }
    return () => document.body.classList.remove('overflow-hidden')
  }, [sidebarOpen])

  // Touch gestures for swipe open/close
  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      const x = e.touches[0].clientX
      touchStartX.current = x
      touchCurrentX.current = x
      if (x <= 20 || sidebarOpen) {
        isSwiping.current = true
      }
    }
    const handleTouchMove = (e: TouchEvent) => {
      if (!isSwiping.current) return
      touchCurrentX.current = e.touches[0].clientX
    }
    const handleTouchEnd = () => {
      if (!isSwiping.current) return
      isSwiping.current = false
      const deltaX = touchCurrentX.current - touchStartX.current
      if (!sidebarOpen && deltaX > 50 && touchStartX.current <= 20) {
        setSidebarOpen(true)
      } else if (sidebarOpen && deltaX < -50) {
        setSidebarOpen(false)
      }
    }
    document.addEventListener('touchstart', handleTouchStart, { passive: true })
    document.addEventListener('touchmove', handleTouchMove, { passive: true })
    document.addEventListener('touchend', handleTouchEnd, { passive: true })
    return () => {
      document.removeEventListener('touchstart', handleTouchStart)
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleTouchEnd)
    }
  }, [sidebarOpen])

  const planBadge = PLAN_BADGES[current_user?.effective_plan || 'free'] || PLAN_BADGES.free

  const sidebarContent = (
    <>
      <div className="p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-white tracking-tight">LendSolo</h1>
          <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded ${planBadge.bg} ${planBadge.text}`}>
            {planBadge.label}
          </span>
        </div>
        <p className="text-xs text-gray-500 mt-1">Loan Management</p>
      </div>

      <nav className="flex-1 px-3 space-y-1" role="navigation">
        {navItems.map((item) => {
          const isActive = currentPath.startsWith(item.href)
          const Icon = item.icon
          const locked = isGated(item.gate, current_user?.effective_plan || 'free')
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'text-white'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
              style={isActive ? { backgroundColor: 'rgba(52, 211, 153, 0.15)', color: '#34D399' } : {}}
            >
              <Icon />
              {item.name}
              {locked && <LockIcon />}
            </Link>
          )
        })}
      </nav>

      {/* Trial / Plan info */}
      <div className="px-3 pb-2">
        {current_user?.on_trial && (
          <Link
            href="/billing"
            className="block p-3 rounded-lg bg-gradient-to-r from-emerald-900/50 to-indigo-900/50 border border-emerald-800/30 mb-2"
          >
            <p className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider">Free Trial</p>
            <p className="text-xs text-gray-300 mt-0.5">
              {current_user.trial_days_remaining} day{current_user.trial_days_remaining !== 1 ? 's' : ''} remaining
            </p>
            <div className="h-1 bg-gray-700 rounded-full mt-2 overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full"
                style={{ width: `${Math.max(5, ((14 - current_user.trial_days_remaining) / 14) * 100)}%` }}
              />
            </div>
          </Link>
        )}
        {current_user?.trial_expired && (
          <Link
            href="/billing"
            className="block p-3 rounded-lg bg-red-950/50 border border-red-800/30 mb-2"
          >
            <p className="text-[10px] font-semibold text-red-400">Trial expired</p>
            <p className="text-xs text-gray-400 mt-0.5">Upgrade to keep creating loans</p>
          </Link>
        )}
        {current_user?.loan_limit && (
          <div className="px-3 py-2">
            <p className="text-[10px] text-gray-500">
              {current_user.active_loan_count} / {current_user.loan_limit} active loans
            </p>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-gray-800">
        <p className="text-xs text-gray-500">v1.0.0</p>
      </div>
    </>
  )

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Desktop Sidebar — hidden on mobile */}
      <aside className="hidden md:flex w-64 flex-shrink-0 flex-col" style={{ backgroundColor: '#0F1419' }}>
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar Drawer */}
      <div className="md:hidden">
        {/* Backdrop */}
        <div
          className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-200 ${
            sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          aria-hidden="true"
          onClick={closeSidebar}
        />
        {/* Drawer */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-[280px] flex flex-col transition-transform duration-200 ease-out ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
          style={{ backgroundColor: '#0F1419' }}
        >
          {sidebarContent}
        </aside>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Top Bar */}
        <div className="md:hidden h-14 flex items-center justify-between px-4 flex-shrink-0 z-30" style={{ backgroundColor: '#0F1419' }}>
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-white p-1"
            aria-label="Toggle navigation"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
          <span className="text-white font-bold text-lg tracking-tight">LendSolo</span>
          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
            <span className="text-emerald-700 font-medium text-sm">
              {current_user?.email?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
        </div>

        {/* Desktop Top bar */}
        <header className="hidden md:flex h-16 bg-white border-b border-gray-200 items-center justify-between px-6 flex-shrink-0">
          <h2 className="text-lg font-semibold text-gray-800">
            {current_user?.business_name || 'My Lending Business'}
          </h2>

          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800"
            >
              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                <span className="text-emerald-700 font-medium text-sm">
                  {current_user?.email?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <span>{current_user?.email}</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
              </svg>
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                <Link
                  href="/billing"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  Billing
                </Link>
                <Link
                  href="/settings"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  Settings
                </Link>
                <Link
                  href="/users/sign_out"
                  method="delete"
                  as="button"
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  Sign out
                </Link>
              </div>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
