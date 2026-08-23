import { changeDb, readDb } from '../models/db.js'
import { makeId } from '../utils/id.js'
import { addActivity } from '../services/activityService.js'

export async function previewInvite(req, res, next) {
  try {
    const db = await readDb()
    const group = db.groups.find(item => item.invitationCode === req.params.code && item.invitationEnabled)
    if (!group) throw Object.assign(new Error('این دعوت‌نامه نامعتبر یا غیرفعال است'), { status: 404 })
    res.json({ group: { id: group.id, name: group.name, description: group.description, profilePicture: group.profilePicture, currency: group.currency === 'IRR' ? 'IRT' : group.currency, memberCount: db.groupMembers.filter(item => item.groupId === group.id).length } })
  } catch (error) {
    next(error)
  }
}

export async function joinInvite(req, res, next) {
  try {
    const groupId = await changeDb(db => {
      const group = db.groups.find(item => item.invitationCode === req.params.code && item.invitationEnabled)
      if (!group) throw Object.assign(new Error('این دعوت‌نامه نامعتبر یا غیرفعال است'), { status: 404 })
      const exists = db.groupMembers.some(item => item.groupId === group.id && item.userId === req.user.id)
      if (!exists) {
        db.groupMembers.push({ id: makeId(), groupId: group.id, userId: req.user.id, joinedAt: new Date().toISOString() })
        addActivity(db, group.id, req.user.id, 'member_joined', `${req.user.name} عضو گروه شد`)
      }
      return group.id
    })
    res.json({ groupId })
  } catch (error) {
    next(error)
  }
}
