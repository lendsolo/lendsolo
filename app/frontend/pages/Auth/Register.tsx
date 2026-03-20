import { useForm } from '@inertiajs/react'
import { FormEvent } from 'react'

interface Props {
  errors?: Record<string, string[]>
}

export default function Register({ errors }: Props) {
  const { data, setData, post, processing } = useForm({
    user: {
      email: '',
      password: '',
      password_confirmation: '',
      business_name: '',
    },
  })

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    post('/users')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">LendSolo</h1>
          <p className="text-gray-500 mt-1">Create your account</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 space-y-5">
          {errors && Object.keys(errors).length > 0 && (
            <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg">
              <ul className="list-disc list-inside space-y-1">
                {Object.entries(errors).map(([field, messages]) => (
                  <li key={field}>{field} {(messages as string[]).join(', ')}</li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <label htmlFor="business_name" className="block text-sm font-medium text-gray-700 mb-1">
              Business name
            </label>
            <input
              id="business_name"
              type="text"
              autoFocus
              value={data.user.business_name}
              onChange={(e) => setData('user', { ...data.user, business_name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="e.g. Solo Capital LLC"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={data.user.email}
              onChange={(e) => setData('user', { ...data.user, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              required
              value={data.user.password}
              onChange={(e) => setData('user', { ...data.user, password: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
            <p className="mt-1 text-xs text-gray-500">Minimum 6 characters</p>
          </div>

          <div>
            <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700 mb-1">
              Confirm password
            </label>
            <input
              id="password_confirmation"
              type="password"
              autoComplete="new-password"
              required
              value={data.user.password_confirmation}
              onChange={(e) => setData('user', { ...data.user, password_confirmation: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          <button
            type="submit"
            disabled={processing}
            className="w-full py-2.5 px-4 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
          >
            {processing ? 'Creating account...' : 'Create account'}
          </button>

          <p className="text-center text-sm text-gray-600">
            Already have an account?{' '}
            <a href="/users/sign_in" className="text-emerald-600 hover:text-emerald-700 font-medium">
              Sign in
            </a>
          </p>
        </form>
      </div>
    </div>
  )
}
