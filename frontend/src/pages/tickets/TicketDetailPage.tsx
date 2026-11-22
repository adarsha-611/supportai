import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { isAxiosError } from 'axios'
import { PriorityBadge, StatusBadge } from '../../components/tickets/Badges'
import { useCurrentBusiness } from '../../hooks/useCurrentBusiness'
import { businessService } from '../../services/businessService'
import { ticketService } from '../../services/ticketService'
import { PRIORITIES, STATUSES } from '../../types/ticket'
import type { Ticket, TicketEvent } from '../../types/ticket'
import type { Member } from '../../types/business'

export default function TicketDetailPage() {
  const { id } = useParams()
  const { business } = useCurrentBusiness()
  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [events, setEvents] = useState<TicketEvent[]>([])
  const [agents, setAgents] = useState<Member[]>([])
  const [error, setError] = useState('')

  const role = business?.role
  const isStaff = role === 'BUSINESS_ADMIN' || role === 'AGENT'
  const isAdmin = role === 'BUSINESS_ADMIN'

  useEffect(() => {
    if (!id) return
    ticketService.getById(id).then(setTicket).catch(() => setError('Ticket not found'))
  }, [id])

  useEffect(() => {
    if (!id || !business) return
    if (isStaff) ticketService.events(id).then(setEvents).catch(() => setEvents([]))
    if (isAdmin) {
      businessService
        .listMembers(business.id)
        .then((m) => setAgents(m.filter((x) => x.role === 'AGENT' || x.role === 'BUSINESS_ADMIN')))
        .catch(() => setAgents([]))
    }
  }, [id, business, isStaff, isAdmin, ticket?.updatedAt])

  const run = async (action: () => Promise<Ticket>) => {
    setError('')
    try {
      setTicket(await action())
    } catch (e) {
      setError(isAxiosError(e) ? (e.response?.data?.message ?? 'Update failed') : 'Update failed')
    }
  }

  if (error && !ticket) return <p className="text-red-600">{error}</p>
  if (!ticket || !id) return <p className="text-slate-500">Loading...</p>

  const select = 'rounded-lg border border-slate-300 bg-white px-2 py-2 text-sm'

  return (
    <div className="max-w-3xl space-y-6">
      <Link to="/tickets" className="text-sm text-blue-600">&larr; Back to tickets</Link>

      <div className="space-y-2 rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-xl font-semibold text-slate-900">{ticket.subject}</h1>
          <div className="flex gap-2">
            <PriorityBadge priority={ticket.priority} />
            <StatusBadge status={ticket.status} />
          </div>
        </div>
        <p className="text-xs text-slate-500">
          By {ticket.customer.name} · {new Date(ticket.createdAt).toLocaleString()} ·{' '}
          {ticket.agent ? `Assigned to ${ticket.agent.name}` : 'Unassigned'}
        </p>
        <p className="whitespace-pre-wrap pt-2 text-sm text-slate-800">{ticket.description}</p>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {isStaff && (
        <div className="flex flex-wrap gap-3 rounded-xl border border-slate-200 bg-white p-4">
          <label className="text-sm text-slate-600">
            Status
            <select
              value={ticket.status}
              onChange={(e) => run(() => ticketService.updateStatus(id, e.target.value))}
              className={`${select} ml-2`}
            >
              {STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
            </select>
          </label>
          <label className="text-sm text-slate-600">
            Priority
            <select
              value={ticket.priority}
              onChange={(e) => run(() => ticketService.updatePriority(id, e.target.value))}
              className={`${select} ml-2`}
            >
              {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </label>
          {isAdmin && (
            <label className="text-sm text-slate-600">
              Assignee
              <select
                value={ticket.agent?.id ?? ''}
                onChange={(e) => run(() => ticketService.assign(id, e.target.value || null))}
                className={`${select} ml-2`}
              >
                <option value="">Unassigned</option>
                {agents.map((m) => <option key={m.user.id} value={m.user.id}>{m.user.name}</option>)}
              </select>
            </label>
          )}
        </div>
      )}

      {isStaff && (
        <section>
          <h2 className="mb-2 font-medium text-slate-800">History</h2>
          <ul className="space-y-1 text-sm text-slate-600">
            {events.map((e) => (
              <li key={e.id}>
                <span className="text-slate-400">{new Date(e.createdAt).toLocaleString()}</span> · {e.actor.name}:{' '}
                {e.eventType.replace(/_/g, ' ').toLowerCase()}
                {e.newValue ? ` → ${e.newValue.replace(/_/g, ' ')}` : ''}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}