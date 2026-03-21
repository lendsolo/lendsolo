import { useState } from 'react'
import { useForm, router } from '@inertiajs/react'

interface Props {
  user: {
    business_name: string
    total_capital: number
  }
  profile_saved?: boolean
}

type OnboardingStep = 'welcome' | 'choose' | 'tour'

const TOUR_STEPS = [
  {
    title: 'Your Dashboard',
    description:
      'This is your command center. At a glance, see total capital deployed, interest earned, net profit, and how your portfolio is performing month over month.',
    icon: '📊',
  },
  {
    title: 'Amortization Schedules',
    description:
      'Every loan automatically generates a full amortization schedule — showing exactly how each payment splits between principal and interest. Open any loan to see it.',
    icon: '📅',
  },
  {
    title: 'Smart Guardrails',
    description:
      'LendSolo watches for risk: overdue payments, missing collateral, and capital concentration. You\'ll see alert banners on loan pages when something needs attention.',
    icon: '🛡️',
  },
  {
    title: 'Record Payments',
    description:
      'When a borrower pays, hit "Record Payment" on any loan page or the Payments tab. The principal/interest split is calculated automatically based on the amortization schedule.',
    icon: '💰',
  },
]

export default function OnboardingShow({ user, profile_saved }: Props) {
  const [step, setStep] = useState<OnboardingStep>(profile_saved ? 'choose' : 'welcome')
  const [tourIndex, setTourIndex] = useState(0)
  const [seeding, setSeeding] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-xl">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: '#0E4D30' }}>
            LendSolo
          </h1>
        </div>

        {step === 'welcome' && (
          <WelcomeStep
            user={user}
            onNext={() => setStep('choose')}
          />
        )}

        {step === 'choose' && (
          <ChooseStep
            onImport={() => {
              // Mark onboarding complete, then navigate to import
              router.post('/onboarding/complete', {}, {
                onSuccess: () => router.visit('/import'),
              })
            }}
            onCreateLoan={() => {
              router.post('/onboarding/complete', {}, {
                onSuccess: () => router.visit('/loans/new'),
              })
            }}
            onSampleData={() => {
              setSeeding(true)
              router.post('/onboarding/seed')
            }}
            seeding={seeding}
          />
        )}

        {step === 'tour' && (
          <TourStep
            index={tourIndex}
            total={TOUR_STEPS.length}
            step={TOUR_STEPS[tourIndex]}
            onNext={() => {
              if (tourIndex < TOUR_STEPS.length - 1) {
                setTourIndex(tourIndex + 1)
              } else {
                router.post('/onboarding/complete')
              }
            }}
            onSkip={() => {
              router.post('/onboarding/complete')
            }}
          />
        )}
      </div>
    </div>
  )
}

// ── Step 1: Welcome ──────────────────────────────────────────────────────────

function WelcomeStep({
  user,
  onNext,
}: {
  user: Props['user']
  onNext: () => void
}) {
  const form = useForm({
    business_name: user.business_name,
    total_capital: user.total_capital > 0 ? user.total_capital.toString() : '',
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    form.post('/onboarding/profile', {
      preserveState: false,
    })
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-8 pt-8 pb-6 text-center">
        <div className="w-14 h-14 mx-auto mb-4 rounded-2xl flex items-center justify-center" style={{ backgroundColor: '#E8F5EE' }}>
          <svg className="w-7 h-7" style={{ color: '#0E4D30' }} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0 0 12 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75Z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-1">Let's set up your lending business</h2>
        <p className="text-sm text-gray-500">This takes about 30 seconds.</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="px-8 pb-8 space-y-5">
        <div>
          <label htmlFor="business_name" className="block text-sm font-medium text-gray-700 mb-1.5">
            Business name
          </label>
          <input
            id="business_name"
            type="text"
            value={form.data.business_name}
            onChange={(e) => form.setData('business_name', e.target.value)}
            placeholder="e.g. Smith Capital LLC"
            className="w-full text-sm px-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            autoFocus
          />
          <p className="text-xs text-gray-400 mt-1">Displayed in your sidebar. You can change this later.</p>
        </div>

        <div>
          <label htmlFor="total_capital" className="block text-sm font-medium text-gray-700 mb-1.5">
            Total available capital
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-400">$</span>
            <input
              id="total_capital"
              type="number"
              step="0.01"
              min="0"
              value={form.data.total_capital}
              onChange={(e) => form.setData('total_capital', e.target.value)}
              placeholder="100,000"
              className="w-full text-sm pl-8 pr-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-900 placeholder-gray-400 font-mono focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            />
          </div>
          <p className="text-xs text-gray-400 mt-1">
            How much capital do you have available to lend? This powers your utilization metrics and concentration alerts.
          </p>
        </div>

        <button
          type="submit"
          disabled={form.processing}
          className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50"
        >
          {form.processing ? 'Saving...' : 'Continue'}
        </button>

        <button
          type="button"
          onClick={onNext}
          className="w-full py-2 text-xs text-gray-400 hover:text-gray-600 transition-colors"
        >
          Skip for now
        </button>
      </form>
    </div>
  )
}

// ── Step 2: Choose how to start ──────────────────────────────────────────────

function ChooseStep({
  onImport,
  onCreateLoan,
  onSampleData,
  seeding,
}: {
  onImport: () => void
  onCreateLoan: () => void
  onSampleData: () => void
  seeding: boolean
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-8 pt-8 pb-2 text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-1">How do you want to start?</h2>
        <p className="text-sm text-gray-500">Pick one — you can always do the others later.</p>
      </div>

      <div className="px-8 pb-8 pt-4 space-y-3">
        {/* Import spreadsheet */}
        <button
          onClick={onImport}
          className="w-full text-left p-5 rounded-xl border-2 border-gray-100 hover:border-emerald-300 hover:bg-emerald-50/30 transition-all group"
        >
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0 group-hover:bg-indigo-100 transition-colors">
              <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-0.5">Import from spreadsheet</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Upload a CSV or Excel file with your existing loans. We'll map the columns and import everything in one go.
              </p>
            </div>
          </div>
        </button>

        {/* Create first loan */}
        <button
          onClick={onCreateLoan}
          className="w-full text-left p-5 rounded-xl border-2 border-gray-100 hover:border-emerald-300 hover:bg-emerald-50/30 transition-all group"
        >
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0 group-hover:bg-emerald-100 transition-colors">
              <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-0.5">Create my first loan</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Start fresh. Enter the details for your first loan and see the amortization schedule instantly.
              </p>
            </div>
          </div>
        </button>

        {/* Sample data */}
        <button
          onClick={onSampleData}
          disabled={seeding}
          className="w-full text-left p-5 rounded-xl border-2 border-gray-100 hover:border-emerald-300 hover:bg-emerald-50/30 transition-all group disabled:opacity-60"
        >
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center shrink-0 group-hover:bg-amber-100 transition-colors">
              <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 0 0-1.883 2.542l.857 6a2.25 2.25 0 0 0 2.227 1.932H19.05a2.25 2.25 0 0 0 2.227-1.932l.857-6a2.25 2.25 0 0 0-1.883-2.542m-16.5 0V6A2.25 2.25 0 0 1 6 3.75h3.879a1.5 1.5 0 0 1 1.06.44l2.122 2.12a1.5 1.5 0 0 0 1.06.44H18A2.25 2.25 0 0 1 20.25 9v.776" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-0.5">
                {seeding ? 'Loading sample data...' : 'Explore with sample data'}
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Load 3 realistic loans with payments so you can explore the dashboard, schedules, and guardrails right away.
                You can clear them anytime in Settings.
              </p>
            </div>
          </div>
        </button>
      </div>
    </div>
  )
}

// ── Step 3: Quick Tour ───────────────────────────────────────────────────────

function TourStep({
  index,
  total,
  step,
  onNext,
  onSkip,
}: {
  index: number
  total: number
  step: typeof TOUR_STEPS[number]
  onNext: () => void
  onSkip: () => void
}) {
  const isLast = index === total - 1

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Progress dots */}
      <div className="px-8 pt-6 flex items-center justify-center gap-1.5">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className={`h-1.5 rounded-full transition-all ${
              i === index ? 'w-6 bg-emerald-500' : i < index ? 'w-1.5 bg-emerald-300' : 'w-1.5 bg-gray-200'
            }`}
          />
        ))}
      </div>

      <div className="px-8 pt-6 pb-8 text-center">
        <div className="text-4xl mb-4">{step.icon}</div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">{step.title}</h3>
        <p className="text-sm text-gray-500 leading-relaxed max-w-sm mx-auto mb-8">
          {step.description}
        </p>

        <div className="flex items-center justify-center gap-3">
          <button
            onClick={onSkip}
            className="px-5 py-2.5 text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            Skip tour
          </button>
          <button
            onClick={onNext}
            className="px-8 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            {isLast ? 'Go to Dashboard →' : 'Next'}
          </button>
        </div>

        <p className="text-[10px] text-gray-300 mt-4">
          {index + 1} of {total}
        </p>
      </div>
    </div>
  )
}
