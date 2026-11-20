import { api, setAccessToken } from './api'
import type { User } from '../types/auth'

interface Session {
  user: User
  accessToken: string
}

async function handle(request: Promise<{ data: { data: Session } }>): Promise<User> {
  const res = await request
  setAccessToken(res.data.data.accessToken)
  return res.data.data.user
}

export const authService = {
  login: (email: string, password: string) =>
    handle(api.post('/auth/login', { email, password })),

  register: (name: string, email: string, password: string) =>
    handle(api.post('/auth/register', { name, email, password })),

  refresh: () => handle(api.post('/auth/refresh')),

  async logout() {
    await api.post('/auth/logout')
    setAccessToken(null)
  },
}