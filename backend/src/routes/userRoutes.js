import { Router } from 'express'
import { searchUsers, updatePassword, updateProfile } from '../controllers/userController.js'
import { auth } from '../middleware/auth.js'
import { upload } from '../middleware/upload.js'

const router = Router()

router.use(auth)
router.get('/search', searchUsers)
router.put('/profile', upload.single('profilePicture'), updateProfile)
router.put('/password', updatePassword)

export default router

