import { useCallback, useEffect, useState } from 'react'
import { isAxiosError } from 'axios'
import { businessService } from '../../services/businessService'
import type { Business, Member, PendingInvitation } from '../../types/business'

export default function TeamPage() {
  const [business, setBusiness] = useState<Business | null>(null)
  const [members, setMembers] = useState<Member[]>([])
  const [pending, setPending] = useState<PendingInvitation[]>([])
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<'AGENT' | 'BUSINESS_ADMIN'>('AGENT')
  const [link, setLink] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const load = useCallback(async (biz: Business) => {
    const [m, p] = await Promise.all([
      businessService.listMembers(biz.id),
      businessService.listInvitations(biz.id),
    ])
    setMembers(m)
    setPending(p)
  }, [])

  useEffect(() => {
    businessService
      .listMine()
      .then(async (list) => {
        const admin = list.find((b) => b.role === 'BUSINESS_ADMIN')
        if (admin) {
          setBusiness(admin)
          await load(admin)
        }
      })
      .finally(() => setLoading(false))
  }, [load])

  const onInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!business) return
    setError('')
    setLink('')
    try {
      const res = await businessService.invite(business.id, email, role)
      setLink(res.inviteLink)
      setEmail('')
      await load(business)
    } catch (err) {
      setError(isAxiosError(err) ? (err.response?.data?.message ?? 'Failed') : 'Failed')
    }
  }

  if (loading) return <p className="text-slate-500">Loading...</p>
  if (!business) return <p className="text-slate-600">Only business admins can manage the team.</p>

  return (
    <div className="max-w-2xl space-y-8">
      <h1 className="text-2xl font-semibold text-slate-900">Team: {business.name}</h1>

      <form onSubmit={onInvite} className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
        <h2 className="font-medium text-slate-800">Invite a member</h2>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex gap-2">
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as 'AGENT' | 'BUSINESS_ADMIN')}
            className="rounded-lg border border-slate-300 px-2 text-sm"
          >
            <option value="AGENT">Agent</option>
            <option value="BUSINESS_ADMIN">Admin</option>
          </select>
          <button className="rounded-lg bg-blue-600 px-4 text-sm font-medium text-white hover:bg-blue-700">
            Invite
          </button>
        </div>
        {link && (
          <p className="break-all rounded-lg bg-slate-50 p-2 text-xs text-slate-700">
            Share this link: {link}
          </p>
        )}
      </form>

      <section>
        <h2 className="mb-2 font-medium text-slate-800">Members</h2>
        <ul className="space-y-2">
          {members.map((m) => (
            <li key={m.id} className="flex justify-between rounded-lg border border-slate-200 bg-white p-3 text-sm">
              <span>{m.user.name} ({m.user.email})</span>
              <span className="text-slate-500">{m.role}</span>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="mb-2 font-medium text-slate-800">Pending invitations</h2>
        {pending.length === 0 ? (
          <p className="text-sm text-slate-500">None</p>
        ) : (
          <ul className="space-y-2">
            {pending.map((p) => (
              <li key={p.id} className="flex justify-between rounded-lg border border-slate-200 bg-white p-3 text-sm">
                <span>{p.email}</span>
                <span className="text-slate-500">{p.role}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}