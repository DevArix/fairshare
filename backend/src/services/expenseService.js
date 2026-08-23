import { makeId } from '../utils/id.js'
import { toCents } from '../utils/money.js'

function splitEqual(total, participants) {
  const base = Math.floor(total / participants.length)
  let remainder = total - base * participants.length
  return participants.map(userId => {
    const shareCents = base + (remainder-- > 0 ? 1 : 0)
    return { id: makeId(), userId, shareCents, shareBasisPoints: null }
  })
}

function splitCustom(total, participants) {
  const shares = participants.map(item => ({
    id: makeId(),
    userId: item.userId,
    shareCents: toCents(item.amount),
    shareBasisPoints: null
  }))
  if (shares.some(item => !Number.isInteger(item.shareCents) || item.shareCents < 0)) throw Object.assign(new Error('سهم دستی هر نفر باید مبلغ معتبری باشد'), { status: 400 })
  if (shares.reduce((sum, item) => sum + item.shareCents, 0) !== total) throw Object.assign(new Error('مجموع سهم‌های دستی باید با مبلغ هزینه برابر باشد'), { status: 400 })
  return shares
}

function splitPercentage(total, participants) {
  const shares = participants.map(item => ({
    id: makeId(),
    userId: item.userId,
    shareCents: 0,
    shareBasisPoints: Math.round(Number(item.percentage) * 100)
  }))
  if (shares.some(item => !Number.isInteger(item.shareBasisPoints) || item.shareBasisPoints < 0)) throw Object.assign(new Error('درصد هر نفر باید معتبر باشد'), { status: 400 })
  if (shares.reduce((sum, item) => sum + item.shareBasisPoints, 0) !== 10000) throw Object.assign(new Error('مجموع درصدها باید دقیقاً ۱۰۰٪ باشد'), { status: 400 })
  let assigned = 0
  for (const share of shares) {
    share.shareCents = Math.floor(total * share.shareBasisPoints / 10000)
    assigned += share.shareCents
  }
  let remainder = total - assigned
  for (let i = 0; remainder > 0; i = (i + 1) % shares.length) {
    shares[i].shareCents += 1
    remainder -= 1
  }
  return shares
}

export function makeShares(amountCents, splitType, participants, memberIds) {
  if (!Array.isArray(participants) || participants.length === 0) throw Object.assign(new Error('حداقل یک شریک انتخاب کنید'), { status: 400 })
  const ids = participants.map(item => typeof item === 'string' ? item : item.userId)
  if (new Set(ids).size !== ids.length) throw Object.assign(new Error('هر نفر فقط یک بار قابل انتخاب است'), { status: 400 })
  if (ids.some(id => !memberIds.has(id))) throw Object.assign(new Error('همه شرکا باید عضو گروه باشند'), { status: 400 })
  if (splitType === 'equal') return splitEqual(amountCents, ids)
  if (splitType === 'custom') return splitCustom(amountCents, participants)
  if (splitType === 'percentage') return splitPercentage(amountCents, participants)
  throw Object.assign(new Error('یک روش تقسیم معتبر انتخاب کنید'), { status: 400 })
}
