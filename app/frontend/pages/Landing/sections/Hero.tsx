import { Link } from '@inertiajs/react'
import { useEffect, useRef } from 'react'

export default function Hero() {
  const counterRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    let count = 1247
    const interval = setInterval(() => {
      count += Math.floor(Math.random() * 3)
      if (counterRef.current) {
        counterRef.current.textContent = count.toLocaleString()
      }
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <section className="relative overflow-hidden" style={{ background: 'linear-gradient(180deg, #0E4D30 0%, #081C12 100%)' }}>
      {/* Background counter */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
        <span
          ref={counterRef}
          className="text-[20rem] sm:text-[28rem] lg:text-[36rem] font-mono font-bold text-white/[0.02] leading-none"
        >
          1,247
        </span>
      </div>

      {/* Subtle noise texture overlay */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\' opacity=\'1\'/%3E%3C/svg%3E")' }} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 sm:pt-40 lg:pt-48 pb-20 sm:pb-28 lg:pb-36">
        <div className="max-w-4xl">
          <h1 className="font-display text-4xl sm:text-5xl lg:text-7xl font-bold text-white leading-[1.1] tracking-tight">
            Stop managing your loans in{' '}
            <span className="relative inline-block">
              <span className="text-white/60">spreadsheets.</span>
              {/* Strikethrough line */}
              <span
                className="absolute left-0 right-0 top-1/2 h-[3px] sm:h-[4px] bg-white/50 -rotate-1"
                aria-hidden="true"
              />
            </span>
          </h1>

          <div className="mt-8 sm:mt-10 max-w-2xl space-y-4">
            <p className="text-lg sm:text-xl text-white/75 leading-relaxed font-body">
              You've got real money out there — $40K to a house flipper, $25K to a friend's rental rehab,
              another $60K on a bridge loan closing next week. Your spreadsheet doesn't know any of that is late.
              It doesn't warn you when one borrower is 70% of your capital. It can't tell you what you earned
              last year without an hour of manual math.
            </p>
            <p className="text-lg sm:text-xl text-white/80 font-medium font-body">
              LendSolo was built by a private lender who got tired of the same thing.
            </p>
          </div>

          <div className="mt-10 sm:mt-12 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <Link
              href="/tools/loan-amortization-calculator"
              className="inline-flex items-center gap-2 px-8 py-4 text-base font-semibold text-[#081C12] bg-[#34D399] hover:bg-[#2fc48d] rounded-xl transition-all shadow-[0_0_30px_rgba(52,211,153,0.3)] hover:shadow-[0_0_40px_rgba(52,211,153,0.4)]"
            >
              Try the free calculators
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <a
              href="#problem"
              className="inline-flex items-center gap-2 px-6 py-4 text-base text-white/70 hover:text-white transition-colors"
            >
              See how it works
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
