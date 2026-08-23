import { Router } from 'express'
import { createGroup, deleteGroup, disableInvite, getGroup, listGroups, regenerateInvite } from '../controllers/groupController.js'
import { createExpense, deleteExpense, updateExpense } from '../controllers/expenseController.js'
import { addMember, leaveGroup, removeMember, transferAdmin } from '../controllers/memberController.js'
import { createSettlement, updateSettlement } from '../controllers/settlementController.js'
import { createBringItem, deleteBringItem, listBringItems, updateBringItem } from '../controllers/bringItemController.js'
import { auth } from '../middleware/auth.js'
import { groupMember, groupOwner } from '../middleware/groupMember.js'
import { upload } from '../middleware/upload.js'

const router = Router()

router.use(auth)
router.get('/', listGroups)
router.post('/', upload.single('profilePicture'), createGroup)
router.get('/:groupId', groupMember, getGroup)
router.get('/:groupId/bring-items', groupMember, listBringItems)
router.post('/:groupId/bring-items', groupMember, createBringItem)
router.patch('/:groupId/bring-items/:itemId', groupMember, updateBringItem)
router.delete('/:groupId/bring-items/:itemId', groupMember, deleteBringItem)
router.delete('/:groupId', groupMember, groupOwner, deleteGroup)
router.post('/:groupId/expenses', groupMember, upload.single('receipt'), createExpense)
router.put('/:groupId/expenses/:expenseId', groupMember, upload.single('receipt'), updateExpense)
router.delete('/:groupId/expenses/:expenseId', groupMember, deleteExpense)
router.post('/:groupId/settlements', groupMember, createSettlement)
router.put('/:groupId/settlements/:settlementId', groupMember, updateSettlement)
router.post('/:groupId/members', groupMember, addMember)
router.delete('/:groupId/members/:userId', groupMember, removeMember)
router.post('/:groupId/leave', groupMember, leaveGroup)
router.patch('/:groupId/admin', groupMember, transferAdmin)
router.post('/:groupId/invitation/regenerate', groupMember, regenerateInvite)
router.post('/:groupId/invitation/disable', groupMember, disableInvite)

export default router
