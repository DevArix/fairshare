import { Router } from 'express'
import { joinInvite, previewInvite } from '../controllers/inviteController.js'
import { auth } from '../middleware/auth.js'

const router = Router()

router.get('/:code', previewInvite)
router.post('/:code/join', auth, joinInvite)

export default router

