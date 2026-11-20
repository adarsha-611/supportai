import { prisma } from '../../config/prisma.js'

export const refreshTokenRepository = {
  create: (data: { userId: string; tokenHash: string; expiresAt: Date }) =>
    prisma.refreshToken.create({ data }),

  findByHash: (tokenHash: string) =>
    prisma.refreshToken.findUnique({ where: { tokenHash } }),

  revoke: (id: string) =>
    prisma.refreshToken.update({ where: { id }, data: { revokedAt: new Date() } }),

  revokeAllForUser: (userId: string) =>
    prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    }),
}