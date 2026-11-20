import type { Request, Response } from 'express'
import { authService, REFRESH_COOKIE_MAX_AGE_MS } from './auth.service.js'
import { loginSchema, registerSchema } from './auth.validator.js'

const COOKIE_NAME = 'refreshToken'

function cookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/api/v1/auth',
  }
}

function sendSession(
  res: Response,
  status: number,
  session: { user: unknown; accessToken: string; refreshToken: string },
) {
  res.cookie(COOKIE_NAME, session.refreshToken, {
    ...cookieOptions(),
    maxAge: REFRESH_COOKIE_MAX_AGE_MS,
  })
  res.status(status).json({
    success: true,
    data: { user: session.user, accessToken: session.accessToken },
  })
}

export async function register(req: Request, res: Response) {
  const input = registerSchema.parse(req.body)
  sendSession(res, 201, await authService.register(input))
}

export async function login(req: Request, res: Response) {
  const input = loginSchema.parse(req.body)
  sendSession(res, 200, await authService.login(input))
}

export async function refresh(req: Request, res: Response) {
  sendSession(res, 200, await authService.refresh(req.cookies?.[COOKIE_NAME]))
}

export async function logout(req: Request, res: Response) {
  await authService.logout(req.cookies?.[COOKIE_NAME])
  res.clearCookie(COOKIE_NAME, cookieOptions())
  res.json({ success: true, message: 'Logged out' })
}

export async function me(req: Request, res: Response) {
  res.json({ success: true, data: { user: req.user } })
}