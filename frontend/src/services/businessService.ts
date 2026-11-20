import { api } from './api'
import type { Business } from '../types/business'

export const businessService = {
  async listMine(): Promise<Business[]> {
    const res = await api.get('/businesses')
    return res.data.data
  },

  async create(input: { name: string; email: string; description?: string }) {
    const res = await api.post('/businesses', input)
    return res.data.data
  },
}