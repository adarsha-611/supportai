import type { Prisma } from '../../generated/prisma/client.js'
import { AppError } from '../../utils/AppError.js'
import { businessRepository } from '../businesses/business.repository.js'
import { ticketRepository } from './ticket.repository.js'
import type { CreateTicketInput, ListTicketsInput } from './ticket.validator.js'

async function requireMembership(userId: string, businessId: string) {
  const membership = await businessRepository.findMembership(userId, businessId)
  if (!membership) throw new AppError(403, 'You do not have access to this business')
  return membership
}

// Which tickets a role may see, decided on the server
function visibilityWhere(role: string, userId: string): Prisma.TicketWhereInput {
  if (role === 'BUSINESS_ADMIN') return {}
  if (role === 'AGENT') return { OR: [{ assignedAgentId: userId }, { assignedAgentId: null }] }
  return { customerId: userId }
}

const isStaff = (role: string) => role === 'BUSINESS_ADMIN' || role === 'AGENT'

// Returns the ticket only if this user may see it; otherwise 404 (no id leaking)
async function loadVisibleTicket(userId: string, ticketId: string) {
  const ticket = await ticketRepository.findById(ticketId)
  if (!ticket) throw new AppError(404, 'Ticket not found')

  const membership = await businessRepository.findMembership(userId, ticket.businessId)
  if (!membership) throw new AppError(404, 'Ticket not found')

  const role = membership.role
  const allowed =
    role === 'BUSINESS_ADMIN' ||
    (role === 'AGENT' && (ticket.assignedAgentId === null || ticket.assignedAgentId === userId)) ||
    (role === 'CUSTOMER' && ticket.customerId === userId)
  if (!allowed) throw new AppError(404, 'Ticket not found')

  return { ticket, role }
}

export const ticketService = {
  async create(userId: string, input: CreateTicketInput) {
    await requireMembership(userId, input.businessId)

    if (input.categoryId) {
      const ok = await ticketRepository.categoryBelongsToBusiness(input.categoryId, input.businessId)
      if (!ok) throw new AppError(400, 'Invalid category')
    }

    return ticketRepository.create({
      businessId: input.businessId,
      customerId: userId,
      subject: input.subject,
      description: input.description,
      ...(input.priority ? { priority: input.priority } : {}),
      ...(input.categoryId ? { categoryId: input.categoryId } : {}),
      events: { create: { actorId: userId, eventType: 'CREATED', newValue: 'OPEN' } },
    })
  },

  async list(userId: string, q: ListTicketsInput) {
    const membership = await requireMembership(userId, q.businessId)

    const filters: Prisma.TicketWhereInput[] = [
      { businessId: q.businessId },
      visibilityWhere(membership.role, userId),
    ]
    if (q.status) filters.push({ status: q.status })
    if (q.priority) filters.push({ priority: q.priority })
    if (q.categoryId) filters.push({ categoryId: q.categoryId })
    if (q.agentId) filters.push({ assignedAgentId: q.agentId })
    if (q.search) {
      filters.push({
        OR: [
          { subject: { contains: q.search, mode: 'insensitive' } },
          { description: { contains: q.search, mode: 'insensitive' } },
        ],
      })
    }

    const orderBy: Prisma.TicketOrderByWithRelationInput =
      q.sort === 'oldest' ? { createdAt: 'asc' } : q.sort === 'updated' ? { updatedAt: 'desc' } : { createdAt: 'desc' }

    const { items, total } = await ticketRepository.list({ AND: filters }, orderBy, (q.page - 1) * q.limit, q.limit)
    return { items, total, page: q.page, limit: q.limit }
  },

  async getById(userId: string, ticketId: string) {
    return (await loadVisibleTicket(userId, ticketId)).ticket
  },

  async updateStatus(userId: string, ticketId: string, status: string) {
    const { ticket, role } = await loadVisibleTicket(userId, ticketId)
    if (!isStaff(role)) throw new AppError(403, 'Only staff can change ticket status')
    if (ticket.status === status) return ticket

    const done = status === 'RESOLVED' || status === 'CLOSED'
    return ticketRepository.updateWithEvent(
      ticketId,
      { status: status as never, resolvedAt: done ? (ticket.resolvedAt ?? new Date()) : null },
      { actorId: userId, eventType: 'STATUS_CHANGED', oldValue: ticket.status, newValue: status },
    )
  },

  async updatePriority(userId: string, ticketId: string, priority: string) {
    const { ticket, role } = await loadVisibleTicket(userId, ticketId)
    if (!isStaff(role)) throw new AppError(403, 'Only staff can change priority')
    if (ticket.priority === priority) return ticket

    return ticketRepository.updateWithEvent(
      ticketId,
      { priority: priority as never },
      { actorId: userId, eventType: 'PRIORITY_CHANGED', oldValue: ticket.priority, newValue: priority },
    )
  },

  async assign(userId: string, ticketId: string, agentId: string | null) {
    const { ticket, role } = await loadVisibleTicket(userId, ticketId)
    if (role !== 'BUSINESS_ADMIN') throw new AppError(403, 'Only admins can assign tickets')

    if (agentId) {
      const target = await businessRepository.findMembership(agentId, ticket.businessId)
      if (!target || !isStaff(target.role)) throw new AppError(400, 'Agent must be staff of this business')
    }

    return ticketRepository.updateWithEvent(
      ticketId,
      { assignedAgentId: agentId },
      { actorId: userId, eventType: 'ASSIGNED', oldValue: ticket.assignedAgentId, newValue: agentId },
    )
  },

  async events(userId: string, ticketId: string) {
    const { role } = await loadVisibleTicket(userId, ticketId)
    if (!isStaff(role)) throw new AppError(403, 'Only staff can view ticket history')
    return ticketRepository.listEvents(ticketId)
  },
}