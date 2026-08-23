import { changeDb, readDb } from '../models/db.js'
import { makeCode, makeId } from '../utils/id.js'
import { publicUser } from '../utils/publicUser.js'

function pairKey(first, second) {
  return [first, second].sort().join('|')
}

export async function listFriends(req, res) {
  const db = await readDb()
  const links = db.friendships.filter(item => item.user1Id === req.user.id || item.user2Id === req.user.id)
  const friendIds = links.map(item => item.user1Id === req.user.id ? item.user2Id : item.user1Id)
  const requests = db.friendRequests.filter(item => item.receiverId === req.user.id && item.status === 'pending').map(item => ({
    ...item,
    sender: publicUser(db.users.find(user => user.id === item.senderId))
  }))
  res.json({ friends: db.users.filter(item => friendIds.includes(item.id)).map(publicUser), requests })
}

export async function getInviteLink(req, res, next) {
  try {
    const code = await changeDb(db => {
      let invitation = db.friendInvitations.find(item => item.userId === req.user.id)
      if (!invitation) {
        invitation = { id: makeId(), userId: req.user.id, code: makeCode(), createdAt: new Date().toISOString() }
        db.friendInvitations.push(invitation)
      }
      return invitation.code
    })
    res.json({ code })
  } catch (error) {
    next(error)
  }
}

export async function previewFriendInvite(req, res, next) {
  try {
    const db = await readDb()
    const invitation = db.friendInvitations.find(item => item.code === req.params.code)
    const inviter = invitation && db.users.find(item => item.id === invitation.userId)
    if (!inviter) throw Object.assign(new Error('این لینک دعوت نامعتبر است'), { status: 404 })
    res.json({ inviter: publicUser(inviter) })
  } catch (error) {
    next(error)
  }
}

export async function acceptFriendInvite(req, res, next) {
  try {
    const result = await changeDb(db => {
      const invitation = db.friendInvitations.find(item => item.code === req.params.code)
      const inviter = invitation && db.users.find(item => item.id === invitation.userId)
      if (!inviter) throw Object.assign(new Error('این لینک دعوت نامعتبر است'), { status: 404 })
      if (inviter.id === req.user.id) throw Object.assign(new Error('این لینک دعوت متعلق به خود شماست'), { status: 400 })
      const key = pairKey(inviter.id, req.user.id)
      const alreadyFriends = db.friendships.some(item => pairKey(item.user1Id, item.user2Id) === key)
      if (!alreadyFriends) db.friendships.push({ id: makeId(), user1Id: inviter.id, user2Id: req.user.id, createdAt: new Date().toISOString() })
      for (const request of db.friendRequests) {
        if (request.status === 'pending' && pairKey(request.senderId, request.receiverId) === key) request.status = 'accepted'
      }
      return { friend: publicUser(inviter), alreadyFriends }
    })
    res.json({ ...result, message: result.alreadyFriends ? 'شما از قبل دوست هستید' : 'دوست جدید اضافه شد' })
  } catch (error) {
    next(error)
  }
}

export async function sendRequest(req, res, next) {
  try {
    const receiverId = req.body.receiverId
    if (receiverId === req.user.id) throw Object.assign(new Error('نمی‌توانید خودتان را اضافه کنید'), { status: 400 })
    const request = await changeDb(db => {
      if (!db.users.some(item => item.id === receiverId)) throw Object.assign(new Error('کاربر پیدا نشد'), { status: 404 })
      const key = pairKey(req.user.id, receiverId)
      if (db.friendships.some(item => pairKey(item.user1Id, item.user2Id) === key)) throw Object.assign(new Error('شما از قبل دوست هستید'), { status: 409 })
      if (db.friendRequests.some(item => pairKey(item.senderId, item.receiverId) === key && item.status === 'pending')) throw Object.assign(new Error('یک درخواست دوستی در انتظار پاسخ است'), { status: 409 })
      const created = { id: makeId(), senderId: req.user.id, receiverId, status: 'pending', createdAt: new Date().toISOString() }
      db.friendRequests.push(created)
      return created
    })
    res.status(201).json({ request })
  } catch (error) {
    next(error)
  }
}

export async function answerRequest(req, res, next) {
  try {
    const status = req.body.status
    if (!['accepted', 'rejected'].includes(status)) throw Object.assign(new Error('پذیرفتن یا رد کردن را انتخاب کنید'), { status: 400 })
    await changeDb(db => {
      const request = db.friendRequests.find(item => item.id === req.params.requestId && item.receiverId === req.user.id && item.status === 'pending')
      if (!request) throw Object.assign(new Error('درخواست دوستی پیدا نشد'), { status: 404 })
      request.status = status
      if (status === 'accepted') db.friendships.push({ id: makeId(), user1Id: request.senderId, user2Id: request.receiverId, createdAt: new Date().toISOString() })
    })
    res.json({ message: status === 'accepted' ? 'دوست اضافه شد' : 'درخواست رد شد' })
  } catch (error) {
    next(error)
  }
}
