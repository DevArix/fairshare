import test from 'node:test'
import assert from 'node:assert/strict'
import { makeShares } from '../src/services/expenseService.js'
import { groupBalances } from '../src/services/balanceService.js'

test('equal splits keep every cent', () => {
  const shares = makeShares(1000, 'equal', ['a', 'b', 'c'], new Set(['a', 'b', 'c']))
  assert.deepEqual(shares.map(item => item.shareCents), [334, 333, 333])
  assert.equal(shares.reduce((sum, item) => sum + item.shareCents, 0), 1000)
})

test('percentage splits keep every cent', () => {
  const shares = makeShares(1001, 'percentage', [
    { userId: 'a', percentage: 50 },
    { userId: 'b', percentage: 30 },
    { userId: 'c', percentage: 20 }
  ], new Set(['a', 'b', 'c']))
  assert.equal(shares.reduce((sum, item) => sum + item.shareCents, 0), 1001)
  assert.deepEqual(shares.map(item => item.shareBasisPoints), [5000, 3000, 2000])
})

test('custom splits reject a mismatched total', () => {
  assert.throws(() => makeShares(10000, 'custom', [
    { userId: 'a', amount: 60 },
    { userId: 'b', amount: 30 }
  ], new Set(['a', 'b'])), /برابر/)
})

test('balances net opposite debts and subtract settlements', () => {
  const db = {
    groupMembers: [{ groupId: 'g', userId: 'a' }, { groupId: 'g', userId: 'b' }],
    expenses: [
      { id: 'e1', groupId: 'g', paidBy: 'a', title: 'Dinner', date: '2026-08-20' },
      { id: 'e2', groupId: 'g', paidBy: 'b', title: 'Taxi', date: '2026-08-20' }
    ],
    expenseShares: [
      { expenseId: 'e1', userId: 'b', shareCents: 6000 },
      { expenseId: 'e2', userId: 'a', shareCents: 2000 }
    ],
    settlements: [{ id: 's1', groupId: 'g', payerId: 'b', receiverId: 'a', amountCents: 1000, settlementDate: '2026-08-20' }]
  }
  const balances = groupBalances(db, 'g')
  assert.equal(balances.length, 1)
  assert.equal(balances[0].debtorId, 'b')
  assert.equal(balances[0].creditorId, 'a')
  assert.equal(balances[0].amountCents, 3000)
})
