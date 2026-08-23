import { changeDb, readDb } from '../models/db.js'
import { makeCode, makeId } from '../utils/id.js'
import { dashboardSummaries, groupBalances } from '../services/balanceService.js'
import { addActivity } from '../services/activityService.js'
import { groupView } from '../services/groupViewService.js'

const currencies = ['USD', 'EUR', 'IRT']

export async function listGroups(req, res) {
  const db = await readDb()
  const ids = new Set(db.groupMembers.filter(item => item.userId === req.user.id).map(item => item.groupId))
  const groups = db.groups.filter(item => ids.has(item.id)).map(group => {
    const balances = groupBalances(db, group.id)
    const owe = balances.filter(item => item.debtorId === req.user.id).reduce((sum, item) => sum + item.amount, 0)
    const owed = balances.filter(item => item.creditorId === req.user.id).reduce((sum, item) => sum + item.amount, 0)
    return {
      ...group,
      currency: group.currency === 'IRR' ? 'IRT' : group.currency,
      memberCount: db.groupMembers.filter(item => item.groupId === group.id).length,
      expenseCount: db.expenses.filter(item => item.groupId === group.id).length,
      balance: owed - owe
    }
  })
  const activities = db.activities.filter(item => ids.has(item.groupId)).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 8).map(item => ({
    ...item,
    groupName: db.groups.find(group => group.id === item.groupId)?.name
  }))
  res.json({ groups, summaries: dashboardSummaries(db, req.user.id), activities })
}

export async function createGroup(req, res, next) {
  try {
    const { name, description, currency = 'IRT' } = req.body
    if (!name?.trim()) throw Object.assign(new Error('نام گروه الزامی است'), { status: 400 })
    if (!currencies.includes(currency)) throw Object.assign(new Error('یک ارز پشتیبانی‌شده انتخاب کنید'), { status: 400 })
    let friendIds = []
    try {
      friendIds = JSON.parse(req.body.friendIds || '[]')
    } catch {
      throw Object.assign(new Error('دوستان انتخاب‌شده معتبر نیستند'), { status: 400 })
    }
    const group = await changeDb(db => {
      const validFriendIds = new Set(db.friendships.filter(item => item.user1Id === req.user.id || item.user2Id === req.user.id).map(item => item.user1Id === req.user.id ? item.user2Id : item.user1Id))
      if (friendIds.some(id => !validFriendIds.has(id))) throw Object.assign(new Error('فقط دوستان را می‌توان مستقیم اضافه کرد'), { status: 400 })
      const now = new Date().toISOString()
      const created = {
        id: makeId(),
        name: name.trim(),
        description: description?.trim() || '',
        profilePicture: req.file ? `/uploads/${req.file.filename}` : null,
        adminId: req.user.id,
        ownerId: req.user.id,
        invitationCode: makeCode(),
        invitationEnabled: true,
        currency,
        createdAt: now
      }
      db.groups.push(created)
      db.groupMembers.push({ id: makeId(), groupId: created.id, userId: req.user.id, joinedAt: now })
      for (const userId of [...new Set(friendIds)]) db.groupMembers.push({ id: makeId(), groupId: created.id, userId, joinedAt: now })
      addActivity(db, created.id, req.user.id, 'group_created', `${req.user.name} گروه را ساخت`)
      for (const userId of friendIds) addActivity(db, created.id, userId, 'member_joined', `${db.users.find(item => item.id === userId).name} عضو گروه شد`)
      return created
    })
    res.status(201).json({ group })
  } catch (error) {
    next(error)
  }
}

export async function getGroup(req, res) {
  const db = await readDb()
  res.json(groupView(db, db.groups.find(item => item.id === req.params.groupId)))
}

export async function regenerateInvite(req, res) {
  const code = await changeDb(db => {
    const group = db.groups.find(item => item.id === req.params.groupId)
    group.invitationCode = makeCode()
    group.invitationEnabled = true
    addActivity(db, group.id, req.user.id, 'invite_changed', `${req.user.name} لینک دعوت جدید ساخت`)
    return group.invitationCode
  })
  res.json({ invitationCode: code, invitationEnabled: true })
}

export async function disableInvite(req, res) {
  await changeDb(db => {
    const group = db.groups.find(item => item.id === req.params.groupId)
    group.invitationEnabled = false
    addActivity(db, group.id, req.user.id, 'invite_changed', `${req.user.name} لینک دعوت را غیرفعال کرد`)
  })
  res.json({ invitationEnabled: false })
}

export async function deleteGroup(req, res, next) {
  try {
    await changeDb(db => {
      const expenseIds = new Set(db.expenses.filter(item => item.groupId === req.group.id).map(item => item.id))
      db.expenseShares = db.expenseShares.filter(item => !expenseIds.has(item.expenseId))
      db.expenses = db.expenses.filter(item => item.groupId !== req.group.id)
      db.settlements = db.settlements.filter(item => item.groupId !== req.group.id)
      db.bringItems = db.bringItems.filter(item => item.groupId !== req.group.id)
      db.activities = db.activities.filter(item => item.groupId !== req.group.id)
      db.groupMembers = db.groupMembers.filter(item => item.groupId !== req.group.id)
      db.groups = db.groups.filter(item => item.id !== req.group.id)
    })
    res.json({ message: 'گروه و تمام اطلاعات آن حذف شد' })
  } catch (error) {
    next(error)
  }
}
