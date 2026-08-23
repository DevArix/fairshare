import { changeDb } from '../models/db.js'
import { addActivity } from '../services/activityService.js'
import { makeShares } from '../services/expenseService.js'
import { makeId } from '../utils/id.js'
import { toCents } from '../utils/money.js'
import { saveUploadedImage } from '../middleware/upload.js'

function parseParticipants(value) {
  try {
    return typeof value === 'string' ? JSON.parse(value) : value
  } catch {
    throw Object.assign(new Error('سهم شرکا معتبر نیست'), { status: 400 })
  }
}

function expenseInput(req, db) {
  const amountCents = toCents(req.body.amount)
  if (!Number.isInteger(amountCents) || amountCents <= 0) throw Object.assign(new Error('مبلغ هزینه باید بیشتر از صفر باشد'), { status: 400 })
  if (!req.body.title?.trim()) throw Object.assign(new Error('عنوان هزینه الزامی است'), { status: 400 })
  const memberIds = new Set(db.groupMembers.filter(item => item.groupId === req.params.groupId).map(item => item.userId))
  if (!memberIds.has(req.body.paidBy)) throw Object.assign(new Error('پرداخت‌کننده باید عضو گروه باشد'), { status: 400 })
  const participants = parseParticipants(req.body.participants)
  const shares = makeShares(amountCents, req.body.splitType, participants, memberIds)
  return { amountCents, shares }
}

export async function createExpense(req, res, next) {
  try {
    const receiptImage = await saveUploadedImage(req.file)
    const expense = await changeDb(db => {
      const { amountCents, shares } = expenseInput(req, db)
      const created = {
        id: makeId(),
        groupId: req.params.groupId,
        createdBy: req.user.id,
        paidBy: req.body.paidBy,
        title: req.body.title.trim(),
        description: req.body.description?.trim() || '',
        amountCents,
        splitType: req.body.splitType,
        date: req.body.date || new Date().toISOString().slice(0, 10),
        receiptImage,
        createdAt: new Date().toISOString()
      }
      db.expenses.push(created)
      db.expenseShares.push(...shares.map(item => ({ ...item, expenseId: created.id })))
      addActivity(db, created.groupId, req.user.id, 'expense_created', `${req.user.name} هزینه «${created.title}» را اضافه کرد`)
      return created
    })
    res.status(201).json({ expense })
  } catch (error) {
    next(error)
  }
}

export async function updateExpense(req, res, next) {
  try {
    const receiptImage = await saveUploadedImage(req.file)
    const expense = await changeDb(db => {
      const current = db.expenses.find(item => item.id === req.params.expenseId && item.groupId === req.params.groupId)
      if (!current) throw Object.assign(new Error('هزینه پیدا نشد'), { status: 404 })
      const { amountCents, shares } = expenseInput(req, db)
      current.paidBy = req.body.paidBy
      current.title = req.body.title.trim()
      current.description = req.body.description?.trim() || ''
      current.amountCents = amountCents
      current.splitType = req.body.splitType
      current.date = req.body.date || current.date
      if (receiptImage) current.receiptImage = receiptImage
      db.expenseShares = db.expenseShares.filter(item => item.expenseId !== current.id)
      db.expenseShares.push(...shares.map(item => ({ ...item, expenseId: current.id })))
      addActivity(db, current.groupId, req.user.id, 'expense_edited', `${req.user.name} هزینه «${current.title}» را ویرایش کرد`)
      return current
    })
    res.json({ expense })
  } catch (error) {
    next(error)
  }
}

export async function deleteExpense(req, res, next) {
  try {
    await changeDb(db => {
      const index = db.expenses.findIndex(item => item.id === req.params.expenseId && item.groupId === req.params.groupId)
      if (index < 0) throw Object.assign(new Error('هزینه پیدا نشد'), { status: 404 })
      const expense = db.expenses[index]
      db.expenses.splice(index, 1)
      db.expenseShares = db.expenseShares.filter(item => item.expenseId !== expense.id)
      addActivity(db, expense.groupId, req.user.id, 'expense_deleted', `${req.user.name} هزینه «${expense.title}» را حذف کرد`)
    })
    res.json({ message: 'هزینه حذف شد' })
  } catch (error) {
    next(error)
  }
}
