import AppLayout from '@/layouts/AppLayout'

interface Stats {
  users: {
    total: number
    today: number
    this_week: number
  }
  subscriptions: {
    free: number
    solo: number
    pro: number
    fund: number
  }
  waitlist: {
    total: number
    fund: number
  }
  loans: {
    total: number
    active: number
  }
}

interface Props {
  stats: Stats
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm text-gray-600">{label}</span>
      <span className="text-sm font-semibold text-gray-900 tabular-nums">{value.toLocaleString()}</span>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">{title}</h2>
      <div className="divide-y divide-gray-100">{children}</div>
    </div>
  )
}

export default function AdminIndex({ stats }: Props) {
  return (
    <AppLayout>
      <div className="max-w-4xl">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">Internal metrics — owner only.</p>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Section title="Users">
            <StatCard label="Total users" value={stats.users.total} />
            <StatCard label="New today" value={stats.users.today} />
            <StatCard label="New this week" value={stats.users.this_week} />
          </Section>

          <Section title="Subscriptions">
            <StatCard label="Free" value={stats.subscriptions.free} />
            <StatCard label="Solo" value={stats.subscriptions.solo} />
            <StatCard label="Pro" value={stats.subscriptions.pro} />
            <StatCard label="Fund" value={stats.subscriptions.fund} />
          </Section>

          <Section title="Waitlist">
            <StatCard label="Total entries" value={stats.waitlist.total} />
            <StatCard label="Fund tier" value={stats.waitlist.fund} />
          </Section>

          <Section title="Loans">
            <StatCard label="Total loans" value={stats.loans.total} />
            <StatCard label="Active" value={stats.loans.active} />
          </Section>
        </div>
      </div>
    </AppLayout>
  )
}
