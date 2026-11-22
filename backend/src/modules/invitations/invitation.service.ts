import crypto from 'node:crypto'
import { AppError } from '../../utils/AppError.js'
import { businessRepository } from '../businesses/business.repository.js'
import { userRepository } from '../users/user.repository.js'
import { invitationRepository } from './invitation.repository.js'

const INVITE_DAYS = 7

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex')
}

export const invitationService = {
  async create(businessId: string, input: { email: string; role: 'AGENT' | 'BUSINESS_ADMIN' }) {
    const existingUser = await userRepository.findByEmail(input.email)
    if (existingUser) {
      const member = await businessRepository.findMembership(existingUser.id, businessId)
      if (member) throw new AppError(409, 'This user is already a member')
    }
    if (await invitationRepository.findPendingForEmail(businessId, input.email)) {
      throw new AppError(409, 'An invitation is already pending for this email')
    }

    const token = crypto.randomBytes(32).toString('hex')
    const invitation = await invitationRepository.create({
      businessId,
      email: input.email,
      role: input.role,
      tokenHash: hashToken(token),
      expiresAt: new Date(Date.now() + INVITE_DAYS * 24 * 60 * 60 * 1000),
    })

    const clientUrl = process.env.CLIENT_URL ?? 'http://localhost:5173'
    return {
      invitation: { id: invitation.id, email: invitation.email, role: invitation.role, expiresAt: invitation.expiresAt },
      inviteLink: `${clientUrl}/accept-invite?token=${token}`,
    }
  },

  listPending: (businessId: string) => invitationRepository.listPending(businessId),

  async accept(user: { id: string; email: string }, token: string) {
    const invitation = await invitationRepository.findByHash(hashToken(token))
    if (!invitation || invitation.status !== 'PENDING' || invitation.expiresAt < new Date()) {
      throw new AppError(400, 'Invalid or expired invitation')
    }
    if (invitation.email !== user.email.toLowerCase()) {
      throw new AppError(403, 'This invitation was sent to a different email')
    }
    if (await businessRepository.findMembership(user.id, invitation.businessId)) {
      throw new AppError(409, 'You are already a member of this business')
    }

    await invitationRepository.accept(invitation.id, user.id, invitation.businessId, invitation.role as 'AGENT' | 'BUSINESS_ADMIN')
    return { businessId: invitation.businessId, role: invitation.role }
  },
}