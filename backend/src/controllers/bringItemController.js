import { changeDb, readDb } from '../models/db.js'
import { addActivity } from '../services/activityService.js'
import { makeId } from '../utils/id.js'
import { publicUser } from '../utils/publicUser.js'

function itemView(db, item) {
  return {
    ...item,
    assignedUser: publicUser(db.users.find(user => user.id === item.assignedTo)),
    createdByUser: publicUser(db.users.find(user => user.id === item.createdBy))
  }
}

export async function listBringItems(req, res) {
  const db = await readDb()
  const items = db.bringItems.filter(item => item.groupId === req.params.groupId).sort((first, second) => Number(first.done) - Number(second.done) || new Date(second.createdAt) - new Date(first.createdAt)).map(item => itemView(db, item))
  res.json({ items })
}

export async function createBringItem(req, res, next) {
  try {
    const title = req.body.title?.trim()
    const assignedTo = req.body.assignedTo
    if (!title) throw Object.assign(new Error('نام وسیله یا کار الزامی است'), { status: 400 })
    if (title.length > 120) throw Object.assign(new Error('نام وسیله یا کار خیلی طولانی است'), { status: 400 })
    const item = await changeDb(db => {
      const member = db.groupMembers.some(entry => entry.groupId === req.params.groupId && entry.userId === assignedTo)
      if (!member) throw Object.assign(new Error('مسئول انتخاب‌شده عضو این گروه نیست'), { status: 400 })
      const created = { id: makeId(), groupId: req.params.groupId, title, assignedTo, createdBy: req.user.id, done: false, createdAt: new Date().toISOString(), completedAt: null }
      db.bringItems.push(created)
      const assignedUser = db.users.find(user => user.id === assignedTo)
      addActivity(db, req.params.groupId, req.user.id, 'bring_item_created', `${req.user.name} آوردن «${title}» را به ${assignedUser.name} سپرد`)
      return itemView(db, created)
    })
    res.status(201).json({ item })
  } catch (error) {
    next(error)
  }
}

export async function updateBringItem(req, res, next) {
  try {
    if (typeof req.body.done !== 'boolean') throw Object.assign(new Error('وضعیت انجام معتبر نیست'), { status: 400 })
    const item = await changeDb(db => {
      const found = db.bringItems.find(entry => entry.id === req.params.itemId && entry.groupId === req.params.groupId)
      if (!found) throw Object.assign(new Error('این مورد پیدا نشد'), { status: 404 })
      found.done = req.body.done
      found.completedAt = found.done ? new Date().toISOString() : null
      if (found.done) addActivity(db, req.params.groupId, req.user.id, 'bring_item_done', `${req.user.name} «${found.title}» را آماده علامت زد`)
      return itemView(db, found)
    })
    res.json({ item })
  } catch (error) {
    next(error)
  }
}

export async function deleteBringItem(req, res, next) {
  try {
    await changeDb(db => {
      const index = db.bringItems.findIndex(entry => entry.id === req.params.itemId && entry.groupId === req.params.groupId)
      if (index < 0) throw Object.assign(new Error('این مورد پیدا نشد'), { status: 404 })
      db.bringItems.splice(index, 1)
    })
    res.json({ message: 'مورد حذف شد' })
  } catch (error) {
    next(error)
  }
}
