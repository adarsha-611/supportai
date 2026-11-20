import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { isAxiosError } from 'axios'

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
})
type FormValues = z.infer<typeof schema>

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const onSubmit = async (values: FormValues) => {
    setError('')
    try {
      await login(values.email, values.password)
      navigate('/dashboard')
        } catch (e) {
      if (isAxiosError(e) && e.response) {
        setError(e.response.data?.message ?? `Server error (${e.response.status})`)
      } else {
        setError('Cannot reach the server. Is the backend running?')
      }
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4"
      >
        <h1 className="text-xl font-semibold text-slate-900">Sign in to SupportAI</h1>
        {error && <p className="text-sm text-red-600">{error}</p>}

        <div>
          <input
            {...register('email')}
            placeholder="Email"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
        </div>

        <div>
          <input
            {...register('password')}
            type="password"
            placeholder="Password"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
        </div>

        <button
          disabled={isSubmitting}
          className="w-full rounded-lg bg-blue-600 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {isSubmitting ? 'Signing in...' : 'Sign in'}
        </button>
        <p className="text-sm text-slate-600">
          No account? <Link to="/register" className="text-blue-600">Register</Link>
        </p>
      </form>
    </div>
  )
}