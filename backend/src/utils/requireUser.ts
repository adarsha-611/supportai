import type { Request } from 'express'
import { AppError } from './AppError.js'

export function requireUser(req: Request) {
  if (!req.user) throw new AppError(401, 'Authentication required')
  return req.user
}