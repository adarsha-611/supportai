import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { businessService } from '../../services/businessService'

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid support email'),
  description: z.string().max(500).optional(),
})
type FormValues = z.infer<typeof schema>

export default function CreateBusinessPage() {
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
      await businessService.create(v)
      navigate('/dashboard')
    } catch {
      setError('Could not create the business. Try again.')
    }
  }

  const input = 'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm'

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4"
      >
        <h1 className="text-xl font-semibold text-slate-900">Create your business</h1>
        <p className="text-sm text-slate-600">You will become its admin.</p>
        {error && <p className="text-sm text-red-600">{error}</p>}

        <div>
          <input {...register('name')} placeholder="Business name" className={input} />
          {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
        </div>
        <div>
          <input {...register('email')} placeholder="Support email" className={input} />
          {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
        </div>
        <div>
          <textarea
            {...register('description')}
            placeholder="Description (optional)"
            rows={3}
            className={input}
          />
        </div>

        <button
          disabled={isSubmitting}
          className="w-full rounded-lg bg-blue-600 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {isSubmitting ? 'Creating...' : 'Create business'}
        </button>
      </form>
    </div>
  )
}
