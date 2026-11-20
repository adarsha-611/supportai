import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { LayoutDashboard, LogOut, Menu, PanelLeftClose, PanelLeftOpen, Ticket, X } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/tickets', label: 'Tickets', icon: Ticket },
]

export default function AppLayout() {
  const { user, logout } = useAuth()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  const sidebar = (
    <nav className="flex h-full flex-col gap-1 p-3">
      <div className="mb-4 px-2 text-lg font-semibold text-slate-900">
        {collapsed ? 'S' : 'SupportAI'}
      </div>
      {navItems.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          onClick={() => setMobileOpen(false)}
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium ${
              isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-100'
            }`
          }
        >
          <Icon size={18} />
          {!collapsed && label}
        </NavLink>
      ))}
    </nav>
  )

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Desktop sidebar */}
      <aside
        className={`hidden border-r border-slate-200 bg-white md:block ${
          collapsed ? 'w-16' : 'w-60'
        }`}
      >
        {sidebar}
      </aside>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-slate-900/40" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-60 bg-white shadow-xl">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute right-2 top-2 p-1 text-slate-500"
              aria-label="Close menu"
            >
              <X size={18} />
            </button>
            {sidebar}
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMobileOpen(true)}
              className="p-1 text-slate-600 md:hidden"
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>
            <button
              onClick={() => setCollapsed((c) => !c)}
              className="hidden p-1 text-slate-600 md:block"
              aria-label="Toggle sidebar"
            >
              {collapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
            </button>
          </div>

          <div className="relative">
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-sm font-medium text-white"
            >
              {user?.name.charAt(0).toUpperCase()}
            </button>
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-lg border border-slate-200 bg-white p-2 shadow-lg">
                <p className="px-2 py-1 text-sm font-medium text-slate-900">{user?.name}</p>
                <p className="px-2 pb-2 text-xs text-slate-500">{user?.email}</p>
                <button
                  onClick={logout}
                  className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm text-slate-700 hover:bg-slate-100"
                >
                  <LogOut size={16} /> Log out
                </button>
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}