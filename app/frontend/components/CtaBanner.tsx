import { Link } from '@inertiajs/react'

interface Props {
  headline: string
  buttonText: string
  href?: string
}

export default function CtaBanner({ headline, buttonText, href = '/users/sign_up' }: Props) {
  return (
    <div className="mt-12 rounded-2xl p-8 sm:p-12 text-center" style={{ backgroundColor: '#0F1419' }}>
      <h3 className="text-xl sm:text-2xl font-bold text-white">{headline}</h3>
      <p className="mt-2 text-gray-400">Free forever for solo lenders managing up to 5 loans.</p>
      <Link
        href={href}
        className="mt-6 inline-block px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-lg transition-colors"
      >
        {buttonText}
      </Link>
    </div>
  )
}
