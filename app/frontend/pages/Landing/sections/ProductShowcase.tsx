import { useState } from 'react'

const TABS = ['Dashboard', 'Loan Detail', 'Amortization'] as const

function Sidebar({ activeItem }: { activeItem: string }) {
  const navItems = ['Dashboard', 'Loans', 'Borrowers', 'Payments', 'Expenses', 'Import', 'Reports', 'Exports', 'Calculators', 'Billing', 'Settings']
  return (
    <>
      <rect x="0" y="0" width="230" height="620" fill="#0c1a16" />
      <rect x="0" y="0" width="230" height="620" fill="rgba(0,0,0,0.65)" />
      <text x="24" y="38" fontFamily="sans-serif" fontSize="18" fill="white" fontWeight="bold" letterSpacing="-0.3">LendSolo</text>
      <rect x="170" y="22" width="38" height="22" rx="5" fill="rgba(99,102,241,0.7)" />
      <text x="189" y="38" fontFamily="sans-serif" fontSize="10" fill="white" textAnchor="middle" fontWeight="600">Pro</text>
      <text x="24" y="56" fontFamily="sans-serif" fontSize="11" fill="rgba(255,255,255,0.3)">Loan Management</text>
      {navItems.map((item, i) => {
        const y = 74 + i * 38
        const isActive = item === activeItem
        return (
          <g key={item}>
            {isActive && <rect x="12" y={y} width="206" height="40" rx="8" fill="rgba(34,197,94,0.12)" />}
            <text x="52" y={y + 25} fontFamily="sans-serif" fontSize="13" fill={isActive ? '#22c55e' : 'rgba(255,255,255,0.4)'} fontWeight={isActive ? '500' : '400'}>{item}</text>
          </g>
        )
      })}
      <line x1="230" y1="0" x2="230" y2="620" stroke="rgba(255,255,255,0.06)" />
    </>
  )
}

function DashboardScreen() {
  return (
    <svg viewBox="0 0 1100 620" xmlns="http://www.w3.org/2000/svg" className="w-full block">
      <defs>
        <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#22c55e" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#22c55e" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <rect width="1100" height="620" fill="#111827" />
      <Sidebar activeItem="Dashboard" />

      <text x="262" y="46" fontFamily="Georgia,serif" fontSize="22" fill="white" fontWeight="bold">Portfolio Overview</text>
      <text x="262" y="66" fontFamily="sans-serif" fontSize="12" fill="rgba(255,255,255,0.4)">March 2026</text>

      {/* Metric cards */}
      <rect x="262" y="88" width="195" height="96" rx="12" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
      <text x="282" y="116" fontFamily="sans-serif" fontSize="11" fill="rgba(255,255,255,0.4)">DEPLOYED</text>
      <text x="282" y="148" fontFamily="Georgia,serif" fontSize="28" fill="white">$187,500</text>
      <text x="282" y="170" fontFamily="monospace" fontSize="11" fill="#22c55e">↑ 12% from last month</text>

      <rect x="473" y="88" width="195" height="96" rx="12" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
      <text x="493" y="116" fontFamily="sans-serif" fontSize="11" fill="rgba(255,255,255,0.4)">ACTIVE LOANS</text>
      <text x="493" y="148" fontFamily="Georgia,serif" fontSize="28" fill="white">6</text>
      <text x="493" y="170" fontFamily="monospace" fontSize="11" fill="rgba(255,255,255,0.5)">avg 10.8% rate</text>

      <rect x="684" y="88" width="195" height="96" rx="12" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
      <text x="704" y="116" fontFamily="sans-serif" fontSize="11" fill="rgba(255,255,255,0.4)">MONTHLY INCOME</text>
      <text x="704" y="148" fontFamily="Georgia,serif" fontSize="28" fill="white">$1,842</text>
      <text x="704" y="170" fontFamily="monospace" fontSize="11" fill="#22c55e">$22,104 annualized</text>

      <rect x="895" y="88" width="185" height="96" rx="12" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
      <text x="915" y="116" fontFamily="sans-serif" fontSize="11" fill="rgba(255,255,255,0.4)">AVG LTV</text>
      <text x="915" y="148" fontFamily="Georgia,serif" fontSize="28" fill="white">68%</text>
      <rect x="915" y="158" width="145" height="6" rx="3" fill="rgba(255,255,255,0.08)" />
      <rect x="915" y="158" width="99" height="6" rx="3" fill="#22c55e" opacity="0.7" />

      {/* Chart */}
      <rect x="262" y="208" width="400" height="240" rx="12" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
      <text x="282" y="236" fontFamily="sans-serif" fontSize="13" fill="rgba(255,255,255,0.7)" fontWeight="600">Interest Income</text>
      <text x="622" y="236" fontFamily="sans-serif" fontSize="11" fill="rgba(255,255,255,0.3)" textAnchor="end">Last 6 months</text>
      <polyline points="302,400 358,385 414,375 470,358 526,340 582,320 638,305" fill="none" stroke="#22c55e" strokeWidth="2" opacity="0.8" />
      <path d="M302,400 L358,385 L414,375 L470,358 L526,340 L582,320 L638,305 L638,430 L302,430 Z" fill="url(#g1)" />
      <line x1="302" y1="430" x2="638" y2="430" stroke="rgba(255,255,255,0.06)" />
      {['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'].map((m, i) => (
        <text key={m} x={302 + i * 56} y="444" fontFamily="monospace" fontSize="9" fill="rgba(255,255,255,0.25)">{m}</text>
      ))}
      {[[302, 400], [358, 385], [414, 375], [470, 358], [526, 340], [582, 320]].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="4" fill="#111827" stroke="#22c55e" strokeWidth="2" />
      ))}
      <circle cx="638" cy="305" r="4" fill="#22c55e" stroke="#22c55e" strokeWidth="2" />

      {/* Guardrails */}
      <rect x="682" y="208" width="398" height="240" rx="12" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
      <text x="702" y="236" fontFamily="sans-serif" fontSize="13" fill="rgba(255,255,255,0.7)" fontWeight="600">Guardrails</text>

      <rect x="702" y="252" width="358" height="52" rx="8" fill="rgba(245,158,11,0.08)" stroke="rgba(245,158,11,0.2)" strokeWidth="1" />
      <circle cx="722" cy="278" r="8" fill="rgba(245,158,11,0.2)" />
      <text x="722" y="282" fontSize="10" fill="#f59e0b" textAnchor="middle">!</text>
      <text x="740" y="274" fontFamily="sans-serif" fontSize="12" fill="rgba(255,255,255,0.7)">High concentration: Baker loan is 32%</text>
      <text x="740" y="292" fontFamily="monospace" fontSize="10" fill="rgba(255,255,255,0.3)">{'Recommended: <25% per borrower'}</text>

      <rect x="702" y="316" width="358" height="52" rx="8" fill="rgba(34,197,94,0.06)" stroke="rgba(34,197,94,0.15)" strokeWidth="1" />
      <circle cx="722" cy="342" r="8" fill="rgba(34,197,94,0.2)" />
      <text x="722" y="346" fontSize="10" fill="#22c55e" textAnchor="middle">✓</text>
      <text x="740" y="338" fontFamily="sans-serif" fontSize="12" fill="rgba(255,255,255,0.7)">LTV ratios within safe range</text>
      <text x="740" y="356" fontFamily="monospace" fontSize="10" fill="rgba(255,255,255,0.3)">All loans under 75% LTV threshold</text>

      <rect x="702" y="380" width="358" height="52" rx="8" fill="rgba(34,197,94,0.06)" stroke="rgba(34,197,94,0.15)" strokeWidth="1" />
      <circle cx="722" cy="406" r="8" fill="rgba(34,197,94,0.2)" />
      <text x="722" y="410" fontSize="10" fill="#22c55e" textAnchor="middle">✓</text>
      <text x="740" y="402" fontFamily="sans-serif" fontSize="12" fill="rgba(255,255,255,0.7)">No overdue payments</text>
      <text x="740" y="420" fontFamily="monospace" fontSize="10" fill="rgba(255,255,255,0.3)">Next payment due: Apr 1 — Rivera ($625)</text>

      {/* Loan table */}
      <rect x="262" y="468" width="818" height="140" rx="12" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
      <text x="282" y="496" fontFamily="sans-serif" fontSize="13" fill="rgba(255,255,255,0.7)" fontWeight="600">Active Loans</text>
      {[['BORROWER', 282], ['PRINCIPAL', 440], ['RATE', 570], ['TYPE', 650], ['REMAINING', 780], ['STATUS', 920]].map(([label, x]) => (
        <text key={label as string} x={x as number} y="524" fontFamily="monospace" fontSize="10" fill="rgba(255,255,255,0.25)">{label}</text>
      ))}
      <line x1="282" y1="532" x2="1060" y2="532" stroke="rgba(255,255,255,0.06)" />

      <text x="282" y="554" fontFamily="sans-serif" fontSize="12" fill="rgba(255,255,255,0.8)">Baker, T.</text>
      <text x="440" y="554" fontFamily="monospace" fontSize="12" fill="rgba(255,255,255,0.6)">$60,000</text>
      <text x="570" y="554" fontFamily="monospace" fontSize="12" fill="rgba(255,255,255,0.6)">11.0%</text>
      <text x="650" y="554" fontFamily="sans-serif" fontSize="11" fill="rgba(255,255,255,0.4)">Interest-Only</text>
      <text x="780" y="554" fontFamily="monospace" fontSize="12" fill="rgba(255,255,255,0.6)">$60,000</text>
      <rect x="920" y="542" width="66" height="20" rx="4" fill="rgba(34,197,94,0.12)" />
      <text x="953" y="556" fontFamily="monospace" fontSize="10" fill="#22c55e" textAnchor="middle">Current</text>

      <text x="282" y="580" fontFamily="sans-serif" fontSize="12" fill="rgba(255,255,255,0.8)">Rivera, M.</text>
      <text x="440" y="580" fontFamily="monospace" fontSize="12" fill="rgba(255,255,255,0.6)">$45,000</text>
      <text x="570" y="580" fontFamily="monospace" fontSize="12" fill="rgba(255,255,255,0.6)">10.5%</text>
      <text x="650" y="580" fontFamily="sans-serif" fontSize="11" fill="rgba(255,255,255,0.4)">Standard</text>
      <text x="780" y="580" fontFamily="monospace" fontSize="12" fill="rgba(255,255,255,0.6)">$38,210</text>
      <rect x="920" y="568" width="66" height="20" rx="4" fill="rgba(34,197,94,0.12)" />
      <text x="953" y="582" fontFamily="monospace" fontSize="10" fill="#22c55e" textAnchor="middle">Current</text>

      <text x="282" y="600" fontFamily="sans-serif" fontSize="12" fill="rgba(255,255,255,0.55)">+ 4 more loans</text>
    </svg>
  )
}

function LoanDetailScreen() {
  return (
    <svg viewBox="0 0 1100 620" xmlns="http://www.w3.org/2000/svg" className="w-full block">
      <rect width="1100" height="620" fill="#111827" />
      <Sidebar activeItem="Loans" />

      <text x="262" y="42" fontFamily="sans-serif" fontSize="12" fill="rgba(255,255,255,0.35)">Loans ›</text>
      <text x="262" y="70" fontFamily="Georgia,serif" fontSize="22" fill="white" fontWeight="bold">Baker, Thomas — Fix &amp; Flip Bridge</text>
      <rect x="680" y="52" width="100" height="30" rx="6" fill="rgba(34,197,94,0.12)" stroke="rgba(34,197,94,0.3)" strokeWidth="1" />
      <text x="730" y="72" fontFamily="monospace" fontSize="11" fill="#22c55e" textAnchor="middle">Current</text>
      <rect x="795" y="52" width="120" height="30" rx="6" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
      <text x="855" y="72" fontFamily="sans-serif" fontSize="11" fill="rgba(255,255,255,0.6)" textAnchor="middle">Record Payment</text>

      {/* Info cards */}
      {[
        { label: 'PRINCIPAL', value: '$60,000', x: 262, w: 155 },
        { label: 'RATE', value: '11.0%', x: 433, w: 125 },
        { label: 'TERM', value: '12 mo', x: 574, w: 125 },
        { label: 'MONTHLY PMT', value: '$550', x: 715, w: 155, color: '#22c55e' },
        { label: 'LTV', value: '72%', x: 886, w: 125, color: '#f59e0b' },
      ].map((card) => (
        <g key={card.label}>
          <rect x={card.x} y="98" width={card.w} height="80" rx="10" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
          <text x={card.x + 18} y="120" fontFamily="monospace" fontSize="10" fill="rgba(255,255,255,0.3)">{card.label}</text>
          <text x={card.x + 18} y="148" fontFamily="Georgia,serif" fontSize="22" fill={card.color || 'white'}>{card.value}</text>
        </g>
      ))}

      {/* Payment history */}
      <rect x="262" y="200" width="510" height="280" rx="12" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
      <text x="282" y="228" fontFamily="sans-serif" fontSize="13" fill="rgba(255,255,255,0.7)" fontWeight="600">Payment History</text>
      {[['DATE', 282], ['AMOUNT', 410], ['INTEREST', 520], ['PRINCIPAL', 640]].map(([label, x]) => (
        <text key={label as string} x={x as number} y="260" fontFamily="monospace" fontSize="10" fill="rgba(255,255,255,0.25)">{label}</text>
      ))}
      <line x1="282" y1="268" x2="752" y2="268" stroke="rgba(255,255,255,0.06)" />
      {[
        { date: 'Mar 1, 2026', y: 290 },
        { date: 'Feb 1, 2026', y: 316 },
        { date: 'Jan 1, 2026', y: 342 },
        { date: 'Dec 1, 2025', y: 368 },
      ].map((row) => (
        <g key={row.date}>
          <text x="282" y={row.y} fontFamily="sans-serif" fontSize="12" fill="rgba(255,255,255,0.6)">{row.date}</text>
          <text x="410" y={row.y} fontFamily="monospace" fontSize="12" fill="rgba(255,255,255,0.8)">$550.00</text>
          <text x="520" y={row.y} fontFamily="monospace" fontSize="12" fill="rgba(255,255,255,0.5)">$550.00</text>
          <text x="640" y={row.y} fontFamily="monospace" fontSize="12" fill="rgba(255,255,255,0.5)">$0.00</text>
        </g>
      ))}
      <text x="282" y="404" fontFamily="sans-serif" fontSize="11" fill="rgba(255,255,255,0.25)">Interest-only — balloon due Nov 2026</text>
      <rect x="282" y="420" width="470" height="40" rx="8" fill="rgba(34,197,94,0.06)" />
      <text x="300" y="446" fontFamily="sans-serif" fontSize="12" fill="#22c55e">Total interest earned: $2,200.00 · 4 of 12 payments received</text>

      {/* Collateral */}
      <rect x="790" y="200" width="290" height="130" rx="12" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
      <text x="810" y="228" fontFamily="sans-serif" fontSize="13" fill="rgba(255,255,255,0.7)" fontWeight="600">Collateral</text>
      <text x="810" y="254" fontFamily="sans-serif" fontSize="12" fill="rgba(255,255,255,0.5)">1247 Oak St, Springfield</text>
      <text x="810" y="274" fontFamily="sans-serif" fontSize="12" fill="rgba(255,255,255,0.5)">Appraised: $83,000</text>
      <text x="810" y="294" fontFamily="sans-serif" fontSize="12" fill="rgba(255,255,255,0.5)">Purpose: Fix &amp; Flip</text>
      <text x="810" y="314" fontFamily="monospace" fontSize="11" fill="rgba(245,158,11,0.7)">LTV 72% — near threshold</text>

      {/* AI Deal Memo */}
      <rect x="790" y="346" width="290" height="134" rx="12" fill="rgba(99,102,241,0.06)" stroke="rgba(99,102,241,0.15)" strokeWidth="1" />
      <text x="810" y="374" fontFamily="sans-serif" fontSize="13" fill="rgba(255,255,255,0.7)" fontWeight="600">AI Deal Memo</text>
      <rect x="895" y="360" width="34" height="18" rx="4" fill="rgba(99,102,241,0.2)" />
      <text x="912" y="374" fontFamily="monospace" fontSize="9" fill="rgba(99,102,241,0.8)" textAnchor="middle">PRO</text>
      {[
        'This bridge loan presents moderate risk',
        'with a viable exit strategy. The 72% LTV',
        'provides limited cushion. Key risk factor',
        "is borrower's rehab timeline of 8 months",
      ].map((line, i) => (
        <text key={i} x="810" y={400 + i * 16} fontFamily="sans-serif" fontSize="11" fill="rgba(255,255,255,0.45)">{line}</text>
      ))}
      <text x="810" y="464" fontFamily="sans-serif" fontSize="11" fill="rgba(99,102,241,0.6)">Read full analysis →</text>
    </svg>
  )
}

function AmortizationScreen() {
  return (
    <svg viewBox="0 0 1100 620" xmlns="http://www.w3.org/2000/svg" className="w-full block">
      <rect width="1100" height="620" fill="#111827" />
      <Sidebar activeItem="Loans" />

      <text x="262" y="42" fontFamily="sans-serif" fontSize="12" fill="rgba(255,255,255,0.35)">Rivera, M. › Amortization</text>
      <text x="262" y="70" fontFamily="Georgia,serif" fontSize="22" fill="white" fontWeight="bold">Amortization Schedule</text>
      <text x="262" y="92" fontFamily="sans-serif" fontSize="13" fill="rgba(255,255,255,0.4)">$45,000 at 10.5% for 24 months — Standard</text>

      {/* Chart */}
      <rect x="262" y="112" width="818" height="200" rx="12" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
      <text x="282" y="140" fontFamily="sans-serif" fontSize="13" fill="rgba(255,255,255,0.7)" fontWeight="600">Principal vs Interest Over Time</text>
      <g transform="translate(302, 160)">
        {[
          { x: 0, ph: 80, ih: 20 },
          { x: 34, ph: 82, ih: 18 },
          { x: 68, ph: 85, ih: 15 },
          { x: 102, ph: 88, ih: 12 },
          { x: 136, ph: 90, ih: 10 },
          { x: 170, ph: 92, ih: 8 },
          { x: 204, ph: 94, ih: 6 },
          { x: 238, ph: 95, ih: 5 },
        ].map((bar, i) => (
          <g key={i}>
            <rect x={bar.x} y={100 - bar.ph} width="28" height={bar.ph} rx="2" fill="#22c55e" opacity={0.6 + i * 0.025} />
            <rect x={bar.x} y={100 - bar.ph - bar.ih} width="28" height={bar.ih} rx="2" fill="#3b82f6" opacity="0.5" />
          </g>
        ))}
        {['1', '3', '5', '7'].map((n, i) => (
          <text key={n} x={i * 68} y="114" fontFamily="monospace" fontSize="9" fill="rgba(255,255,255,0.2)">{n}</text>
        ))}
        <text x="300" y="60" fontFamily="sans-serif" fontSize="16" fill="rgba(255,255,255,0.15)">· · ·</text>
        <rect x="636" y="1" width="28" height="99" rx="2" fill="#22c55e" opacity="0.8" />
        <rect x="636" y="0" width="28" height="1" rx="2" fill="#3b82f6" opacity="0.5" />
        <rect x="670" y="0" width="28" height="100" rx="2" fill="#22c55e" opacity="0.85" />
        <text x="670" y="114" fontFamily="monospace" fontSize="9" fill="rgba(255,255,255,0.2)">24</text>
      </g>
      <rect x="840" y="152" width="10" height="10" rx="2" fill="#22c55e" opacity="0.7" />
      <text x="856" y="162" fontFamily="sans-serif" fontSize="11" fill="rgba(255,255,255,0.5)">Principal</text>
      <rect x="930" y="152" width="10" height="10" rx="2" fill="#3b82f6" opacity="0.5" />
      <text x="946" y="162" fontFamily="sans-serif" fontSize="11" fill="rgba(255,255,255,0.5)">Interest</text>

      {/* Stats */}
      {[
        { label: 'TOTAL INTEREST', value: '$5,128', color: '#3b82f6', x: 262 },
        { label: 'MONTHLY PAYMENT', value: '$2,089', color: 'white', x: 478 },
        { label: 'TOTAL REPAYMENT', value: '$50,128', color: 'white', x: 694 },
      ].map((stat) => (
        <g key={stat.label}>
          <rect x={stat.x} y="328" width="200" height="80" rx="10" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
          <text x={stat.x + 20} y="352" fontFamily="monospace" fontSize="10" fill="rgba(255,255,255,0.3)">{stat.label}</text>
          <text x={stat.x + 20} y="384" fontFamily="Georgia,serif" fontSize="24" fill={stat.color}>{stat.value}</text>
        </g>
      ))}

      {/* Schedule table */}
      <rect x="262" y="426" width="818" height="180" rx="12" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
      <text x="282" y="454" fontFamily="sans-serif" fontSize="13" fill="rgba(255,255,255,0.7)" fontWeight="600">Schedule</text>
      {[['#', 282], ['DATE', 320], ['PAYMENT', 450], ['PRINCIPAL', 570], ['INTEREST', 690], ['BALANCE', 810], ['STATUS', 940]].map(([label, x]) => (
        <text key={label as string} x={x as number} y="480" fontFamily="monospace" fontSize="10" fill="rgba(255,255,255,0.25)">{label}</text>
      ))}
      <line x1="282" y1="488" x2="1060" y2="488" stroke="rgba(255,255,255,0.06)" />

      {[
        { n: '1', date: 'Apr 1, 2025', pmt: '$2,089.15', princ: '$1,695.40', interest: '$393.75', balance: '$43,304.60', status: 'Paid', statusColor: '#22c55e', y: 512 },
        { n: '2', date: 'May 1, 2025', pmt: '$2,089.15', princ: '$1,710.26', interest: '$378.89', balance: '$41,594.34', status: 'Paid', statusColor: '#22c55e', y: 540 },
        { n: '3', date: 'Jun 1, 2025', pmt: '$2,089.15', princ: '$1,725.24', interest: '$363.91', balance: '$39,869.10', status: 'Due', statusColor: '#f59e0b', y: 568 },
      ].map((row) => (
        <g key={row.n}>
          {row.status === 'Paid' && row.n === '1' && (
            <rect x="272" y="494" width="798" height="26" rx="4" fill="rgba(34,197,94,0.04)" />
          )}
          <text x="288" y={row.y} fontFamily="monospace" fontSize="11" fill="rgba(255,255,255,0.5)">{row.n}</text>
          <text x="320" y={row.y} fontFamily="sans-serif" fontSize="11" fill="rgba(255,255,255,0.6)">{row.date}</text>
          <text x="450" y={row.y} fontFamily="monospace" fontSize="11" fill="rgba(255,255,255,0.7)">{row.pmt}</text>
          <text x="570" y={row.y} fontFamily="monospace" fontSize="11" fill="rgba(255,255,255,0.5)">{row.princ}</text>
          <text x="690" y={row.y} fontFamily="monospace" fontSize="11" fill="rgba(255,255,255,0.5)">{row.interest}</text>
          <text x="810" y={row.y} fontFamily="monospace" fontSize="11" fill="rgba(255,255,255,0.5)">{row.balance}</text>
          <rect x="940" y={row.y - 12} width="44" height="18" rx="4" fill={`rgba(${row.statusColor === '#22c55e' ? '34,197,94' : '245,158,11'},0.15)`} />
          <text x="962" y={row.y} fontFamily="monospace" fontSize="9" fill={row.statusColor} textAnchor="middle">{row.status}</text>
        </g>
      ))}
      <text x="282" y="596" fontFamily="sans-serif" fontSize="11" fill="rgba(255,255,255,0.25)">Showing 3 of 24 payments · Download full schedule (PDF)</text>
    </svg>
  )
}

const SCREENS = [DashboardScreen, LoanDetailScreen, AmortizationScreen]

export default function ProductShowcase() {
  const [activeTab, setActiveTab] = useState(0)
  const ActiveScreen = SCREENS[activeTab]

  return (
    <section id="product" className="py-20 sm:py-24 overflow-hidden" style={{ backgroundColor: '#0f1a2e' }}>
      <div className="max-w-[1140px] mx-auto px-8">
        <p className="text-[11px] font-mono uppercase tracking-[2px] text-[#22c55e] font-medium mb-3">
          The Product
        </p>
        <h2 className="font-display text-3xl sm:text-[40px] leading-[1.15] text-white tracking-tight mb-4">
          Everything in one place. Finally.
        </h2>
        <p className="text-[17px] leading-relaxed text-white/[0.55] max-w-[600px] mb-8">
          Real screenshots. Real data. Built for how private lenders actually work.
        </p>

        {/* Tabs */}
        <div className="inline-flex gap-1 bg-white/[0.06] rounded-[10px] p-1 mb-8">
          {TABS.map((tab, i) => (
            <button
              key={tab}
              onClick={() => setActiveTab(i)}
              className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === i
                  ? 'bg-white/[0.12] text-white'
                  : 'text-white/50 hover:text-white/75'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Frame */}
        <div className="rounded-2xl overflow-hidden border border-white/[0.08] shadow-[0_24px_80px_rgba(0,0,0,0.4)]" style={{ backgroundColor: '#1a2540' }}>
          {/* Browser bar */}
          <div className="h-10 bg-white/[0.04] border-b border-white/[0.06] flex items-center px-4 gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-white/[0.12]" />
            <div className="w-2.5 h-2.5 rounded-full bg-white/[0.12]" />
            <div className="w-2.5 h-2.5 rounded-full bg-white/[0.12]" />
          </div>
          <ActiveScreen />
        </div>
      </div>
    </section>
  )
}
