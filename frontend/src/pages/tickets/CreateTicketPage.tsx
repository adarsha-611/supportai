import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { useCurrentBusiness } from '../../hooks/useCurrentBusiness'
import { ticketService } from '../../services/ticketService'
import { PRIORITIES } from '../../types/ticket'

const schema = z.object({
  subject: z.string().min(3, 'Subject must be at least 3 characters').max(150),
  description: z.string().min(5, 'Please describe the problem').max(5000),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
})
type FormValues = z.infer<typeof schema>

export default function CreateTicketPage() {
  const { business, loading } = useCurrentBusiness()
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { priority: 'MEDIUM' } })

  const onSubmit = async (v: FormValues) => {
    if (!business) return
    setError('')
    try {
      const ticket = await ticketService.create({ businessId: business.id, ...v })
      navigate(`/tickets/${ticket.id}`)
    } catch {
      setError('Could not create the ticket. Try again.')
    }
  }

  if (loading) return <p className="text-slate-500">Loading...</p>
  const input = 'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm'

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-xl space-y-4">
      <h1 className="text-2xl font-semibold text-slate-900">New ticket</h1>
      {error && <p className="text-sm text-red-600">{error}</p>}

      <div>
        <input {...register('subject')} placeholder="Subject" className={input} />
        {errors.subject && <p className="mt-1 text-xs text-red-600">{errors.subject.message}</p>}
      </div>
      <div>
        <textarea {...register('description')} placeholder="Describe the problem" rows={6} className={input} />
        {errors.description && <p className="mt-1 text-xs text-red-600">{errors.description.message}</p>}
      </div>
      <select {...register('priority')} className={input}>
        {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
      </select>

      <button
        disabled={isSubmitting || !business}
        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
      >
        {isSubmitting ? 'Creating...' : 'Create ticket'}
      </button>
    </form>
  )
}