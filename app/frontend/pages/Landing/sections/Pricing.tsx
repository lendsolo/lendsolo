import { Link } from '@inertiajs/react'
import { useState } from 'react'

const TIERS = [
  {
    name: 'Solo',
    price: 29,
    description: 'For lenders just getting started',
    features: [
      'Up to 5 active loans',
      'Deal calculators + ROI tools',
      'Full amortization engine (standard, interest-only, balloon)',
      'Payment tracking + guardrails',
      'Dashboard & basic reports',
      'Spreadsheet import (CSV & Excel)',
    ],
    highlighted: false,
  },
  {
    name: 'Pro',
    price: 49,
    description: 'For active lenders running a real portfolio',
    badge: 'Best Value',
    features: [
      'Up to 25 active loans',
      'Everything in Solo',
      'CSV exports (payments & expenses)',
      'Branded PDF statements',
      'Automated email reminders',
      'Accountant-ready tax exports (.pdf, .csv, .qbo)',
    ],
    highlighted: true,
  },
]

function FundWaitlistCard() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return

    setStatus('submitting')
    try {
      const response = await fetch('/waitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
        body: JSON.stringify({ email: email.trim(), tier: 'fund' }),
      })
      const data = await response.json()
      if (data.success) {
        setStatus('success')
        setMessage(data.message)
      } else {
        setStatus('error')
        setMessage(data.message || 'Something went wrong.')
      }
    } catch {
      setStatus('error')
      setMessage('Something went wrong. Please try again.')
    }
  }

  return (
    <div className="rounded-2xl p-6 sm:p-8 flex flex-col bg-white border border-dashed border-[#D1D0C8] relative opacity-90">
      {/* Coming Soon badge */}
      <div className="absolute -top-3 right-4">
        <span className="px-3 py-1 bg-[#F5F0E6] text-[#8A7A50] text-xs font-bold rounded-full border border-[#E4DCC8]">
          Coming Soon
        </span>
      </div>

      <div>
        <h3 className="text-lg font-bold text-[#1C1C19] font-display">Fund</h3>
        <p className="mt-1 text-sm text-[#8A8A7E] font-body">Managing outside capital?</p>
      </div>

      <div className="mt-6 flex items-baseline gap-1">
        <span className="text-4xl font-bold text-[#8A8A7E] font-mono line-through decoration-[#C4C4BC]">$99</span>
        <span className="text-sm text-[#8A8A7E] font-body">/mo</span>
      </div>

      <div className="mt-6 flex-1">
        <p className="text-sm text-[#4D4D45] font-body leading-relaxed">
          The Fund tier is built for lenders who raise capital from investors — multi-investor tracking,
          investor portals, IRR reporting, and compliance tools. We're building it now.
        </p>
      </div>

      <div className="mt-8">
        {status === 'success' ? (
          <div className="text-center py-4 px-3 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0]">
            <svg className="w-6 h-6 text-[#34D399] mx-auto mb-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <p className="text-sm font-semibold text-[#065F46]">{message}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="w-full text-sm px-3.5 py-3 rounded-xl border border-[#E4E3DB] bg-white text-[#1C1C19] placeholder-[#B0B0A6] focus:outline-none focus:ring-2 focus:ring-[#34D399] focus:border-[#34D399] font-body"
            />
            <button
              type="submit"
              disabled={status === 'submitting'}
              className="w-full py-3 rounded-xl text-sm font-semibold bg-[#1C1C19] text-white hover:bg-[#2a2a26] transition-colors disabled:opacity-50"
            >
              {status === 'submitting' ? 'Joining...' : 'Join the waitlist'}
            </button>
            {status === 'error' && (
              <p className="text-xs text-red-600 text-center font-body">{message}</p>
            )}
          </form>
        )}
        <p className="mt-3 text-[11px] text-[#B0B0A6] text-center font-body">
          We'll notify you when Fund launches. No spam, ever.
        </p>
      </div>
    </div>
  )
}

export default function Pricing() {
  return (
    <section id="pricing" className="py-20 sm:py-28" style={{ backgroundColor: '#F6F5F0' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center max-w-2xl mx-auto">
          <p className="text-sm font-semibold uppercase tracking-widest text-[#1A7A50] font-body">
            Simple pricing. No surprises.
          </p>
          <h2 className="mt-4 text-3xl sm:text-4xl font-bold text-[#1C1C19] font-display">
            Start with the free calculators. Pay when you're tracking real loans.
          </h2>
        </div>

        {/* Cards - On mobile, Pro shows first */}
        <div className="mt-12 sm:mt-16 grid sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
          {/* Mobile reorder: Pro first */}
          {[TIERS[1], TIERS[0]].map((tier) => (
            <div
              key={tier.name}
              className={`rounded-2xl p-6 sm:p-8 flex flex-col ${
                tier.highlighted
                  ? 'bg-white border-2 border-[#34D399] shadow-lg order-first lg:order-none relative'
                  : 'bg-white border border-[#E4E3DB]'
              }`}
            >
              {tier.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="px-3 py-1 bg-[#34D399] text-[#081C12] text-xs font-bold rounded-full">
                    {tier.badge}
                  </span>
                </div>
              )}

              <div>
                <h3 className="text-lg font-bold text-[#1C1C19] font-display">{tier.name}</h3>
                <p className="mt-1 text-sm text-[#8A8A7E] font-body">{tier.description}</p>
              </div>

              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-4xl font-bold text-[#1A7A50] font-mono">${tier.price}</span>
                <span className="text-sm text-[#8A8A7E] font-body">/mo</span>
              </div>

              <ul className="mt-6 space-y-3 flex-1">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-[#4D4D45] font-body">
                    <svg className="w-4 h-4 text-[#34D399] shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                href="/users/sign_up"
                className={`mt-8 block text-center py-3 rounded-xl text-sm font-semibold transition-colors ${
                  tier.highlighted
                    ? 'bg-[#34D399] text-[#081C12] hover:bg-[#2fc48d] shadow-[0_0_20px_rgba(52,211,153,0.2)]'
                    : 'bg-[#1C1C19] text-white hover:bg-[#2a2a26]'
                }`}
              >
                Start free trial
              </Link>
            </div>
          ))}

          {/* Fund - Coming Soon Waitlist */}
          <FundWaitlistCard />
        </div>

        {/* Free tier callout */}
        <div className="mt-10 text-center space-y-2">
          <p className="text-sm text-[#4D4D45] font-body">
            The deal calculator, ROI tool, and loan comparison tool are{' '}
            <span className="font-semibold text-[#1A7A50]">free forever</span> — no account required.
            Start there. You'll know when you're ready for the rest.
          </p>
          <p className="text-xs text-[#8A8A7E] font-body">
            All paid plans include a 14-day free trial. No credit card required to start.
          </p>
        </div>
      </div>
    </section>
  )
}
