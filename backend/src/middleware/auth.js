import jwt from 'jsonwebtoken'
import { readDb } from '../models/db.js'

export async function auth(req, res, next) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '')
    if (!token) return res.status(401).json({ message: 'برای ادامه وارد حساب شوید' })
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'fairshare-local-secret')
    const db = await readDb()
    const user = db.users.find(item => item.id === payload.id)
    if (!user) return res.status(401).json({ message: 'نشست شما دیگر معتبر نیست' })
    if ((payload.sessionVersion || 0) !== (user.sessionVersion || 0)) return res.status(401).json({ message: 'نشست شما دیگر معتبر نیست' })
    req.user = user
    next()
  } catch {
    res.status(401).json({ message: 'نشست شما دیگر معتبر نیست' })
  }
}
