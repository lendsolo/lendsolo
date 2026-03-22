import { Link } from '@inertiajs/react'
import PublicLayout from '../../layouts/PublicLayout'
import SeoHead from '../../components/SeoHead'

const CALCULATORS = [
  {
    title: 'Loan Amortization Calculator',
    description: 'Generate month-by-month amortization schedules for standard, interest-only, and balloon loans.',
    href: '/tools/loan-amortization-calculator',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
      </svg>
    ),
  },
  {
    title: 'ROI Calculator',
    description: 'Project your return on investment across different loan scenarios and holding periods.',
    href: '/tools/roi-calculator',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941" />
      </svg>
    ),
  },
  {
    title: 'Loan Comparison',
    description: 'Compare up to three loan structures side by side to find the best fit for your deal.',
    href: '/tools/loan-comparison',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
      </svg>
    ),
  },
  {
    title: 'Interest-Only Calculator',
    description: 'Calculate monthly payments and total interest for interest-only loan structures.',
    href: '/tools/interest-only-calculator',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
      </svg>
    ),
  },
]

export default function ToolsIndex() {
  const description = 'Free calculators for private lenders: amortization schedules, ROI projections, loan comparisons, and interest-only payment breakdowns. No signup required.'

  return (
    <PublicLayout
      title="Free Lending Calculators"
      description="Run the numbers on any deal — no account required."
    >
      <SeoHead
        title="Free Private Lending Calculators | LendSolo"
        description={description}
        canonicalUrl="https://lendsolo.com/calculators"
        schema={{
          '@type': 'CollectionPage',
          name: 'Private Lending Calculators',
          description,
          url: 'https://lendsolo.com/calculators',
          provider: { '@type': 'Organization', name: 'LendSolo' },
        }}
      />

      <div className="grid gap-6 sm:grid-cols-2">
        {CALCULATORS.map((calc) => (
          <Link
            key={calc.href}
            href={calc.href}
            className="group block bg-white rounded-xl border border-gray-200 p-6 hover:border-gray-300 hover:shadow-md transition-all"
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                {calc.icon}
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900 group-hover:text-emerald-700 transition-colors">
                  {calc.title}
                </h2>
                <p className="mt-1 text-sm text-gray-600 leading-relaxed">
                  {calc.description}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </PublicLayout>
  )
}
