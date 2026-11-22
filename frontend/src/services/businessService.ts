import { api } from './api'
import type { Business,Member,PendingInvitation } from '../types/business'

export const businessService = {
  async listMine(): Promise<Business[]> {
    const res = await api.get('/businesses')
    return res.data.data
  },

  async create(input: { name: string; email: string; description?: string }) {
    const res = await api.post('/businesses', input)
    return res.data.data
  },

    async listMembers(businessId: string): Promise<Member[]> {
    const res = await api.get(`/businesses/${businessId}/members`)
    return res.data.data
  },

  async listInvitations(businessId: string): Promise<PendingInvitation[]> {
    const res = await api.get(`/businesses/${businessId}/invitations`)
    return res.data.data
  },

  async invite(businessId: string, email: string, role: 'AGENT' | 'BUSINESS_ADMIN') {
    const res = await api.post(`/businesses/${businessId}/invitations`, { email, role })
    return res.data.data as { inviteLink: string }
  },

  async acceptInvite(token: string) {
    const res = await api.post('/invitations/accept', { token })
    return res.data.data
  },
}

