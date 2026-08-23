import { readDb } from '../models/db.js'

export async function groupMember(req, res, next) {
  const db = await readDb()
  const group = db.groups.find(item => item.id === req.params.groupId)
  const membership = db.groupMembers.find(item => item.groupId === req.params.groupId && item.userId === req.user.id)
  if (!group || !membership) return res.status(403).json({ message: 'به این گروه دسترسی ندارید' })
  req.group = group
  req.membership = membership
  next()
}

export function groupAdmin(req, res, next) {
  if (req.group.adminId !== req.user.id) return res.status(403).json({ message: 'فقط مدیر گروه اجازه انجام این کار را دارد' })
  next()
}

export function groupOwner(req, res, next) {
  if ((req.group.ownerId || req.group.adminId) !== req.user.id) return res.status(403).json({ message: 'فقط مالک اصلی گروه اجازه حذف آن را دارد' })
  next()
}
