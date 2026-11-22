import type { Request, Response } from 'express'
import { AppError } from '../../utils/AppError.js'
import { requireParam } from '../../utils/requireParam.js'
import { invitationService } from './invitation.service.js'
import { acceptInvitationSchema, createInvitationSchema } from './invitation.validator.js'

export async function createInvitation(req: Request, res: Response) {
  const input = createInvitationSchema.parse(req.body)
  const result = await invitationService.create(requireParam(req, 'id'), input)
  res.status(201).json({ success: true, data: result })
}

export async function listInvitations(req: Request, res: Response) {
  res.json({ success: true, data: await invitationService.listPending(requireParam(req, 'id')) })
}

export async function acceptInvitation(req: Request, res: Response) {
  if (!req.user) throw new AppError(401, 'Authentication required')
  const { token } = acceptInvitationSchema.parse(req.body)
  res.json({ success: true, data: await invitationService.accept(req.user, token) })
}