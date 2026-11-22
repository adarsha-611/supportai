export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'WAITING_FOR_CUSTOMER' | 'RESOLVED' | 'CLOSED'
export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'

export const STATUSES: TicketStatus[] = ['OPEN', 'IN_PROGRESS', 'WAITING_FOR_CUSTOMER', 'RESOLVED', 'CLOSED']
export const PRIORITIES: TicketPriority[] = ['LOW', 'MEDIUM', 'HIGH', 'URGENT']

interface PersonRef {
  id: string
  name: string
  email: string
}

export interface Ticket {
  id: string
  businessId: string
  subject: string
  description: string
  status: TicketStatus
  priority: TicketPriority
  createdAt: string
  updatedAt: string
  customer: PersonRef
  agent: PersonRef | null
  category: { id: string; name: string } | null
}

export interface TicketList {
  items: Ticket[]
  total: number
  page: number
  limit: number
}

export interface TicketEvent {
  id: string
  eventType: string
  oldValue: string | null
  newValue: string | null
  createdAt: string
  actor: { id: string; name: string }
}