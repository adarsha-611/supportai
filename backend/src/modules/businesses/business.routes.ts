import { Router } from 'express'
import { authenticate } from '../../middleware/authenticate.js'
import { requireBusinessRole } from '../../middleware/requireBusinessRole.js'
import { createBusiness, getBusiness, listMyBusinesses } from './business.controller.js'

const router = Router()
router.use(authenticate)

router.post('/', createBusiness)
router.get('/', listMyBusinesses)
router.get('/:id', requireBusinessRole('BUSINESS_ADMIN', 'AGENT'), getBusiness)

export default router