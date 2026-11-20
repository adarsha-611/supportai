import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { isAxiosError } from 'axios'
import { useAuth } from '../../context/AuthContext'

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters').max(72),
})
type FormValues = z.infer<typeof schema>

export default function RegisterPage() {
  const { register: registerUser } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const onSubmit = async (v: FormValues) => {
    setError('')
    try {
      await registerUser(v.name, v.email, v.password)
      navigate('/dashboard')
    } catch (e) {
      setError(
        isAxiosError(e) && e.response?.status === 409
          ? 'Email is already registered'
          : 'Registration failed',
      )
    }
  }

  const input = 'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm'

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4"
      >
        <h1 className="text-xl font-semibold text-slate-900">Create your account</h1>
        {error && <p className="text-sm text-red-600">{error}</p>}

        <div>
          <input {...register('name')} placeholder="Full name" className={input} />
          {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
        </div>
        <div>
          <input {...register('email')} placeholder="Email" className={input} />
          {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
        </div>
        <div>
          <input {...register('password')} type="password" placeholder="Password" className={input} />
          {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
        </div>

        <button
          disabled={isSubmitting}
          className="w-full rounded-lg bg-blue-600 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {isSubmitting ? 'Creating...' : 'Create account'}
        </button>
        <p className="text-sm text-slate-600">
          Have an account? <Link to="/login" className="text-blue-600">Sign in</Link>
        </p>
      </form>
    </div>
  )
}