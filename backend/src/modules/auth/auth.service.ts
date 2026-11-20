import bcrypt from 'bcrypt'
import crypto from 'node:crypto'
import jwt from 'jsonwebtoken'
import { AppError } from '../../utils/AppError.js'
import { userRepository } from '../users/user.repository.js'
import { refreshTokenRepository } from './refreshToken.repository.js'

const REFRESH_DAYS = 7
export const REFRESH_COOKIE_MAX_AGE_MS = REFRESH_DAYS * 24 * 60 * 60 * 1000

function signAccessToken(userId: string): string {
  const secret = process.env.JWT_ACCESS_SECRET
  if (!secret) throw new Error('JWT_ACCESS_SECRET is not set in .env')
  return jwt.sign({ sub: userId }, secret, { expiresIn: '15m' })
}

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex')
}

async function issueRefreshToken(userId: string): Promise<string> {
  const token = crypto.randomBytes(48).toString('hex')
  await refreshTokenRepository.create({
    userId,
    tokenHash: hashToken(token),
    expiresAt: new Date(Date.now() + REFRESH_COOKIE_MAX_AGE_MS),
  })
  return token
}

function toPublicUser(user: { id: string; name: string; email: string }) {
  return { id: user.id, name: user.name, email: user.email }
}

async function buildSession(user: { id: string; name: string; email: string }) {
  return {
    user: toPublicUser(user),
    accessToken: signAccessToken(user.id),
    refreshToken: await issueRefreshToken(user.id),
  }
}

export const authService = {
  async register(input: { name: string; email: string; password: string }) {
    const existing = await userRepository.findByEmail(input.email)
    if (existing) throw new AppError(409, 'Email is already registered')

    const passwordHash = await bcrypt.hash(input.password, 12)
    const user = await userRepository.create({
      name: input.name,
      email: input.email,
      passwordHash,
    })
    return buildSession(user)
  },

  async login(input: { email: string; password: string }) {
    const user = await userRepository.findByEmail(input.email)
    const ok = user && user.isActive && (await bcrypt.compare(input.password, user.passwordHash))
    if (!user || !ok) throw new AppError(401, 'Invalid email or password')
    return buildSession(user)
  },

  async refresh(rawToken: string | undefined) {
    if (!rawToken) throw new AppError(401, 'Refresh token missing')

    const stored = await refreshTokenRepository.findByHash(hashToken(rawToken))
    if (!stored) throw new AppError(401, 'Invalid refresh token')

    // A revoked token being used again means it may have been stolen: kill all sessions
    if (stored.revokedAt) {
      await refreshTokenRepository.revokeAllForUser(stored.userId)
      throw new AppError(401, 'Invalid refresh token')
    }
    if (stored.expiresAt < new Date()) throw new AppError(401, 'Refresh token expired')

    const user = await userRepository.findById(stored.userId)
    if (!user || !user.isActive) throw new AppError(401, 'Invalid refresh token')

    await refreshTokenRepository.revoke(stored.id) // rotation: old token is now dead
    return buildSession(user)
  },

  async logout(rawToken: string | undefined) {
    if (!rawToken) return
    const stored = await refreshTokenRepository.findByHash(hashToken(rawToken))
    if (stored && !stored.revokedAt) await refreshTokenRepository.revoke(stored.id)
  },
}