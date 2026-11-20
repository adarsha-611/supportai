import type { NextFunction, Request, Response } from 'express'
import { ZodError } from 'zod'
import { AppError } from '../utils/AppError.js'

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: err.issues.map((i) => ({ path: i.path.join('.'), message: i.message })),
    })
  }
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ success: false, message: err.message })
  }
  console.error('Unhandled error:', err instanceof Error ? err.message : err)
  return res.status(500).json({ success: false, message: 'Internal server error' })
}