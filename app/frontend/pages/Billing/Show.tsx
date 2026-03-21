import { useEffect } from 'react'
import { router, usePage } from '@inertiajs/react'
import AppLayout from '@/layouts/AppLayout'

interface PlanDetail {
  name: string
  price: number
  loan_limit: number | null
  features: string[]
}

interface Props {
  plan: string
  subscription_plan: string
  subscription_status: string
  on_trial: boolean
  trial_days_remaining: number
  trial_expired: boolean
  active_loan_count: number
  loan_limit: number | null
  plans: Record<string, PlanDetail>
  redirect_url?: string
}

const PLAN_ORDER = ['free', 'solo', 'pro', 'fund'] as const
const PLAN_COLORS: Record<string, { ring: string; bg: string; badge: string; button: string }> = {
  free: { ring: 'ring-gray-200', bg: 'bg-white', badge: 'bg-gray-100 text-gray-600', button: 'bg-gray-100 text-gray-400 cursor-default' },
  solo: { ring: 'ring-emerald-200', bg: 'bg-white', badge: 'bg-emerald-100 text-emerald-700', button: 'bg-emerald-600 hover:bg-emerald-700 text-white' },
  pro: { ring: 'ring-indigo-200', bg: 'bg-white', badge: 'bg-indigo-100 text-indigo-700', button: 'bg-indigo-600 hover:bg-indigo-700 text-white' },
  fund: { ring: 'ring-amber-200', bg: 'bg-white', badge: 'bg-amber-100 text-amber-700', button: 'bg-amber-600 hover:bg-amber-700 text-white' },
}

export default function BillingShow({
  plan,
  subscription_plan,
  subscription_status,
  on_trial,
  trial_days_remaining,
  trial_expired,
  active_loan_count,
  loan_limit,
  plans,
  redirect_url,
}: Props) {
  // Handle external redirects (Stripe Checkout / Portal)
  // Inertia intercepts all server redirects as XHR, so external URLs
  // must be redirected client-side via window.location.href
  useEffect(() => {
    if (redirect_url) {
      window.location.href = redirect_url
    }
  }, [redirect_url])

  const { flash } = usePage<{ flash: { notice?: string; alert?: string } }>().props
  const utilizationPercent = loan_limit ? Math.min((active_loan_count / loan_limit) * 100, 100) : 0
  const nearLimit = loan_limit ? active_loan_count >= loan_limit - 1 && active_loan_count < loan_limit : false
  const atLimit = loan_limit ? active_loan_count >= loan_limit : false

  function handleSubscribe(planKey: string) {
    router.post('/billing/subscribe', { plan: planKey })
  }

  function handlePortal() {
    router.post('/billing/portal')
  }

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Billing</h1>
        <p className="text-sm text-gray-500 mb-8">Manage your subscription and usage.</p>

        {/* Flash */}
        {flash?.notice && (
          <div className="mb-6 px-4 py-3 rounded-lg bg-emerald-50 border border-emerald-200 text-sm text-emerald-700">
            {flash.notice}
          </div>
        )}
        {flash?.alert && (
          <div className="mb-6 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
            {flash.alert}
          </div>
        )}

        {/* Limit warning banner */}
        {nearLimit && !atLimit && (
          <div className="mb-6 px-4 py-3 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-between">
            <p className="text-sm text-amber-700">
              You're using <strong>{active_loan_count} of {loan_limit}</strong> active loans — upgrade for more capacity.
            </p>
            <button
              onClick={() => handleSubscribe(plan === 'solo' ? 'pro' : 'fund')}
              className="text-xs font-semibold text-amber-700 bg-amber-100 px-3 py-1 rounded-full hover:bg-amber-200 transition-colors shrink-0 ml-4"
            >
              Upgrade
            </button>
          </div>
        )}
        {atLimit && (
          <div className="mb-6 px-4 py-3 rounded-lg bg-red-50 border border-red-200 flex items-center justify-between">
            <p className="text-sm text-red-700">
              You've reached your <strong>{loan_limit}-loan limit</strong>. Upgrade to create more loans.
            </p>
            <button
              onClick={() => handleSubscribe(plan === 'solo' ? 'pro' : plan === 'pro' ? 'fund' : 'pro')}
              className="text-xs font-semibold text-red-700 bg-red-100 px-3 py-1 rounded-full hover:bg-red-200 transition-colors shrink-0 ml-4"
            >
              Upgrade Now
            </button>
          </div>
        )}

        {/* Current Plan + Usage */}
        <div className="grid lg:grid-cols-2 gap-4 mb-8">
          {/* Current Plan */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-900">Current Plan</h3>
              <StatusBadge
                plan={plan}
                status={subscription_status}
                onTrial={on_trial}
                trialDays={trial_days_remaining}
                trialExpired={trial_expired}
              />
            </div>

            <div className="flex items-baseline gap-1 mb-1">
              <span className="text-3xl font-bold text-gray-900">
                ${plans[plan]?.price || 0}
              </span>
              <span className="text-sm text-gray-400">/mo</span>
            </div>
            <p className="text-sm font-medium text-gray-700 mb-4">{plans[plan]?.name || 'Free'}</p>

            {on_trial && (
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-100 mb-4">
                <p className="text-xs text-emerald-700">
                  <strong>{trial_days_remaining} days</strong> left in your free trial.
                  {' '}No credit card required until trial ends.
                </p>
              </div>
            )}

            {trial_expired && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-100 mb-4">
                <p className="text-xs text-red-700">
                  Your free trial has ended. Subscribe to continue creating loans beyond the free tier.
                </p>
              </div>
            )}

            {subscription_plan !== 'free' && subscription_status === 'active' && (
              <button
                onClick={handlePortal}
                className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
              >
                Manage payment method →
              </button>
            )}
          </div>

          {/* Usage */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Usage</h3>
            <div className="mb-4">
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-gray-500">Active Loans</span>
                <span className="font-semibold text-gray-900">
                  {active_loan_count} {loan_limit ? `of ${loan_limit}` : '(unlimited)'}
                </span>
              </div>
              {loan_limit && (
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      atLimit ? 'bg-red-500' : nearLimit ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.max(2, utilizationPercent)}%` }}
                  />
                </div>
              )}
              {!loan_limit && (
                <div className="h-3 bg-emerald-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full w-full" />
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-100">
              <div>
                <p className="text-xs text-gray-400">Plan limit</p>
                <p className="text-lg font-bold font-mono text-gray-900">
                  {loan_limit ?? '∞'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Remaining</p>
                <p className="text-lg font-bold font-mono text-gray-900">
                  {loan_limit ? Math.max(0, loan_limit - active_loan_count) : '∞'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Plan Comparison Grid */}
        <h3 className="text-lg font-bold text-gray-900 mb-4">Plans</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {PLAN_ORDER.map((planKey) => {
            const p = plans[planKey]
            if (!p) return null
            const colors = PLAN_COLORS[planKey]
            const isCurrent = plan === planKey
            const isDowngrade = PLAN_ORDER.indexOf(planKey) < PLAN_ORDER.indexOf(plan as typeof PLAN_ORDER[number])
            const isUpgrade = PLAN_ORDER.indexOf(planKey) > PLAN_ORDER.indexOf(plan as typeof PLAN_ORDER[number])

            return (
              <div
                key={planKey}
                className={`rounded-xl border-2 p-5 transition-all ${
                  isCurrent ? `${colors.ring} ring-2 shadow-sm` : 'border-gray-100'
                } ${colors.bg}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${colors.badge}`}>
                    {p.name}
                  </span>
                  {isCurrent && (
                    <span className="text-[10px] font-medium text-gray-400">Current</span>
                  )}
                </div>

                <div className="flex items-baseline gap-0.5 mb-1">
                  <span className="text-2xl font-bold text-gray-900">${p.price}</span>
                  <span className="text-xs text-gray-400">/mo</span>
                </div>

                <p className="text-xs text-gray-500 mb-4">
                  {p.loan_limit ? `Up to ${p.loan_limit} active loans` : 'Unlimited active loans'}
                </p>

                <ul className="space-y-1.5 mb-5">
                  {p.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-xs text-gray-600">
                      <svg className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>

                {planKey === 'free' ? (
                  <div className={`w-full py-2 text-xs font-semibold rounded-lg text-center ${colors.button}`}>
                    {isCurrent ? 'Current Plan' : 'Free'}
                  </div>
                ) : isCurrent ? (
                  <button
                    onClick={handlePortal}
                    className="w-full py-2 text-xs font-semibold rounded-lg text-center border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    Manage Plan
                  </button>
                ) : isUpgrade ? (
                  <button
                    onClick={() => handleSubscribe(planKey)}
                    className={`w-full py-2 text-xs font-semibold rounded-lg text-center transition-colors ${colors.button}`}
                  >
                    {plan === 'free' ? 'Start with ' : 'Upgrade to '}{p.name}
                  </button>
                ) : isDowngrade ? (
                  <button
                    onClick={handlePortal}
                    className="w-full py-2 text-xs font-semibold rounded-lg text-center border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
                  >
                    Downgrade
                  </button>
                ) : null}
              </div>
            )
          })}
        </div>

        {/* Payment management */}
        {subscription_plan !== 'free' && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Payment & Invoices</h3>
            <p className="text-xs text-gray-500 mb-4">
              Update your payment method, view invoices, or cancel your subscription through Stripe's secure portal.
            </p>
            <button
              onClick={handlePortal}
              className="px-5 py-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Open Billing Portal
            </button>
          </div>
        )}
      </div>
    </AppLayout>
  )
}

function StatusBadge({
  plan,
  status,
  onTrial,
  trialDays,
  trialExpired,
}: {
  plan: string
  status: string
  onTrial: boolean
  trialDays: number
  trialExpired: boolean
}) {
  if (onTrial) {
    return (
      <span className="px-2.5 py-1 text-[10px] font-semibold rounded-full bg-emerald-50 text-emerald-700">
        Trial · {trialDays}d left
      </span>
    )
  }

  if (trialExpired) {
    return (
      <span className="px-2.5 py-1 text-[10px] font-semibold rounded-full bg-red-50 text-red-700">
        Trial Expired
      </span>
    )
  }

  if (status === 'active') {
    return (
      <span className="px-2.5 py-1 text-[10px] font-semibold rounded-full bg-emerald-50 text-emerald-700">
        Active
      </span>
    )
  }

  if (status === 'past_due') {
    return (
      <span className="px-2.5 py-1 text-[10px] font-semibold rounded-full bg-amber-50 text-amber-700">
        Past Due
      </span>
    )
  }

  if (status === 'canceled') {
    return (
      <span className="px-2.5 py-1 text-[10px] font-semibold rounded-full bg-gray-100 text-gray-600">
        Canceled
      </span>
    )
  }

  return (
    <span className="px-2.5 py-1 text-[10px] font-semibold rounded-full bg-gray-100 text-gray-500">
      {plan === 'free' ? 'Free' : status}
    </span>
  )
}
