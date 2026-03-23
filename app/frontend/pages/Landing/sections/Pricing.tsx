import { Link } from '@inertiajs/react'
import { useState } from 'react'

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
    <div className="bg-white border border-dashed border-[#d4d2c9] rounded-[14px] p-7 sm:p-9 flex flex-col relative opacity-90">
      <span className="font-mono text-[10px] uppercase tracking-[1px] text-[#b45309] font-medium">Coming Soon</span>
      <h3 className="text-xl font-bold text-[#0f1a2e] mt-1">Fund</h3>
      <p className="text-sm text-[#5a6578] mt-1">Managing outside capital?</p>
      <div className="mt-5 flex items-baseline gap-1">
        <span className="font-display text-5xl text-[#0f1a2e]">$99</span>
        <span className="text-base text-[#5a6578]">/mo</span>
      </div>
      <p className="mt-4 text-sm text-[#5a6578] leading-relaxed flex-1">
        The Fund tier is built for lenders who raise capital from investors — multi-investor tracking, investor portals, IRR reporting, and compliance tools. We're building it now.
      </p>

      <div className="mt-6">
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
              className="w-full text-sm px-3.5 py-3 rounded-xl border border-[#e2e0d8] bg-white text-[#0f1a2e] placeholder-[#8c95a6] focus:outline-none focus:ring-2 focus:ring-[#1a7a4c] focus:border-[#1a7a4c]"
            />
            <button
              type="submit"
              disabled={status === 'submitting'}
              className="w-full py-3.5 rounded-lg text-[15px] font-semibold bg-transparent text-[#0f1a2e] border-[1.5px] border-[#c5c3ba] hover:border-[#5a6578] hover:bg-[#f8f7f4] transition-all disabled:opacity-50"
            >
              {status === 'submitting' ? 'Joining...' : 'Join the waitlist'}
            </button>
            {status === 'error' && (
              <p className="text-xs text-red-600 text-center">{message}</p>
            )}
          </form>
        )}
        <p className="mt-3 text-xs text-[#8c95a6] text-center">
          We'll notify you when Fund launches. No spam, ever.
        </p>
      </div>
    </div>
  )
}

export default function Pricing() {
  const [isAnnual, setIsAnnual] = useState(false)

  return (
    <section id="pricing" className="py-20 sm:py-24" style={{ backgroundColor: '#f8f7f4' }}>
      <div className="max-w-[1140px] mx-auto px-8">
        <p className="text-[11px] font-mono uppercase tracking-[2px] text-[#1a7a4c] font-medium mb-3">
          Pricing
        </p>
        <h2 className="font-display text-3xl sm:text-[40px] leading-[1.15] text-[#0f1a2e] tracking-tight mb-4">
          Simple pricing. No surprises.
        </h2>
        <p className="text-[17px] leading-relaxed text-[#5a6578] max-w-[600px] mb-9">
          Start with the free calculators. Pay when you're tracking real loans.
        </p>

        {/* Billing toggle */}
        <div className="flex items-center gap-3 mb-9">
          <span
            className={`text-sm ${!isAnnual ? 'font-semibold text-[#0f1a2e]' : 'font-medium text-[#8c95a6]'}`}
          >
            Monthly
          </span>
          <button
            onClick={() => setIsAnnual(!isAnnual)}
            className="relative w-12 h-[26px] rounded-full bg-[#1a7a4c] cursor-pointer transition-colors"
          >
            <span
              className={`absolute top-[3px] w-5 h-5 rounded-full bg-white shadow-sm transition-all duration-200 ${
                isAnnual ? 'left-[25px]' : 'left-[3px]'
              }`}
            />
          </button>
          <span
            className={`text-sm ${isAnnual ? 'font-semibold text-[#0f1a2e]' : 'font-medium text-[#8c95a6]'}`}
          >
            Annual
          </span>
          <span className="font-mono text-[11px] bg-[#e8f5ee] text-[#1a7a4c] px-2.5 py-0.5 rounded-full font-medium">
            2 months free
          </span>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-[1000px]">
          {/* Pro — Best Value (featured, first) */}
          <div className="bg-white border-[1.5px] border-[#1a7a4c] rounded-[14px] p-7 sm:p-9 flex flex-col relative shadow-[0_0_0_1px_#1a7a4c,0_8px_32px_rgba(26,122,76,0.12)] order-first lg:order-none hover:-translate-y-1 hover:shadow-[0_0_0_1px_#1a7a4c,0_8px_32px_rgba(26,122,76,0.18)] transition-all">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="px-4 py-1 bg-[#1a7a4c] text-white font-mono text-[10px] uppercase tracking-[1px] rounded-full font-medium">
                Best Value
              </span>
            </div>
            <h3 className="text-xl font-bold text-[#0f1a2e]">Pro</h3>
            <p className="text-sm text-[#5a6578] mt-1">For active lenders running a real portfolio</p>
            <div className="mt-5 flex items-baseline gap-1">
              <span className="font-display text-5xl text-[#0f1a2e]">${isAnnual ? '41' : '49'}</span>
              <span className="text-base text-[#5a6578]">/mo</span>
            </div>
            {isAnnual && (
              <p className="text-sm text-[#5a6578] mt-1">$490/year — save $98</p>
            )}
            <p className="text-sm text-[#5a6578] mt-1">Up to 25 active loans</p>
            <ul className="mt-6 space-y-2 flex-1">
              {[
                'Everything in Solo',
                'CSV exports (payments & expenses)',
                'Branded PDF statements',
                'Automated email reminders',
                'Accountant-ready tax exports (.pdf, .csv, .qbo)',
              ].map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-[15px] text-[#2d3a4f] leading-relaxed">
                  <span className="text-[#1a7a4c] font-bold text-sm mt-0.5 min-w-4">✓</span>
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href="/signup"
              className="mt-7 block text-center py-3.5 rounded-lg text-[15px] font-semibold bg-[#0f1a2e] text-white hover:-translate-y-0.5 hover:shadow-lg transition-all"
            >
              Start free trial
            </Link>
          </div>

          {/* Solo */}
          <div className="bg-white border-[1.5px] border-[#d4d2c9] rounded-[14px] p-7 sm:p-9 flex flex-col shadow-[0_2px_12px_rgba(0,0,0,0.06),0_1px_3px_rgba(0,0,0,0.04)] hover:-translate-y-1 hover:shadow-[0_8px_32px_rgba(0,0,0,0.1),0_2px_6px_rgba(0,0,0,0.05)] transition-all">
            <h3 className="text-xl font-bold text-[#0f1a2e]">Solo</h3>
            <p className="text-sm text-[#5a6578] mt-1">For lenders just getting started</p>
            <div className="mt-5 flex items-baseline gap-1">
              <span className="font-display text-5xl text-[#0f1a2e]">${isAnnual ? '24' : '29'}</span>
              <span className="text-base text-[#5a6578]">/mo</span>
            </div>
            {isAnnual && (
              <p className="text-sm text-[#5a6578] mt-1">$290/year — save $58</p>
            )}
            <p className="text-sm text-[#5a6578] mt-1">Up to 5 active loans</p>
            <ul className="mt-6 space-y-2 flex-1">
              {[
                'Deal calculators + ROI tools',
                'Full amortization engine (standard, interest-only, balloon)',
                'Payment tracking + guardrails',
                'Dashboard & basic reports',
                'Spreadsheet import (CSV & Excel)',
              ].map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-[15px] text-[#2d3a4f] leading-relaxed">
                  <span className="text-[#1a7a4c] font-bold text-sm mt-0.5 min-w-4">✓</span>
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href="/signup"
              className="mt-7 block text-center py-3.5 rounded-lg text-[15px] font-semibold bg-transparent text-[#0f1a2e] border-[1.5px] border-[#c5c3ba] hover:border-[#5a6578] hover:bg-[#f8f7f4] transition-all"
            >
              Start free trial
            </Link>
          </div>

          {/* Fund — Coming Soon */}
          <FundWaitlistCard />
        </div>

        {/* Footer note */}
        <p className="mt-6 text-[13px] text-[#8c95a6] leading-relaxed max-w-[800px]">
          The deal calculator, ROI tool, and loan comparison tool are free forever — no account required. Start there. You'll know when you're ready for the rest.<br />
          All paid plans include a 14-day free trial. No credit card required to start.
        </p>
      </div>
    </section>
  )
}
