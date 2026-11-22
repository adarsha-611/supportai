import { Router } from 'express'
import { authenticate } from '../../middleware/authenticate.js'
import { acceptInvitation } from './invitation.controller.js'

const router = Router()
router.post('/accept', authenticate, acceptInvitation)

export default router