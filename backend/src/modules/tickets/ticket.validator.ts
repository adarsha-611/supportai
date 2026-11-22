import { z } from 'zod'

export const priorities = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as const
export const statuses = ['OPEN', 'IN_PROGRESS', 'WAITING_FOR_CUSTOMER', 'RESOLVED', 'CLOSED'] as const

export const createTicketSchema = z.object({
  businessId: z.string().uuid(),
  subject: z.string().trim().min(3).max(150),
  description: z.string().trim().min(5).max(5000),
  priority: z.enum(priorities).optional(),
  categoryId: z.string().uuid().optional(),
})

export const listTicketsSchema = z.object({
  businessId: z.string().uuid(),
  status: z.enum(statuses).optional(),
  priority: z.enum(priorities).optional(),
  categoryId: z.string().uuid().optional(),
  agentId: z.string().uuid().optional(),
  search: z.string().trim().max(100).optional(),
  sort: z.enum(['newest', 'oldest', 'updated']).default('newest'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
})

export const updateStatusSchema = z.object({ status: z.enum(statuses) })
export const updatePrioritySchema = z.object({ priority: z.enum(priorities) })
export const assignSchema = z.object({ agentId: z.string().uuid().nullable() })

export type CreateTicketInput = z.infer<typeof createTicketSchema>
export type ListTicketsInput = z.infer<typeof listTicketsSchema>