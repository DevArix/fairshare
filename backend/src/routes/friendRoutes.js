import { Router } from 'express'
import { acceptFriendInvite, answerRequest, getInviteLink, listFriends, previewFriendInvite, sendRequest } from '../controllers/friendController.js'
import { auth } from '../middleware/auth.js'

const router = Router()

router.get('/invitations/:code', previewFriendInvite)
router.use(auth)
router.get('/', listFriends)
router.get('/invite-link', getInviteLink)
router.post('/invitations/:code/accept', acceptFriendInvite)
router.post('/requests', sendRequest)
router.patch('/requests/:requestId', answerRequest)

export default router
