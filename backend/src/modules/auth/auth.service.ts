import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { AppError } from '../../utils/AppError.js'
import { userRepository } from '../users/user.repository.js'

function signAccessToken(userId: string): string {
  const secret = process.env.JWT_ACCESS_SECRET
  if (!secret) throw new Error('JWT_ACCESS_SECRET is not set in .env')
  return jwt.sign({ sub: userId }, secret, { expiresIn: '15m' })
}

function toPublicUser(user: { id: string; name: string; email: string }) {
  return { id: user.id, name: user.name, email: user.email }
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
    return { user: toPublicUser(user), accessToken: signAccessToken(user.id) }
  },

  async login(input: { email: string; password: string }) {
    const user = await userRepository.findByEmail(input.email)
    // Same message for "no user" and "wrong password": don't reveal which emails exist
    const ok = user && user.isActive && (await bcrypt.compare(input.password, user.passwordHash))
    if (!user || !ok) throw new AppError(401, 'Invalid email or password')

    return { user: toPublicUser(user), accessToken: signAccessToken(user.id) }
  },
}