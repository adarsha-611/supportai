import { Router } from 'express'
import { authenticate } from '../../middleware/authenticate.js'
import {
  assignTicket,
  createTicket,
  getTicket,
  getTicketEvents,
  listTickets,
  updatePriority,
  updateStatus,
} from './ticket.controller.js'

const router = Router()
router.use(authenticate)

router.post('/', createTicket)
router.get('/', listTickets)
router.get('/:id', getTicket)
router.patch('/:id', updatePriority)
router.patch('/:id/status', updateStatus)
router.patch('/:id/assign', assignTicket)
router.get('/:id/events', getTicketEvents)

export default router