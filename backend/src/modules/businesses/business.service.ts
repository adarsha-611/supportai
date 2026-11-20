import crypto from 'node:crypto'
import { AppError } from '../../utils/AppError.js'
import { businessRepository } from './business.repository.js'

function makeSlug(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40)
  return `${base || 'business'}-${crypto.randomBytes(3).toString('hex')}`
}

export const businessService = {
create(userId: string, input: { name: string; email: string; description?: string | undefined }) {    const data = {
      name: input.name,
      email: input.email,
      slug: makeSlug(input.name),
      ...(input.description ? { description: input.description } : {}),
    }
    return businessRepository.createWithAdmin(data, userId)
  },

  async listMine(userId: string) {
    const memberships = await businessRepository.listForUser(userId)
    return memberships.map((m) => ({ ...m.business, role: m.role }))
  },

  async getById(id: string) {
    const business = await businessRepository.findById(id)
    if (!business) throw new AppError(404, 'Business not found')
    return business
  },
}