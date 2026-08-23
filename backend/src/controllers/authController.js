import bcrypt from 'bcryptjs'
import crypto from 'node:crypto'
import jwt from 'jsonwebtoken'
import { changeDb, readDb } from '../models/db.js'
import { mailReady, sendResetEmail } from '../services/mailService.js'
import { makeId } from '../utils/id.js'
import { publicUser } from '../utils/publicUser.js'

function tokenFor(user) {
  return jwt.sign({ id: user.id, sessionVersion: user.sessionVersion || 0 }, process.env.JWT_SECRET || 'fairshare-local-secret', { expiresIn: '7d' })
}

export async function register(req, res, next) {
  try {
    const { name, username, email, password, confirmPassword } = req.body
    if (!name?.trim() || !username?.trim() || !email?.trim() || !password) throw Object.assign(new Error('همه فیلدهای ضروری را کامل کنید'), { status: 400 })
    if (username.trim().length < 3) throw Object.assign(new Error('نام کاربری باید حداقل ۳ نویسه باشد'), { status: 400 })
    if (!/^\S+@\S+\.\S+$/.test(email)) throw Object.assign(new Error('یک ایمیل معتبر وارد کنید'), { status: 400 })
    if (password.length < 8) throw Object.assign(new Error('رمز عبور باید حداقل ۸ نویسه باشد'), { status: 400 })
    if (password !== confirmPassword) throw Object.assign(new Error('رمزهای عبور یکسان نیستند'), { status: 400 })
    const user = await changeDb(async db => {
      const duplicate = db.users.some(item => item.username.toLowerCase() === username.trim().toLowerCase() || item.email.toLowerCase() === email.trim().toLowerCase())
      if (duplicate) throw Object.assign(new Error('این نام کاربری یا ایمیل قبلاً استفاده شده است'), { status: 409 })
      const created = {
        id: makeId(),
        name: name.trim(),
        username: username.trim(),
        email: email.trim().toLowerCase(),
        passwordHash: await bcrypt.hash(password, 10),
        sessionVersion: 0,
        profilePicture: null,
        createdAt: new Date().toISOString()
      }
      db.users.push(created)
      return created
    })
    res.status(201).json({ user: publicUser(user), token: tokenFor(user) })
  } catch (error) {
    next(error)
  }
}

export async function login(req, res, next) {
  try {
    const { login: value, password } = req.body
    const db = await readDb()
    const user = db.users.find(item => item.username.toLowerCase() === value?.trim().toLowerCase() || item.email.toLowerCase() === value?.trim().toLowerCase())
    if (!user || !await bcrypt.compare(password || '', user.passwordHash)) throw Object.assign(new Error('اطلاعات ورود درست نیست'), { status: 401 })
    res.json({ user: publicUser(user), token: tokenFor(user) })
  } catch (error) {
    next(error)
  }
}

export function me(req, res) {
  res.json({ user: publicUser(req.user) })
}

export async function forgotPassword(req, res, next) {
  try {
    const email = req.body.email?.trim().toLowerCase()
    if (!/^\S+@\S+\.\S+$/.test(email || '')) throw Object.assign(new Error('یک ایمیل معتبر وارد کنید'), { status: 400 })
    if (!mailReady()) throw Object.assign(new Error('ارسال ایمیل هنوز تنظیم نشده است'), { status: 503 })

    const token = crypto.randomBytes(32).toString('hex')
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex')
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString()
    const user = await changeDb(db => {
      db.passwordResetTokens = (db.passwordResetTokens || []).filter(item => new Date(item.expiresAt) > new Date())
      const found = db.users.find(item => item.email.toLowerCase() === email)
      if (!found) return null
      db.passwordResetTokens = db.passwordResetTokens.filter(item => item.userId !== found.id)
      db.passwordResetTokens.push({ id: makeId(), userId: found.id, tokenHash, expiresAt, createdAt: new Date().toISOString() })
      return found
    })

    let resetUrl = null
    if (user) {
      try {
        resetUrl = await sendResetEmail(user.email, token)
      } catch (error) {
        await changeDb(db => {
          db.passwordResetTokens = (db.passwordResetTokens || []).filter(item => item.tokenHash !== tokenHash)
        })
        throw error
      }
    }

    const result = { message: 'اگر حسابی با این ایمیل وجود داشته باشد، لینک بازیابی برای آن ارسال می‌شود' }
    if (process.env.NODE_ENV === 'test' && resetUrl) result.resetToken = token
    res.json(result)
  } catch (error) {
    next(error)
  }
}

export async function resetPassword(req, res, next) {
  try {
    const { token, password, confirmPassword } = req.body
    if (!token) throw Object.assign(new Error('لینک بازیابی معتبر نیست'), { status: 400 })
    if (password?.length < 8) throw Object.assign(new Error('رمز عبور باید حداقل ۸ نویسه باشد'), { status: 400 })
    if (password !== confirmPassword) throw Object.assign(new Error('رمزهای عبور یکسان نیستند'), { status: 400 })
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex')

    await changeDb(async db => {
      const reset = (db.passwordResetTokens || []).find(item => item.tokenHash === tokenHash && new Date(item.expiresAt) > new Date())
      if (!reset) throw Object.assign(new Error('این لینک بازیابی نامعتبر یا منقضی شده است'), { status: 400 })
      const user = db.users.find(item => item.id === reset.userId)
      if (!user) throw Object.assign(new Error('این لینک بازیابی نامعتبر یا منقضی شده است'), { status: 400 })
      user.passwordHash = await bcrypt.hash(password, 10)
      user.sessionVersion = (user.sessionVersion || 0) + 1
      db.passwordResetTokens = db.passwordResetTokens.filter(item => item.userId !== user.id)
    })

    res.json({ message: 'رمز عبور با موفقیت تغییر کرد؛ اکنون وارد حساب شوید' })
  } catch (error) {
    next(error)
  }
}
