import { ArrowLeft, CalendarDays, CheckCircle2, Pencil, UserRound } from 'lucide-react'
import { useState } from 'react'
import { api } from '../services/api.js'
import { money, shortDate } from '../utils/format.js'
import Avatar from './Avatar.jsx'
import CustomSelect from './CustomSelect.jsx'
import Modal from './Modal.jsx'

export default function SettlementDetails({ settlement, group, onClose, onSaved }) {
  const [editing, setEditing] = useState(false)
  const [values, setValues] = useState({ payerId: settlement.payerId, receiverId: settlement.receiverId, amount: settlement.amount, date: settlement.settlementDate, note: settlement.note || '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const members = group.members.map(item => item.user)

  function set(name, value) {
    setValues(current => ({ ...current, [name]: value }))
  }

  async function save(event) {
    event.preventDefault()
    if (values.payerId === values.receiverId) {
      setError('پرداخت‌کننده و دریافت‌کننده باید متفاوت باشند')
      return
    }
    setBusy(true)
    setError('')
    try {
      await api.put(`/groups/${group.id}/settlements/${settlement.id}`, values)
      onSaved()
    } catch (err) {
      setError(err.message)
      setBusy(false)
    }
  }

  return (
    <Modal title={editing ? 'ویرایش پرداخت' : 'جزئیات پرداخت'} eyebrow={group.name} onClose={onClose}>
      {!editing ? <div className="settlement-details">
        <div className="settlement-detail-hero"><span><CheckCircle2 size={24} /></span><div><small>مبلغ پرداخت‌شده</small><strong>{money(settlement.amount, group.currency)}</strong><em>تکمیل‌شده</em></div></div>
        <div className="settlement-people"><div><Avatar user={settlement.payer} /><span className="settlement-person-copy">پرداخت‌کننده<strong>{settlement.payer.name}</strong></span></div><ArrowLeft size={20} /><div><Avatar user={settlement.receiver} /><span className="settlement-person-copy">دریافت‌کننده<strong>{settlement.receiver.name}</strong></span></div></div>
        <div className="settlement-detail-facts"><div><CalendarDays size={18} /><span>تاریخ پرداخت</span><strong>{shortDate(settlement.settlementDate)}</strong></div><div><UserRound size={18} /><span>ثبت‌کنندگان مجاز</span><strong>دو طرف پرداخت</strong></div></div>
        <div className="settlement-note"><span>توضیحات</span><p>{settlement.note || 'توضیحی برای این پرداخت ثبت نشده است.'}</p></div>
        <button className="primary-button wide" onClick={() => setEditing(true)}><Pencil size={16} />ویرایش پرداخت</button>
      </div> : <form className="settlement-edit-form" onSubmit={save}>
        {error && <div className="form-error">{error}</div>}
        <div className="field-row"><div className="custom-select-field"><span className="custom-select-label">پرداخت‌کننده</span><CustomSelect value={values.payerId} onChange={value => set('payerId', value)} ariaLabel="انتخاب پرداخت‌کننده" options={members.map(member => ({ value: member.id, label: member.name, detail: `@${member.username}` }))} /></div><div className="custom-select-field"><span className="custom-select-label">دریافت‌کننده</span><CustomSelect value={values.receiverId} onChange={value => set('receiverId', value)} ariaLabel="انتخاب دریافت‌کننده" options={members.map(member => ({ value: member.id, label: member.name, detail: `@${member.username}` }))} /></div></div>
        <div className="field-row"><label>مبلغ<div className="money-input"><span>{group.currency === 'IRT' || group.currency === 'IRR' ? 'تومان' : group.currency}</span><input type="number" min="0.01" step="0.01" value={values.amount} onChange={event => set('amount', event.target.value)} required /></div></label><label>تاریخ<div className="date-input"><CalendarDays size={17} /><input type="date" value={values.date} onChange={event => set('date', event.target.value)} required /></div></label></div>
        <label>توضیحات <span className="optional">اختیاری</span><textarea maxLength="300" value={values.note} onChange={event => set('note', event.target.value)} placeholder="انتقال بانکی، نقدی…" /></label>
        <div className="settlement-edit-actions"><button type="button" className="secondary-button" onClick={() => { setEditing(false); setError('') }}>انصراف</button><button className="primary-button" disabled={busy}>{busy ? 'در حال ذخیره…' : 'ذخیره تغییرات'}</button></div>
      </form>}
    </Modal>
  )
}
