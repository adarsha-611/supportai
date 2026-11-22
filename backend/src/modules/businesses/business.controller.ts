import type { Request, Response } from 'express'
import { AppError } from '../../utils/AppError.js'
import { businessService } from './business.service.js'
import { createBusinessSchema } from './business.validator.js'
import { requireParam } from '../../utils/requireParam.js'
import { businessRepository } from './business.repository.js'

export async function createBusiness(req: Request, res: Response) {
  if (!req.user) throw new AppError(401, 'Authentication required')
  const input = createBusinessSchema.parse(req.body)
  const business = await businessService.create(req.user.id, input)
  res.status(201).json({ success: true, data: business })
}

export async function listMyBusinesses(req: Request, res: Response) {
  if (!req.user) throw new AppError(401, 'Authentication required')
  res.json({ success: true, data: await businessService.listMine(req.user.id) })
}

export async function getBusiness(req: Request, res: Response) {
  const id = req.params.id
  if (typeof id !== 'string') throw new AppError(400, 'Business id required')
  res.json({ success: true, data: await businessService.getById(id) })
}
export async function listMembers(req: Request, res: Response) {
  res.json({ success: true, data: await businessRepository.listMembers(requireParam(req, 'id')) })
}