import { fromCents } from '../utils/money.js'

function key(from, to) {
  return `${from}|${to}`
}

export function groupBalances(db, groupId) {
  const directional = new Map()
  const expenses = db.expenses.filter(item => item.groupId === groupId)
  const settlements = db.settlements.filter(item => item.groupId === groupId)

  function add(from, to, cents, detail) {
    if (from === to || cents === 0) return
    const itemKey = key(from, to)
    const current = directional.get(itemKey) || { cents: 0, details: [] }
    current.cents += cents
    current.details.push(detail)
    directional.set(itemKey, current)
  }

  for (const expense of expenses) {
    const shares = db.expenseShares.filter(item => item.expenseId === expense.id)
    for (const share of shares) {
      add(share.userId, expense.paidBy, share.shareCents, {
        type: 'expense',
        id: expense.id,
        title: expense.title,
        cents: share.shareCents,
        date: expense.date
      })
    }
  }

  for (const settlement of settlements) {
    add(settlement.payerId, settlement.receiverId, -settlement.amountCents, {
      type: 'settlement',
      id: settlement.id,
      title: 'پرداخت',
      cents: -settlement.amountCents,
      date: settlement.settlementDate
    })
  }

  const people = db.groupMembers.filter(item => item.groupId === groupId).map(item => item.userId)
  const balances = []

  for (let i = 0; i < people.length; i += 1) {
    for (let j = i + 1; j < people.length; j += 1) {
      const first = people[i]
      const second = people[j]
      const firstDebt = directional.get(key(first, second)) || { cents: 0, details: [] }
      const secondDebt = directional.get(key(second, first)) || { cents: 0, details: [] }
      const net = firstDebt.cents - secondDebt.cents
      if (net === 0) continue
      const debtorId = net > 0 ? first : second
      const creditorId = net > 0 ? second : first
      const active = net > 0 ? firstDebt : secondDebt
      const offset = net > 0 ? secondDebt : firstDebt
      balances.push({
        debtorId,
        creditorId,
        amount: fromCents(Math.abs(net)),
        amountCents: Math.abs(net),
        details: [
          ...active.details,
          ...offset.details.map(item => ({ ...item, cents: -item.cents, type: 'offset' }))
        ].map(item => ({ ...item, amount: fromCents(item.cents) }))
      })
    }
  }

  return balances
}

export function balanceFor(db, groupId, payerId, receiverId) {
  return groupBalances(db, groupId).find(item => item.debtorId === payerId && item.creditorId === receiverId)
}

export function dashboardSummaries(db, userId) {
  const membershipIds = new Set(db.groupMembers.filter(item => item.userId === userId).map(item => item.groupId))
  const values = new Map()
  for (const group of db.groups.filter(item => membershipIds.has(item.id))) {
    const currency = group.currency === 'IRR' ? 'IRT' : group.currency
    const summary = values.get(currency) || { currency, owe: 0, owed: 0, net: 0 }
    for (const balance of groupBalances(db, group.id)) {
      if (balance.debtorId === userId) summary.owe += balance.amount
      if (balance.creditorId === userId) summary.owed += balance.amount
    }
    summary.net = summary.owed - summary.owe
    values.set(currency, summary)
  }
  return [...values.values()]
}
