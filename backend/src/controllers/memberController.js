import { changeDb } from '../models/db.js'
import { makeId } from '../utils/id.js'
import { addActivity } from '../services/activityService.js'
import { groupBalances } from '../services/balanceService.js'

export async function addMember(req, res, next) {
  try {
    await changeDb(db => {
      const userId = req.body.userId
      const friend = db.friendships.some(item => (item.user1Id === req.user.id && item.user2Id === userId) || (item.user2Id === req.user.id && item.user1Id === userId))
      if (!friend) throw Object.assign(new Error('فقط یک دوست را می‌توان مستقیم اضافه کرد'), { status: 400 })
      if (db.groupMembers.some(item => item.groupId === req.params.groupId && item.userId === userId)) throw Object.assign(new Error('این شخص از قبل عضو گروه است'), { status: 409 })
      db.groupMembers.push({ id: makeId(), groupId: req.params.groupId, userId, joinedAt: new Date().toISOString() })
      addActivity(db, req.params.groupId, userId, 'member_joined', `${db.users.find(item => item.id === userId).name} عضو گروه شد`)
    })
    res.status(201).json({ message: 'عضو اضافه شد' })
  } catch (error) {
    next(error)
  }
}

export async function removeMember(req, res, next) {
  try {
    await changeDb(db => {
      if (req.params.userId === req.user.id) throw Object.assign(new Error('پیش از حذف خودتان، مدیریت را منتقل کنید'), { status: 400 })
      const index = db.groupMembers.findIndex(item => item.groupId === req.params.groupId && item.userId === req.params.userId)
      if (index < 0) throw Object.assign(new Error('عضو پیدا نشد'), { status: 404 })
      if (req.params.userId === (req.group.ownerId || req.group.adminId)) throw Object.assign(new Error('مالک اصلی گروه را نمی‌توان حذف کرد'), { status: 400 })
      if (req.params.userId === req.group.adminId) throw Object.assign(new Error('مدیر گروه را نمی‌توان حذف کرد'), { status: 400 })
      if (groupBalances(db, req.params.groupId).some(item => item.debtorId === req.params.userId || item.creditorId === req.params.userId)) throw Object.assign(new Error('پیش از حذف این عضو، مانده او را تسویه کنید'), { status: 400 })
      const name = db.users.find(item => item.id === req.params.userId).name
      db.groupMembers.splice(index, 1)
      addActivity(db, req.params.groupId, req.user.id, 'member_removed', `${req.user.name}، ${name} را از گروه حذف کرد`)
    })
    res.json({ message: 'عضو حذف شد' })
  } catch (error) {
    next(error)
  }
}

export async function leaveGroup(req, res, next) {
  try {
    await changeDb(db => {
      const group = db.groups.find(item => item.id === req.params.groupId)
      if ((group.ownerId || group.adminId) === req.user.id) throw Object.assign(new Error('مالک اصلی گروه نمی‌تواند از گروه خارج شود'), { status: 400 })
      if (group.adminId === req.user.id) throw Object.assign(new Error('پیش از خروج از گروه، مدیریت را منتقل کنید'), { status: 400 })
      if (groupBalances(db, group.id).some(item => item.debtorId === req.user.id || item.creditorId === req.user.id)) throw Object.assign(new Error('پیش از خروج، مانده خود را تسویه کنید'), { status: 400 })
      db.groupMembers = db.groupMembers.filter(item => !(item.groupId === group.id && item.userId === req.user.id))
      addActivity(db, group.id, req.user.id, 'member_left', `${req.user.name} از گروه خارج شد`)
    })
    res.json({ message: 'از گروه خارج شدید' })
  } catch (error) {
    next(error)
  }
}

export async function transferAdmin(req, res, next) {
  try {
    await changeDb(db => {
      const newAdminId = req.body.userId
      if (!db.groupMembers.some(item => item.groupId === req.params.groupId && item.userId === newAdminId)) throw Object.assign(new Error('مدیر جدید باید عضو گروه باشد'), { status: 400 })
      const group = db.groups.find(item => item.id === req.params.groupId)
      if (!group.ownerId) group.ownerId = group.adminId
      group.adminId = newAdminId
      addActivity(db, group.id, req.user.id, 'admin_changed', `${db.users.find(item => item.id === newAdminId).name} مدیر گروه شد`)
    })
    res.json({ message: 'مدیریت منتقل شد' })
  } catch (error) {
    next(error)
  }
}
