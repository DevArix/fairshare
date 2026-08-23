import { groupBalances } from './balanceService.js'
import { fromCents } from '../utils/money.js'
import { publicUser } from '../utils/publicUser.js'

function userFrom(db, id) {
  return publicUser(db.users.find(item => item.id === id))
}

export function groupView(db, group) {
  const memberships = db.groupMembers.filter(item => item.groupId === group.id)
  const expenses = db.expenses.filter(item => item.groupId === group.id).sort((a, b) => new Date(b.date) - new Date(a.date)).map(expense => ({
    ...expense,
    amount: fromCents(expense.amountCents),
    paidByUser: userFrom(db, expense.paidBy),
    createdByUser: userFrom(db, expense.createdBy),
    shares: db.expenseShares.filter(item => item.expenseId === expense.id).map(share => ({
      ...share,
      amount: fromCents(share.shareCents),
      percentage: share.shareBasisPoints === null ? null : share.shareBasisPoints / 100,
      user: userFrom(db, share.userId)
    }))
  }))
  const balances = groupBalances(db, group.id).map(item => ({
    ...item,
    debtor: userFrom(db, item.debtorId),
    creditor: userFrom(db, item.creditorId)
  }))
  const paid = memberships.map(item => {
    const totalCents = db.expenses.filter(expense => expense.groupId === group.id && expense.paidBy === item.userId).reduce((sum, expense) => sum + expense.amountCents, 0)
    return { user: userFrom(db, item.userId), total: fromCents(totalCents), totalCents }
  })
  const totalPaid = paid.reduce((sum, item) => sum + item.totalCents, 0)

  return {
    group: {
      ...group,
      currency: group.currency === 'IRR' ? 'IRT' : group.currency,
      admin: userFrom(db, group.adminId),
      members: memberships.map(item => ({ ...item, user: userFrom(db, item.userId) }))
    },
    expenses,
    balances,
    settlements: db.settlements.filter(item => item.groupId === group.id).sort((a, b) => new Date(b.settlementDate) - new Date(a.settlementDate)).map(item => ({
      ...item,
      amount: fromCents(item.amountCents),
      payer: userFrom(db, item.payerId),
      receiver: userFrom(db, item.receiverId)
    })),
    activities: db.activities.filter(item => item.groupId === group.id).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map(item => ({ ...item, user: userFrom(db, item.userId) })),
    statistics: paid.map(item => ({ ...item, percentage: totalPaid ? item.totalCents / totalPaid * 100 : 0 }))
  }
}
