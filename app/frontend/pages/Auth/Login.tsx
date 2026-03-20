import { useForm } from '@inertiajs/react'
import { FormEvent } from 'react'

interface Props {
  errors?: { email?: string }
}

export default function Login({ errors }: Props) {
  const { data, setData, post, processing } = useForm({
    user: {
      email: '',
      password: '',
      remember_me: '0' as string,
    },
  })

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    post('/users/sign_in')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">LendSolo</h1>
          <p className="text-gray-500 mt-1">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 space-y-5">
          {errors?.email && (
            <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg">
              {errors.email}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              autoFocus
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
              autoComplete="current-password"
              required
              value={data.user.password}
              onChange={(e) => setData('user', { ...data.user, password: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={data.user.remember_me === '1'}
                onChange={(e) => setData('user', { ...data.user, remember_me: e.target.checked ? '1' : '0' })}
                className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
              />
              Remember me
            </label>
          </div>

          <button
            type="submit"
            disabled={processing}
            className="w-full py-2.5 px-4 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
          >
            {processing ? 'Signing in...' : 'Sign in'}
          </button>

          <p className="text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <a href="/users/sign_up" className="text-emerald-600 hover:text-emerald-700 font-medium">
              Sign up
            </a>
          </p>
        </form>
      </div>
    </div>
  )
}
