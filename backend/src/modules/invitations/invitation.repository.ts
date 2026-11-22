import { prisma } from '../../config/prisma.js'

export const invitationRepository = {
  create: (data: {
    businessId: string
    email: string
    role: 'AGENT' | 'BUSINESS_ADMIN'
    tokenHash: string
    expiresAt: Date
  }) => prisma.invitation.create({ data }),

  listPending: (businessId: string) =>
    prisma.invitation.findMany({
      where: { businessId, status: 'PENDING' },
      orderBy: { createdAt: 'desc' },
      select: { id: true, email: true, role: true, expiresAt: true, createdAt: true },
    }),

  findPendingForEmail: (businessId: string, email: string) =>
    prisma.invitation.findFirst({ where: { businessId, email, status: 'PENDING' } }),

  findByHash: (tokenHash: string) =>
    prisma.invitation.findUnique({ where: { tokenHash } }),

  // Membership + status change succeed together or not at all
  accept: (invitationId: string, userId: string, businessId: string, role: 'AGENT' | 'BUSINESS_ADMIN') =>
    prisma.$transaction([
      prisma.membership.create({ data: { userId, businessId, role } }),
      prisma.invitation.update({ where: { id: invitationId }, data: { status: 'ACCEPTED' } }),
    ]),
}