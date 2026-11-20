import type { NextFunction, Request, Response } from 'express'
import { AppError } from '../utils/AppError.js'
import { businessRepository } from '../modules/businesses/business.repository.js'

// Usage: requireBusinessRole('BUSINESS_ADMIN', 'AGENT')
// Reads the business id from the URL (:id) and checks the membership in the database.
export function requireBusinessRole(...allowed: string[]) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) throw new AppError(401, 'Authentication required')

    const businessId = req.params.id
    if (typeof businessId !== 'string') throw new AppError(400, 'Business id required')

    const membership = await businessRepository.findMembership(req.user.id, businessId)
    // Same 403 for "not a member" and "business doesn't exist": don't leak which ids exist
    if (!membership || !allowed.includes(membership.role)) {
      throw new AppError(403, 'You do not have access to this business')
    }
    next()
  }
}