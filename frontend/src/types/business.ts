export interface Business {
  id: string
  name: string
  slug: string
  email: string
  description: string | null
  plan: string
  role: string
}

export interface Member {
  id: string
  role: string
  user: { id: string; name: string; email: string }
}

export interface PendingInvitation {
  id: string
  email: string
  role: string
  expiresAt: string
}