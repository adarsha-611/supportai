import { api } from './api'
import type { Ticket, TicketEvent, TicketList } from '../types/ticket'

export interface TicketFilters {
  businessId: string
  status?: string
  priority?: string
  search?: string
  sort?: string
  page: number
  limit: number
}

export const ticketService = {
  async list(filters: TicketFilters): Promise<TicketList> {
    const res = await api.get('/tickets', { params: filters })
    return res.data.data
  },

  async create(input: { businessId: string; subject: string; description: string; priority?: string }): Promise<Ticket> {
    const res = await api.post('/tickets', input)
    return res.data.data
  },

  async getById(id: string): Promise<Ticket> {
    const res = await api.get(`/tickets/${id}`)
    return res.data.data
  },

  async updateStatus(id: string, status: string): Promise<Ticket> {
    const res = await api.patch(`/tickets/${id}/status`, { status })
    return res.data.data
  },

  async updatePriority(id: string, priority: string): Promise<Ticket> {
    const res = await api.patch(`/tickets/${id}`, { priority })
    return res.data.data
  },

  async assign(id: string, agentId: string | null): Promise<Ticket> {
    const res = await api.patch(`/tickets/${id}/assign`, { agentId })
    return res.data.data
  },

  async events(id: string): Promise<TicketEvent[]> {
    const res = await api.get(`/tickets/${id}/events`)
    return res.data.data
  },
}