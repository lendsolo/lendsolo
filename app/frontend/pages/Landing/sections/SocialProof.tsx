const TESTIMONIALS = [
  {
    name: '[Name]',
    role: 'Private Lender',
    location: '[City]',
    stats: 'Managing 6 loans, $280K deployed',
    quote: '[Beta testimonial — to be filled in after launch]',
  },
  {
    name: '[Name]',
    role: 'Real Estate Investor',
    location: '[City]',
    stats: 'Managing 4 loans, $120K deployed',
    quote: '[Beta testimonial — to be filled in after launch]',
  },
  {
    name: '[Name]',
    role: 'Private Lender',
    location: '[City]',
    stats: 'Managing 9 loans, $450K deployed',
    quote: '[Beta testimonial — to be filled in after launch]',
  },
]

export default function SocialProof() {
  return (
    <section className="py-20 sm:py-28" style={{ backgroundColor: '#0E4D30' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center max-w-2xl mx-auto">
          <p className="text-sm font-semibold uppercase tracking-widest text-[#34D399] font-body">
            What beta users are saying
          </p>
          <h2 className="mt-4 text-3xl sm:text-4xl font-bold text-white font-display">
            We're in private beta with a small group of real private lenders.
          </h2>
          <p className="mt-4 text-lg text-white/70 font-body">Here's what they've told us.</p>
        </div>

        {/* Testimonial cards */}
        <div className="mt-12 sm:mt-16 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {TESTIMONIALS.map((t, i) => (
            <div
              key={i}
              className="bg-white/[0.06] border border-white/[0.08] rounded-2xl p-6 sm:p-8"
            >
              {/* Avatar placeholder */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                  <svg className="w-6 h-6 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{t.name}</p>
                  <p className="text-xs text-white/60">
                    {t.role} — {t.location}
                  </p>
                </div>
              </div>

              {/* Stats line */}
              <p className="mt-3 text-xs font-medium text-[#34D399]/80 font-mono">{t.stats}</p>

              {/* Quote */}
              <p className="mt-4 text-sm text-white/70 italic leading-relaxed font-body">
                "{t.quote}"
              </p>
            </div>
          ))}
        </div>

        {/* Beta CTA */}
        <div className="mt-12 sm:mt-16 text-center">
          <p className="text-lg text-white/70 font-body max-w-xl mx-auto">
            Want to be in the next beta cohort? We're looking for 15–20 micro-lenders currently managing loans in spreadsheets.
          </p>
          <button className="mt-6 inline-flex items-center gap-2 px-6 py-3 border border-white/30 hover:border-white/50 text-white text-sm font-medium rounded-xl transition-colors">
            Join the beta waitlist
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  )
}
