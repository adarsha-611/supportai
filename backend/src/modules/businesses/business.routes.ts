import { Router } from 'express'
import { authenticate } from '../../middleware/authenticate.js'
import { requireBusinessRole } from '../../middleware/requireBusinessRole.js'
import { createBusiness, getBusiness, listMyBusinesses } from './business.controller.js'
import { createInvitation, listInvitations } from '../invitations/invitation.controller.js'
import { listMembers } from './business.controller.js'

const router = Router()
router.use(authenticate)

router.post('/', createBusiness)
router.get('/', listMyBusinesses)
router.get('/:id', requireBusinessRole('BUSINESS_ADMIN', 'AGENT'), getBusiness)
router.get('/:id/members', requireBusinessRole('BUSINESS_ADMIN'), listMembers)
router.post('/:id/invitations', requireBusinessRole('BUSINESS_ADMIN'), createInvitation)
router.get('/:id/invitations', requireBusinessRole('BUSINESS_ADMIN'), listInvitations)

export default router