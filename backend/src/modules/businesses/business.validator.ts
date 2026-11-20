import { z } from 'zod'

export const createBusinessSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().toLowerCase().email(),
  description: z.string().trim().max(500).optional(),
})