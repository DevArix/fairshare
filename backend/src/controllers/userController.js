import bcrypt from 'bcryptjs'
import { changeDb, readDb } from '../models/db.js'
import { publicUser } from '../utils/publicUser.js'
import { saveUploadedImage } from '../middleware/upload.js'

export async function searchUsers(req, res) {
  const query = (req.query.q || '').trim().toLowerCase()
  if (query.length < 2) return res.json({ users: [] })
  const db = await readDb()
  const users = db.users.filter(item => item.id !== req.user.id && (item.name.toLowerCase().includes(query) || item.username.toLowerCase().includes(query) || item.email.toLowerCase().includes(query))).slice(0, 10).map(publicUser)
  res.json({ users })
}

export async function updateProfile(req, res, next) {
  try {
    const profilePicture = await saveUploadedImage(req.file)
    const user = await changeDb(db => {
      const current = db.users.find(item => item.id === req.user.id)
      const name = req.body.name?.trim()
      const username = req.body.username?.trim()
      if (!name || !username) throw Object.assign(new Error('نام و نام کاربری الزامی است'), { status: 400 })
      if (db.users.some(item => item.id !== current.id && item.username.toLowerCase() === username.toLowerCase())) throw Object.assign(new Error('این نام کاربری قبلاً استفاده شده است'), { status: 409 })
      current.name = name
      current.username = username
      if (profilePicture) current.profilePicture = profilePicture
      return current
    })
    res.json({ user: publicUser(user) })
  } catch (error) {
    next(error)
  }
}

export async function updatePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body
    if (newPassword?.length < 8) throw Object.assign(new Error('رمز جدید باید حداقل ۸ نویسه باشد'), { status: 400 })
    if (!await bcrypt.compare(currentPassword || '', req.user.passwordHash)) throw Object.assign(new Error('رمز عبور فعلی درست نیست'), { status: 400 })
    await changeDb(async db => {
      db.users.find(item => item.id === req.user.id).passwordHash = await bcrypt.hash(newPassword, 10)
    })
    res.json({ message: 'رمز عبور به‌روزرسانی شد' })
  } catch (error) {
    next(error)
  }
}
