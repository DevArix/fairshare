import { ArrowDown, ArrowRight, CheckCircle2, ReceiptText } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { api } from '../services/api.js'
import { money, shortDate } from '../utils/format.js'
import Avatar from './Avatar.jsx'
import Modal from './Modal.jsx'

export default function BalanceModal({ balance, group, onClose, onSaved }) {
  const { user } = useAuth()
  const [amount, setAmount] = useState(balance.amount)
  const [note, setNote] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const isDebtor = balance.debtorId === user.id

  async function settle(event) {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      await api.post(`/groups/${group.id}/settlements`, { payerId: balance.debtorId, receiverId: balance.creditorId, amount, note, date: new Date().toISOString().slice(0, 10) })
      onSaved()
    } catch (err) {
      setError(err.message)
      setBusy(false)
    }
  }

  const expenseDetails = balance.details.filter(item => item.cents > 0)

  return (
      <Modal title="جزئیات مانده" eyebrow="این مبلغ از کجا آمده؟" onClose={onClose}>
      <div className="debt-hero"><Avatar user={balance.debtor} /><ArrowRight size={20} /><Avatar user={balance.creditor} /><div><span>{balance.debtor.name} به {balance.creditor.name} بدهکار است</span><strong>{money(balance.amount, group.currency)}</strong></div></div>
      <div className="detail-section"><div className="detail-title"><h3>ریز هزینه‌ها</h3><span>{expenseDetails.length} مورد</span></div><div className="breakdown-list">{expenseDetails.map((item, index) => <div key={`${item.id}-${index}`}><span className="breakdown-icon"><ReceiptText size={16} /></span><div><strong>{item.title}</strong><small>{shortDate(item.date)}</small></div><b>{money(item.amount, group.currency)}</b></div>)}</div><div className="breakdown-total"><span>مانده فعلی</span><strong>{money(balance.amount, group.currency)}</strong></div></div>
      <form className="settle-form" onSubmit={settle}><div className="settle-heading"><span><CheckCircle2 size={18} /></span><div><strong>{isDebtor ? 'ثبت پرداخت' : 'ثبت تسویه اعضا'}</strong><small>همه اعضای گروه می‌توانند پرداخت را ثبت کنند</small></div></div>{error && <div className="form-error">{error}</div>}<label>مبلغ<div className="money-input"><span>{group.currency === 'IRT' || group.currency === 'IRR' ? 'تومان' : group.currency}</span><input type="number" min="0.01" step="0.01" max={balance.amount} value={amount} onChange={event => setAmount(event.target.value)} required /></div></label><label>یادداشت <span className="optional">اختیاری</span><input value={note} onChange={event => setNote(event.target.value)} placeholder="انتقال بانکی، نقدی…" /></label><button className="primary-button wide" disabled={busy}>{busy ? 'در حال ذخیره…' : 'ثبت پرداخت'}<ArrowDown size={17} /></button></form>
    </Modal>
  )
}
