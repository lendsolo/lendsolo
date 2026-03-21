const SCREENSHOTS = [
  {
    label: 'Dashboard Overview',
    caption:
      "Your whole portfolio at a glance. Capital deployed, interest earned, what's due next week — without opening a single spreadsheet.",
    description:
      'Dark-sidebar layout with Dashboard, Loans, Payments, Expenses, Settings nav. Four stat cards: Capital Deployed ($185,000), Available Capital ($65,000), Interest Earned YTD ($14,200), Active Loans (4). Bar chart of monthly interest income. Upcoming payments panel with 3 loans. Portfolio allocation bar.',
    mockContent: (
      <div className="bg-[#0F1419] rounded-lg p-4 text-sm">
        <div className="flex gap-3">
          {/* Sidebar mock */}
          <div className="hidden sm:flex flex-col gap-2 w-36 shrink-0">
            {['Dashboard', 'Loans', 'Payments', 'Expenses', 'Settings'].map((item, i) => (
              <div key={item} className={`px-3 py-2 rounded-md text-xs ${i === 0 ? 'bg-white/10 text-[#34D399]' : 'text-white/60'}`}>
                {item}
              </div>
            ))}
          </div>
          {/* Main content mock */}
          <div className="flex-1 space-y-3">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
              {[
                ['Capital Deployed', '$185,000'],
                ['Available Capital', '$65,000'],
                ['Interest Earned YTD', '$14,200'],
                ['Active Loans', '4'],
              ].map(([label, value]) => (
                <div key={label} className="bg-white/5 rounded-lg p-3">
                  <div className="text-[10px] text-white/60">{label}</div>
                  <div className="text-sm font-bold text-white mt-1 font-mono">{value}</div>
                </div>
              ))}
            </div>
            <div className="bg-white/5 rounded-lg p-3 h-24 flex items-end gap-1">
              {[40, 65, 55, 78, 60, 72].map((h, i) => (
                <div key={i} className="flex-1 bg-[#34D399]/60 rounded-t" style={{ height: `${h}%` }} />
              ))}
            </div>
            <div className="space-y-1.5">
              {['Marcus W. — $3,987 due Mar 15', 'Sarah K. — $1,250 due Mar 18', 'Tom R. — $2,100 due Mar 22'].map((item) => (
                <div key={item} className="bg-white/5 rounded-md px-3 py-2 text-xs text-white/70">{item}</div>
              ))}
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    label: 'Loan Detail View',
    caption:
      'Every loan has its own page. Amortization schedule, payment history, collateral notes, and smart alerts if something looks off.',
    description:
      'Loan detail for "Marcus Williams — Bridge Loan." Active badge, key metrics, repayment progress bar at 42%, amortization table, capital concentration warning.',
    mockContent: (
      <div className="bg-white rounded-lg p-4 text-sm">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-xs text-gray-400">Loan Detail</div>
            <div className="font-bold text-gray-900">Marcus Williams — Bridge Loan</div>
          </div>
          <span className="px-2 py-1 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-full">Active</span>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-xs text-amber-800 mb-3">
          ⚠️ This loan represents 62% of your total capital.
        </div>
        <div className="grid grid-cols-4 gap-2 mb-3">
          {[['Principal', '$45,000'], ['Rate', '11%'], ['Term', '12 mo'], ['Monthly', '$3,987']].map(([k, v]) => (
            <div key={k} className="text-center">
              <div className="text-[10px] text-gray-400">{k}</div>
              <div className="text-xs font-bold text-gray-900 font-mono">{v}</div>
            </div>
          ))}
        </div>
        <div className="mb-3">
          <div className="flex justify-between text-[10px] text-gray-400 mb-1"><span>Repayment Progress</span><span>42%</span></div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-[#34D399] rounded-full" style={{ width: '42%' }} />
          </div>
        </div>
        <div className="space-y-1">
          {[1, 2, 3, 4, 5].map((m) => (
            <div key={m} className={`flex justify-between px-2 py-1.5 rounded text-[10px] ${m <= 5 ? 'bg-emerald-50 text-emerald-700' : 'text-gray-500'}`}>
              <span>Month {m}</span>
              <span className="font-mono">$3,987</span>
              <span className="font-mono text-emerald-600">$3,575 P</span>
              <span className="font-mono text-indigo-500">$412 I</span>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    label: 'Amortization Schedule',
    caption:
      "Exact principal/interest splits for every payment, automatically. Share the schedule with your borrower at closing — or download it as a PDF.",
    description:
      'Clean table: Month 1–12, $45,000 at 11%. Paid rows green, current amber, future standard. Total Interest: $2,638. Download PDF button.',
    mockContent: (
      <div className="bg-white rounded-lg p-4 text-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="font-bold text-gray-900 text-xs">Amortization Schedule</div>
          <button className="px-3 py-1 bg-gray-100 text-gray-600 text-[10px] font-medium rounded-md">Download PDF</button>
        </div>
        <table className="w-full text-[10px]">
          <thead>
            <tr className="border-b border-gray-100 text-gray-400">
              <th className="text-left py-1.5 font-medium">Month</th>
              <th className="text-left py-1.5 font-medium">Due Date</th>
              <th className="text-right py-1.5 font-medium">Payment</th>
              <th className="text-right py-1.5 font-medium">Principal</th>
              <th className="text-right py-1.5 font-medium">Interest</th>
              <th className="text-right py-1.5 font-medium">Balance</th>
            </tr>
          </thead>
          <tbody className="font-mono">
            {[
              { m: 1, d: 'Jan 15', paid: true, p: '$3,575', i: '$412', b: '$41,425' },
              { m: 2, d: 'Feb 15', paid: true, p: '$3,608', i: '$379', b: '$37,817' },
              { m: 3, d: 'Mar 15', paid: true, p: '$3,641', i: '$346', b: '$34,176' },
              { m: 4, d: 'Apr 15', paid: true, p: '$3,674', i: '$313', b: '$30,502' },
              { m: 5, d: 'May 15', paid: true, p: '$3,708', i: '$279', b: '$26,794' },
              { m: 6, d: 'Jun 15', paid: false, current: true, p: '$3,742', i: '$245', b: '$23,052' },
              { m: 7, d: 'Jul 15', paid: false, p: '$3,776', i: '$211', b: '$19,276' },
            ].map((row) => (
              <tr key={row.m} className={`border-b border-gray-50 ${row.paid ? 'bg-emerald-50/50 text-emerald-700' : row.current ? 'bg-amber-50/50 text-amber-700' : 'text-gray-500'}`}>
                <td className="py-1.5">{row.m}</td>
                <td className="py-1.5">{row.d}</td>
                <td className="text-right py-1.5">$3,987</td>
                <td className="text-right py-1.5">{row.p}</td>
                <td className="text-right py-1.5">{row.i}</td>
                <td className="text-right py-1.5">{row.b}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-2 pt-2 border-t border-gray-100 flex justify-between text-[10px]">
          <span className="text-gray-400">Total Interest</span>
          <span className="font-mono font-bold text-gray-900">$2,638</span>
        </div>
      </div>
    ),
  },
]

export default function ProductShowcase() {
  return (
    <section className="py-20 sm:py-28" style={{ backgroundColor: '#F6F5F0' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-[#1A7A50] font-body">
            What it actually looks like
          </p>
          <h2 className="mt-4 text-3xl sm:text-4xl font-bold text-[#1C1C19] font-display leading-tight">
            Clean. Fast. Built for someone managing a handful of loans.
          </h2>
          <p className="mt-4 text-lg text-[#4D4D45] font-body">
            Not a mortgage servicer with 10,000.
          </p>
        </div>

        {/* Screenshots */}
        <div className="mt-16 space-y-20 sm:space-y-28">
          {SCREENSHOTS.map((shot, i) => {
            const reverse = i % 2 === 1
            return (
              <div
                key={shot.label}
                className={`flex flex-col ${reverse ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-8 lg:gap-16`}
              >
                {/* Screenshot */}
                <div className="flex-1 w-full">
                  <div className="bg-white rounded-2xl shadow-xl border border-[#E4E3DB] overflow-hidden">
                    {/* Browser chrome */}
                    <div className="bg-gray-50 border-b border-gray-200 px-4 py-2.5 flex items-center gap-2">
                      <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-400" />
                        <div className="w-3 h-3 rounded-full bg-yellow-400" />
                        <div className="w-3 h-3 rounded-full bg-green-400" />
                      </div>
                      <div className="flex-1 mx-4">
                        <div className="bg-white border border-gray-200 rounded-md px-3 py-1 text-xs text-gray-400 max-w-xs">
                          app.lendsolo.com
                        </div>
                      </div>
                    </div>
                    {/* Content */}
                    <div className="p-2 sm:p-3">
                      {shot.mockContent}
                    </div>
                  </div>
                </div>

                {/* Text */}
                <div className="flex-1 lg:max-w-md">
                  <p className="text-xs font-semibold uppercase tracking-widest text-[#8A8A7E] font-body">
                    {shot.label}
                  </p>
                  <p className="mt-4 text-lg text-[#4D4D45] leading-relaxed font-body">
                    {shot.caption}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
