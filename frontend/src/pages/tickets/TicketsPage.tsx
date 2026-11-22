import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { PriorityBadge, StatusBadge } from '../../components/tickets/Badges'
import { useCurrentBusiness } from '../../hooks/useCurrentBusiness'
import { ticketService } from '../../services/ticketService'
import { PRIORITIES, STATUSES } from '../../types/ticket'
import type { TicketList } from '../../types/ticket'

const select = 'rounded-lg border border-slate-300 bg-white px-2 py-2 text-sm'

export default function TicketsPage() {
  const { business, loading: bizLoading } = useCurrentBusiness()
  const [data, setData] = useState<TicketList | null>(null)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [priority, setPriority] = useState('')
  const [sort, setSort] = useState('newest')
  const [page, setPage] = useState(1)

  useEffect(() => {
    if (!business) return
    // small delay so typing in search doesn't fire a request per keystroke
    const timer = setTimeout(() => {
      setError('')
      ticketService
        .list({
          businessId: business.id,
          ...(status ? { status } : {}),
          ...(priority ? { priority } : {}),
          ...(search ? { search } : {}),
          sort,
          page,
          limit: 10,
        })
        .then(setData)
        .catch(() => setError('Could not load tickets'))
    }, 300)
    return () => clearTimeout(timer)
  }, [business, status, priority, search, sort, page])

  if (bizLoading) return <p className="text-slate-500">Loading...</p>
  if (!business) return <p className="text-slate-600">Create a business first.</p>

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.limit)) : 1
  const reset = (fn: (v: string) => void) => (v: string) => {
    fn(v)
    setPage(1)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">Tickets</h1>
        <Link to="/tickets/new" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
          New ticket
        </Link>
      </div>

      <div className="flex flex-wrap gap-2">
        <input
          value={search}
          onChange={(e) => reset(setSearch)(e.target.value)}
          placeholder="Search tickets"
          className="min-w-48 flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
        <select value={status} onChange={(e) => reset(setStatus)(e.target.value)} className={select}>
          <option value="">All statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
        </select>
        <select value={priority} onChange={(e) => reset(setPriority)(e.target.value)} className={select}>
          <option value="">All priorities</option>
          {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
        <select value={sort} onChange={(e) => reset(setSort)(e.target.value)} className={select}>
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="updated">Recently updated</option>
        </select>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {!data && !error && <p className="text-slate-500">Loading tickets...</p>}
      {data && data.items.length === 0 && (
        <p className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
          No tickets found.
        </p>
      )}

      {data && data.items.length > 0 && (
        <ul className="space-y-2">
          {data.items.map((t) => (
            <li key={t.id}>
              <Link to={`/tickets/${t.id}`} className="block rounded-lg border border-slate-200 bg-white p-4 hover:border-blue-300">
                <div className="flex items-start justify-between gap-3">
                  <p className="font-medium text-slate-900">{t.subject}</p>
                  <div className="flex shrink-0 gap-2">
                    <PriorityBadge priority={t.priority} />
                    <StatusBadge status={t.status} />
                  </div>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  {t.customer.name} · {t.agent ? `Assigned to ${t.agent.name}` : 'Unassigned'} ·{' '}
                  {new Date(t.createdAt).toLocaleDateString()}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {data && data.total > data.limit && (
        <div className="flex items-center justify-between text-sm">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="rounded-lg border border-slate-300 px-3 py-1 disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-slate-600">Page {page} of {totalPages}</span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-lg border border-slate-300 px-3 py-1 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}