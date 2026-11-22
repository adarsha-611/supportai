import { prisma } from '../../config/prisma.js'

export const businessRepository = {
  // Business and its first admin membership are created together, or not at all
  createWithAdmin: (
    data: { name: string; slug: string; email: string; description?: string },
    userId: string,
  ) =>
    prisma.business.create({
      data: {
        ...data,
        memberships: { create: { userId, role: 'BUSINESS_ADMIN' } },
      },
    }),

  listForUser: (userId: string) =>
    prisma.membership.findMany({
      where: { userId },
      include: { business: true },
      orderBy: { joinedAt: 'desc' },
    }),

  findMembership: (userId: string, businessId: string) =>
    prisma.membership.findUnique({
      where: { userId_businessId: { userId, businessId } },
    }),

  findById: (id: string) => prisma.business.findUnique({ where: { id } }),

    listMembers: (businessId: string) =>
    prisma.membership.findMany({
      where: { businessId },
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { joinedAt: 'asc' },
    }),
}