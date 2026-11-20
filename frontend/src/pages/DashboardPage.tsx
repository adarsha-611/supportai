import { useAuth } from '../context/AuthContext'

export default function DashboardPage() {
  const { user, logout } = useAuth()
  return (
    <div className="p-8 space-y-4">
      <h1 className="text-2xl font-semibold text-slate-900">Welcome, {user?.name}</h1>
      <p className="text-slate-600">{user?.email}</p>
      <button onClick={logout} className="rounded-lg bg-slate-900 px-4 py-2 text-sm text-white">
        Log out
      </button>
    </div>
  )
}