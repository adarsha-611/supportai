import type { Request } from 'express'
import { AppError } from './AppError.js'

export function requireParam(req: Request, name: string): string {
  const value = req.params[name]
  if (typeof value !== 'string') throw new AppError(400, `${name} is required`)
  return value
}