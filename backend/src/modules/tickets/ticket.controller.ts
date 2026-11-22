import type { Request, Response } from 'express'
import { requireParam } from '../../utils/requireParam.js'
import { requireUser } from '../../utils/requireUser.js'
import { ticketService } from './ticket.service.js'
import {
  assignSchema,
  createTicketSchema,
  listTicketsSchema,
  updatePrioritySchema,
  updateStatusSchema,
} from './ticket.validator.js'

export async function createTicket(req: Request, res: Response) {
  const input = createTicketSchema.parse(req.body)
  res.status(201).json({ success: true, data: await ticketService.create(requireUser(req).id, input) })
}

export async function listTickets(req: Request, res: Response) {
  const query = listTicketsSchema.parse(req.query)
  res.json({ success: true, data: await ticketService.list(requireUser(req).id, query) })
}

export async function getTicket(req: Request, res: Response) {
  res.json({ success: true, data: await ticketService.getById(requireUser(req).id, requireParam(req, 'id')) })
}

export async function updateStatus(req: Request, res: Response) {
  const { status } = updateStatusSchema.parse(req.body)
  res.json({ success: true, data: await ticketService.updateStatus(requireUser(req).id, requireParam(req, 'id'), status) })
}

export async function updatePriority(req: Request, res: Response) {
  const { priority } = updatePrioritySchema.parse(req.body)
  res.json({ success: true, data: await ticketService.updatePriority(requireUser(req).id, requireParam(req, 'id'), priority) })
}

export async function assignTicket(req: Request, res: Response) {
  const { agentId } = assignSchema.parse(req.body)
  res.json({ success: true, data: await ticketService.assign(requireUser(req).id, requireParam(req, 'id'), agentId) })
}

export async function getTicketEvents(req: Request, res: Response) {
  res.json({ success: true, data: await ticketService.events(requireUser(req).id, requireParam(req, 'id')) })
}