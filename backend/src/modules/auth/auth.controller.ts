import type { Request, Response } from 'express'
import { authService } from './auth.service.js'
import { loginSchema, registerSchema } from './auth.validator.js'

export async function register(req: Request, res: Response) {
  const input = registerSchema.parse(req.body)
  const result = await authService.register(input)
  res.status(201).json({ success: true, data: result })
}

export async function login(req: Request, res: Response) {
  const input = loginSchema.parse(req.body)
  const result = await authService.login(input)
  res.json({ success: true, data: result })
}
export async function me(req: Request, res: Response) {
  res.json({ success: true, data: { user: req.user } })
}