import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './routes/ProtectedRoute'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import CreateBusinessPage from './pages/onboarding/CreateBusinessPage'
import AppLayout from './components/layout/AppLayout'
import TeamPage from './pages/admin/TeamPage'
import AcceptInvitePage from './pages/auth/AcceptInvitePage'
import TicketsPage from './pages/tickets/TicketsPage'
import CreateTicketPage from './pages/tickets/CreateTicketPage'
import TicketDetailPage from './pages/tickets/TicketDetailPage'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/onboarding" element={<CreateBusinessPage />} />
            <Route path="/accept-invite" element={<AcceptInvitePage />} />

            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/team" element={<TeamPage />} />
              <Route path="/tickets" element={<TicketsPage />} />
              <Route path="/tickets/new" element={<CreateTicketPage />} />
              <Route path="/tickets/:id" element={<TicketDetailPage />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App