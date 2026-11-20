import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { businessService } from '../services/businessService'
import type { Business } from '../types/business'

export default function DashboardPage() {
  const { user, logout } = useAuth()
  const [businesses, setBusinesses] = useState<Business[] | null>(null)

  useEffect(() => {
    businessService.listMine().then(setBusinesses).catch(() => setBusinesses([]))
  }, [])

  if (businesses === null) return <div className="p-8 text-slate-500">Loading...</div>
  if (businesses.length === 0) return <Navigate to="/onboarding" replace />

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">Welcome, {user?.name}</h1>
        <button onClick={logout} className="rounded-lg bg-slate-900 px-4 py-2 text-sm text-white">
          Log out
        </button>
      </div>
      <h2 className="text-lg font-medium text-slate-800">Your businesses</h2>
      <ul className="space-y-2">
        {businesses.map((b) => (
          <li key={b.id} className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="font-medium text-slate-900">{b.name}</p>
            <p className="text-sm text-slate-500">{b.role}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}