import { Link } from '@inertiajs/react'
import AppLayout from '@/layouts/AppLayout'
import AnimatedNumber from '@/components/AnimatedNumber'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

interface UpcomingPayment {
  loan_id: number
  borrower_id: number | null
  borrower_name: string
  amount: number
  due_date: string
  overdue: boolean
  days_overdue: number
}

interface AllocationItem {
  id: number
  borrower_id: number | null
  borrower_name: string
  principal: number
  percentage: number
}

interface MonthlyData {
  month: string
  interest: number
  principal: number
}

interface CapitalTransaction {
  id: number
  transaction_type: 'infusion' | 'withdrawal' | 'adjustment'
  amount: number
  date: string
  source: string | null
}

interface Props {
  recent_capital_transactions: CapitalTransaction[]
  stats: {
    active_loans: number
    total_deployed: number
    available_capital: number
    total_capital: number
    total_interest_earned: number
    total_expenses: number
    net_profit: number
    roi: number
    avg_rate: number
    total_loans: number
    paid_off_loans: number
    defaulted_loans: number
  }
  monthly_interest_data: MonthlyData[]
  upcoming_payments: UpcomingPayment[]
  portfolio_allocation: AllocationItem[]
}

const ALLOCATION_COLORS = [
  '#059669', '#0891b2', '#7c3aed', '#db2777', '#ea580c',
  '#ca8a04', '#4f46e5', '#dc2626', '#16a34a', '#9333ea',
]

export default function DashboardIndex({ stats, monthly_interest_data, upcoming_payments, portfolio_allocation, recent_capital_transactions }: Props) {
  const hasLoans = stats.total_loans > 0
  const utilizationPercent = stats.total_capital > 0
    ? Math.min((stats.total_deployed / stats.total_capital) * 100, 100)
    : 0

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-sm text-gray-500 mt-1">Portfolio overview</p>
          </div>
          <Link
            href="/loans/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Loan
          </Link>
        </div>

        {!hasLoans ? (
          <EmptyDashboard />
        ) : (
          <>
            {/* Top Stats Row */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <StatCard
                label="Active Loans"
                value={stats.active_loans}
                prefix=""
                decimals={0}
                icon={<BanknotesIcon />}
                color="text-emerald-600"
              />
              <StatCard
                label="Capital Deployed"
                value={stats.total_deployed}
                prefix="$"
                icon={<ArrowTrendingUpIcon />}
                color="text-indigo-600"
              />
              <StatCard
                label="Interest Earned"
                value={stats.total_interest_earned}
                prefix="$"
                icon={<SparklesIcon />}
                color="text-amber-600"
              />
              <StatCard
                label="Net Profit"
                value={stats.net_profit}
                prefix="$"
                icon={<ChartBarIcon />}
                color={stats.net_profit >= 0 ? 'text-emerald-600' : 'text-red-600'}
              />
            </div>

            {/* Middle Row: Chart + Upcoming Payments */}
            <div className="grid lg:grid-cols-3 gap-4 mb-6">
              {/* Monthly Collections Chart */}
              <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Monthly Collections</h3>
                {monthly_interest_data.some(d => d.interest > 0 || d.principal > 0) ? (
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={monthly_interest_data} barGap={0}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} />
                      <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} tickFormatter={(v) => `$${v.toLocaleString()}`} />
                      <Tooltip
                        formatter={(value: number, name: string) => [`$${value.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, name === 'interest' ? 'Interest' : 'Principal']}
                        labelStyle={{ color: '#374151', fontWeight: 600 }}
                        contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      />
                      <Legend
                        formatter={(value) => value === 'interest' ? 'Interest' : 'Principal'}
                        wrapperStyle={{ fontSize: 12 }}
                      />
                      <Bar dataKey="principal" stackId="a" fill="#34d399" radius={[0, 0, 0, 0]} name="principal" />
                      <Bar dataKey="interest" stackId="a" fill="#818cf8" radius={[4, 4, 0, 0]} name="interest" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[260px] flex items-center justify-center text-sm text-gray-400">
                    No payment data yet. Record payments to see trends.
                  </div>
                )}
              </div>

              {/* Upcoming Payments */}
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Upcoming Payments</h3>
                {upcoming_payments.length === 0 ? (
                  <p className="text-sm text-gray-400 py-8 text-center">No upcoming payments</p>
                ) : (
                  <div className="space-y-3">
                    {upcoming_payments.map((p) => (
                      <Link
                        key={`${p.loan_id}-${p.due_date}`}
                        href={`/loans/${p.loan_id}`}
                        className="block p-3 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-1">
                          {p.borrower_id ? (
                            <Link
                              href={`/borrowers/${p.borrower_id}`}
                              className="text-sm font-medium text-emerald-600 hover:text-emerald-700 truncate mr-2"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {p.borrower_name}
                            </Link>
                          ) : (
                            <span className="text-sm font-medium text-gray-900 truncate mr-2">
                              {p.borrower_name}
                            </span>
                          )}
                          <span className="text-sm font-semibold font-mono text-gray-900 shrink-0">
                            ${p.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-400">Due {p.due_date}</span>
                          {p.overdue && (
                            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-red-50 text-red-700">
                              {p.days_overdue}d overdue
                            </span>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Row: Portfolio Utilization + Allocation + Quick Stats */}
            <div className="grid lg:grid-cols-3 gap-4">
              {/* Portfolio Utilization */}
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Capital Utilization</h3>
                {stats.total_capital > 0 ? (
                  <>
                    <div className="mb-3">
                      <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>Deployed</span>
                        <span>{utilizationPercent.toFixed(1)}%</span>
                      </div>
                      <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full transition-all duration-700"
                          style={{ width: `${utilizationPercent}%` }}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-xs mt-4">
                      <div>
                        <span className="text-gray-400">Deployed</span>
                        <p className="font-semibold font-mono text-gray-900">
                          ${stats.total_deployed.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-400">Available</span>
                        <p className="font-semibold font-mono text-emerald-600">
                          ${stats.available_capital.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-sm text-gray-400 mb-2">Set your total capital in Settings</p>
                    <Link
                      href="/settings"
                      className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                    >
                      Go to Settings →
                    </Link>
                  </div>
                )}
              </div>

              {/* Portfolio Allocation */}
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Portfolio Allocation</h3>
                {portfolio_allocation.length === 0 ? (
                  <p className="text-sm text-gray-400 py-8 text-center">No active loans</p>
                ) : (
                  <>
                    {/* Stacked bar */}
                    <div className="h-4 rounded-full overflow-hidden flex mb-4">
                      {portfolio_allocation.map((item, i) => (
                        <div
                          key={item.id}
                          className="h-full first:rounded-l-full last:rounded-r-full"
                          style={{
                            width: `${item.percentage}%`,
                            backgroundColor: ALLOCATION_COLORS[i % ALLOCATION_COLORS.length],
                          }}
                          title={`${item.borrower_name}: ${item.percentage}%`}
                        />
                      ))}
                    </div>
                    <div className="space-y-2">
                      {portfolio_allocation.map((item, i) => (
                        <div key={item.id} className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2 min-w-0">
                            <div
                              className="w-2.5 h-2.5 rounded-full shrink-0"
                              style={{ backgroundColor: ALLOCATION_COLORS[i % ALLOCATION_COLORS.length] }}
                            />
                            {item.borrower_id ? (
                              <Link href={`/borrowers/${item.borrower_id}`} className="text-gray-700 truncate hover:text-emerald-600 transition-colors">
                                {item.borrower_name}
                              </Link>
                            ) : (
                              <span className="text-gray-700 truncate">{item.borrower_name}</span>
                            )}
                          </div>
                          <span className="text-gray-400 shrink-0 ml-2">{item.percentage}%</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Quick Stats */}
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Quick Stats</h3>
                <div className="space-y-3">
                  <QuickStatRow label="Total Loans" value={stats.total_loans.toString()} />
                  <QuickStatRow label="Paid Off" value={stats.paid_off_loans.toString()} />
                  <QuickStatRow label="Defaulted" value={stats.defaulted_loans.toString()} color={stats.defaulted_loans > 0 ? 'text-red-600' : undefined} />
                  <QuickStatRow label="Avg Rate" value={`${stats.avg_rate}%`} />
                  <QuickStatRow
                    label="ROI"
                    value={`${stats.roi}%`}
                    color={stats.roi >= 0 ? 'text-emerald-600' : 'text-red-600'}
                  />
                  <QuickStatRow
                    label="Expenses"
                    value={`$${stats.total_expenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
                  />
                </div>
              </div>
            </div>

            {/* Recent Capital Activity */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 mt-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-900">Recent Capital Activity</h3>
                {recent_capital_transactions.length > 0 && (
                  <Link href="/capital_transactions" className="text-xs text-emerald-600 hover:text-emerald-700 font-medium">
                    View all &rarr;
                  </Link>
                )}
              </div>
              {recent_capital_transactions.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-400 mb-2">Track your capital</p>
                  <Link
                    href="/capital_transactions"
                    className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                  >
                    Log your first infusion &rarr;
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {recent_capital_transactions.map((txn) => {
                    const isWithdrawal = txn.transaction_type === 'withdrawal'
                    const typeColors: Record<string, string> = {
                      infusion: 'text-emerald-600',
                      withdrawal: 'text-red-600',
                      adjustment: 'text-gray-600',
                    }
                    const typeIcons: Record<string, string> = {
                      infusion: '+',
                      withdrawal: '-',
                      adjustment: '~',
                    }
                    return (
                      <div key={txn.id} className="flex items-center justify-between py-1.5">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className={`text-sm font-bold ${typeColors[txn.transaction_type]} w-4 text-center`}>
                            {typeIcons[txn.transaction_type]}
                          </span>
                          <div className="min-w-0">
                            <span className="text-sm text-gray-600 truncate block">{txn.source || txn.transaction_type}</span>
                            <span className="text-[10px] text-gray-400">{txn.date}</span>
                          </div>
                        </div>
                        <span className={`text-sm font-semibold font-mono shrink-0 ${typeColors[txn.transaction_type]}`}>
                          {isWithdrawal ? '-' : '+'}${txn.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Tax Season CTA — show Oct through Apr */}
            {(() => {
              const month = new Date().getMonth() // 0-indexed
              const isTaxSeason = month >= 9 || month <= 3 // Oct=9, Nov=10, Dec=11, Jan=0, Feb=1, Mar=2, Apr=3
              if (!isTaxSeason || !stats.total_interest_earned) return null
              return (
                <Link
                  href="/exports"
                  className="mt-4 block p-4 rounded-xl bg-gradient-to-r from-indigo-50 to-emerald-50 border border-indigo-100 hover:border-indigo-200 transition-colors group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">📋</span>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">Tax season coming up?</p>
                        <p className="text-xs text-gray-500">Download your year-end summary for your accountant →</p>
                      </div>
                    </div>
                    <svg className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                    </svg>
                  </div>
                </Link>
              )
            })()}
          </>
        )}
      </div>
    </AppLayout>
  )
}

function StatCard({ label, value, prefix = '$', decimals = 2, icon, color = 'text-gray-900' }: {
  label: string
  value: number
  prefix?: string
  decimals?: number
  icon: React.ReactNode
  color?: string
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs text-gray-500">{label}</p>
        <div className="text-gray-400">{icon}</div>
      </div>
      <AnimatedNumber
        value={value}
        prefix={prefix}
        decimals={decimals}
        className={`text-2xl font-bold font-mono ${color}`}
      />
    </div>
  )
}

function QuickStatRow({ label, value, color = 'text-gray-900' }: { label: string; value: string; color?: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-gray-400">{label}</span>
      <span className={`text-sm font-semibold font-mono ${color}`}>{value}</span>
    </div>
  )
}

function EmptyDashboard() {
  return (
    <div className="text-center py-20">
      <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-emerald-50 flex items-center justify-center">
        <svg className="w-10 h-10 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </div>
      <h2 className="text-xl font-bold text-gray-900 mb-2">Welcome to LendSolo</h2>
      <p className="text-sm text-gray-500 mb-8 max-w-md mx-auto">
        Create your first loan to start tracking your lending portfolio. Set your total capital in Settings to see utilization metrics.
      </p>
      <div className="flex items-center justify-center gap-3">
        <Link
          href="/loans/new"
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create First Loan
        </Link>
        <Link
          href="/settings"
          className="px-6 py-2.5 border border-gray-200 text-sm font-medium rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
        >
          Set Up Profile
        </Link>
      </div>
    </div>
  )
}

// Icons
function BanknotesIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    </svg>
  )
}

function ArrowTrendingUpIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941" />
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

function ChartBarIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
    </svg>
  )
}
