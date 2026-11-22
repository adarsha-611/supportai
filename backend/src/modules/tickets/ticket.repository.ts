import { prisma } from '../../config/prisma.js'
import type { Prisma } from '../../generated/prisma/client.js'

const include = {
  customer: { select: { id: true, name: true, email: true } },
  agent: { select: { id: true, name: true, email: true } },
  category: { select: { id: true, name: true } },
} satisfies Prisma.TicketInclude

export const ticketRepository = {
  // The ticket and its CREATED event are written together
  create: (data: Prisma.TicketUncheckedCreateInput) => prisma.ticket.create({ data, include }),

  findById: (id: string) => prisma.ticket.findUnique({ where: { id }, include }),

  list: async (
    where: Prisma.TicketWhereInput,
    orderBy: Prisma.TicketOrderByWithRelationInput,
    skip: number,
    take: number,
  ) => {
    const [items, total] = await prisma.$transaction([
      prisma.ticket.findMany({ where, orderBy, skip, take, include }),
      prisma.ticket.count({ where }),
    ])
    return { items, total }
  },

  // Ticket update and its history event succeed together or not at all
  updateWithEvent: async (
    ticketId: string,
    data: Prisma.TicketUncheckedUpdateInput,
    event: { actorId: string; eventType: string; oldValue: string | null; newValue: string | null },
  ) => {
    const [ticket] = await prisma.$transaction([
      prisma.ticket.update({ where: { id: ticketId }, data, include }),
      prisma.ticketEvent.create({ data: { ticketId, ...event } }),
    ])
    return ticket
  },

  listEvents: (ticketId: string) =>
    prisma.ticketEvent.findMany({
      where: { ticketId },
      orderBy: { createdAt: 'asc' },
      include: { actor: { select: { id: true, name: true } } },
    }),

  categoryBelongsToBusiness: (categoryId: string, businessId: string) =>
    prisma.category.findFirst({ where: { id: categoryId, businessId, isActive: true } }),
}