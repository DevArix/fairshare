import { Router } from 'express'
import { listSettlements } from '../controllers/settlementController.js'
import { auth } from '../middleware/auth.js'

const router = Router()

router.use(auth)
router.get('/', listSettlements)

export default router
