import { changeDb, readDb } from '../models/db.js'
import { addActivity } from '../services/activityService.js'
import { balanceFor } from '../services/balanceService.js'
import { makeId } from '../utils/id.js'
import { fromCents, toCents } from '../utils/money.js'
import { publicUser } from '../utils/publicUser.js'

export async function listSettlements(req, res) {
  const db = await readDb()
  const groupIds = new Set(db.groupMembers.filter(item => item.userId === req.user.id).map(item => item.groupId))
  const settlements = db.settlements.filter(item => groupIds.has(item.groupId)).sort((first, second) => new Date(second.settlementDate) - new Date(first.settlementDate) || new Date(second.createdAt) - new Date(first.createdAt)).map(item => {
    const group = db.groups.find(entry => entry.id === item.groupId)
    return {
      ...item,
      amount: fromCents(item.amountCents),
      payer: publicUser(db.users.find(user => user.id === item.payerId)),
      receiver: publicUser(db.users.find(user => user.id === item.receiverId)),
      group: { id: group.id, name: group.name, currency: group.currency === 'IRR' ? 'IRT' : group.currency }
    }
  })
  res.json({ settlements })
}

export async function createSettlement(req, res, next) {
  try {
    const settlement = await changeDb(db => {
      const { payerId, receiverId, note, date } = req.body
      const amountCents = toCents(req.body.amount)
      if (!Number.isInteger(amountCents) || amountCents <= 0) throw Object.assign(new Error('مبلغ تسویه باید بیشتر از صفر باشد'), { status: 400 })
      if (payerId === receiverId) throw Object.assign(new Error('پرداخت‌کننده و دریافت‌کننده باید متفاوت باشند'), { status: 400 })
      const members = new Set(db.groupMembers.filter(item => item.groupId === req.params.groupId).map(item => item.userId))
      if (!members.has(payerId) || !members.has(receiverId)) throw Object.assign(new Error('هر دو نفر باید عضو گروه باشند'), { status: 400 })
      const debt = balanceFor(db, req.params.groupId, payerId, receiverId)
      if (!debt || amountCents > debt.amountCents) throw Object.assign(new Error('مبلغ تسویه نمی‌تواند بیشتر از مانده فعلی باشد'), { status: 400 })
      const created = {
        id: makeId(),
        groupId: req.params.groupId,
        payerId,
        receiverId,
        amountCents,
        note: note?.trim() || '',
        settlementDate: date || new Date().toISOString().slice(0, 10),
        status: 'completed',
        createdAt: new Date().toISOString()
      }
      db.settlements.push(created)
      const payer = db.users.find(item => item.id === payerId)
      const receiver = db.users.find(item => item.id === receiverId)
      addActivity(db, created.groupId, req.user.id, 'settlement_created', `${payer.name} به ${receiver.name} پرداخت کرد`)
      return created
    })
    res.status(201).json({ settlement })
  } catch (error) {
    next(error)
  }
}

export async function updateSettlement(req, res, next) {
  try {
    const settlement = await changeDb(db => {
      const index = db.settlements.findIndex(item => item.id === req.params.settlementId && item.groupId === req.params.groupId)
      if (index < 0) throw Object.assign(new Error('این پرداخت پیدا نشد'), { status: 404 })
      const current = db.settlements[index]
      const { payerId, receiverId, note, date } = req.body
      const amountCents = toCents(req.body.amount)
      if (!Number.isInteger(amountCents) || amountCents <= 0) throw Object.assign(new Error('مبلغ پرداخت باید بیشتر از صفر باشد'), { status: 400 })
      if (payerId === receiverId) throw Object.assign(new Error('پرداخت‌کننده و دریافت‌کننده باید متفاوت باشند'), { status: 400 })
      const members = new Set(db.groupMembers.filter(item => item.groupId === req.params.groupId).map(item => item.userId))
      if (!members.has(payerId) || !members.has(receiverId)) throw Object.assign(new Error('هر دو نفر باید عضو گروه باشند'), { status: 400 })
      if (note?.trim().length > 300) throw Object.assign(new Error('توضیحات پرداخت خیلی طولانی است'), { status: 400 })
      db.settlements.splice(index, 1)
      const debt = balanceFor(db, req.params.groupId, payerId, receiverId)
      if (!debt || amountCents > debt.amountCents) throw Object.assign(new Error('مبلغ پرداخت نمی‌تواند بیشتر از بدهی پیش از این پرداخت باشد'), { status: 400 })
      const updated = {
        ...current,
        payerId,
        receiverId,
        amountCents,
        note: note?.trim() || '',
        settlementDate: date || current.settlementDate,
        updatedAt: new Date().toISOString()
      }
      db.settlements.splice(index, 0, updated)
      addActivity(db, current.groupId, req.user.id, 'settlement_updated', `${req.user.name} یک پرداخت را ویرایش کرد`)
      return updated
    })
    res.json({ settlement })
  } catch (error) {
    next(error)
  }
}
