import { z } from 'zod'

export const createInvitationSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  role: z.enum(['AGENT', 'BUSINESS_ADMIN']),
})

export const acceptInvitationSchema = z.object({
  token: z.string().min(10),
})