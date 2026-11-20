import type { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { AppError } from '../utils/AppError.js'
import { userRepository } from '../modules/users/user.repository.js'

export async function authenticate(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) {
    throw new AppError(401, 'Authentication required')
  }

  const secret = process.env.JWT_ACCESS_SECRET
  if (!secret) throw new Error('JWT_ACCESS_SECRET is not set in .env')

  let userId: string
  try {
    const payload = jwt.verify(header.slice(7), secret)
    if (typeof payload === 'string' || !payload.sub) throw new Error('bad payload')
    userId = payload.sub
  } catch {
    throw new AppError(401, 'Invalid or expired token')
  }

  const user = await userRepository.findById(userId)
  if (!user || !user.isActive) throw new AppError(401, 'Invalid or expired token')

  req.user = { id: user.id, name: user.name, email: user.email }
  next()
}