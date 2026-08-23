import { CalendarDays, Check, ImagePlus } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { api } from '../services/api.js'
import { money } from '../utils/format.js'
import Avatar from './Avatar.jsx'
import CustomSelect from './CustomSelect.jsx'

function defaultShares(ids, total) {
  if (!ids.length) return {}
  const totalUnits = Math.round(Number(total || 0) * 100)
  const base = Math.floor(totalUnits / ids.length)
  let remainder = totalUnits - base * ids.length
  return Object.fromEntries(ids.map(id => {
    const units = base + (remainder-- > 0 ? 1 : 0)
    return [id, units / 100]
  }))
}

export default function ExpenseForm({ group, expense, onSaved, onCancel }) {
  const { user } = useAuth()
  const members = group.members.map(item => item.user)
  const [values, setValues] = useState({
    title: expense?.title || '',
    description: expense?.description || '',
    amount: expense?.amount || '',
    paidBy: expense?.paidBy || user.id,
    date: expense?.date?.slice(0, 10) || new Date().toISOString().slice(0, 10),
    splitType: expense?.splitType || 'equal'
  })
  const [selected, setSelected] = useState(expense?.shares?.map(item => item.userId) || [user.id])
  const [shares, setShares] = useState(Object.fromEntries(expense?.shares?.map(item => [item.userId, expense.splitType === 'percentage' ? item.percentage : item.amount]) || []))
  const [receipt, setReceipt] = useState(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const currencyLabel = group.currency === 'IRT' || group.currency === 'IRR' ? 'تومان' : group.currency

  const equalShare = useMemo(() => selected.length && Number(values.amount) > 0 ? Number(values.amount) / selected.length : 0, [selected, values.amount])
  const percentageTotal = useMemo(() => selected.reduce((sum, userId) => sum + Number(shares[userId] || 0), 0), [selected, shares])
  const percentageValid = Math.abs(percentageTotal - 100) < .001

  function toggle(userId) {
    const next = selected.includes(userId) ? selected.filter(item => item !== userId) : [...selected, userId]
    setSelected(next)
    if (values.splitType === 'percentage') setShares(defaultShares(next, 100))
    if (values.splitType === 'custom') setShares(defaultShares(next, values.amount))
  }

  function set(name, value) {
    setValues(current => ({ ...current, [name]: value }))
  }

  function changeSplitType(type) {
    set('splitType', type)
    if (type === 'percentage') setShares(defaultShares(selected, 100))
    if (type === 'custom') setShares(defaultShares(selected, values.amount))
  }

  async function submit(event) {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      const participants = selected.map(userId => {
        if (values.splitType === 'custom') return { userId, amount: shares[userId] || 0 }
        if (values.splitType === 'percentage') return { userId, percentage: shares[userId] || 0 }
        return userId
      })
      const body = new FormData()
      Object.entries(values).forEach(([key, value]) => body.append(key, value))
      body.append('participants', JSON.stringify(participants))
      if (receipt) body.append('receipt', receipt)
      if (expense) await api.put(`/groups/${group.id}/expenses/${expense.id}`, body)
      else await api.post(`/groups/${group.id}/expenses`, body)
      onSaved()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <form className="expense-form" onSubmit={submit}>
      {error && <div className="form-error">{error}</div>}
      <div className="field-row"><label>عنوان هزینه<input value={values.title} onChange={event => set('title', event.target.value)} placeholder="شام، بلیت قطار…" required /></label><label>مبلغ کل<div className="money-input"><span>{currencyLabel}</span><input type="number" min="0.01" step="0.01" value={values.amount} onChange={event => set('amount', event.target.value)} placeholder="۰" required /></div></label></div>
      <label>توضیحات <span className="optional">اختیاری</span><textarea value={values.description} onChange={event => set('description', event.target.value)} placeholder="یک توضیح کوتاه اضافه کن" rows="2" /></label>
      <div className="field-row"><div className="custom-select-field"><span className="custom-select-label">پرداخت‌کننده</span><CustomSelect value={values.paidBy} onChange={value => set('paidBy', value)} ariaLabel="انتخاب پرداخت‌کننده" options={members.map(member => ({ value: member.id, label: member.name, detail: `@${member.username}` }))} /></div><label>تاریخ<div className="date-input"><CalendarDays size={17} /><input type="date" value={values.date} onChange={event => set('date', event.target.value)} required /></div></label></div>
      <fieldset className="split-fieldset"><legend>هزینه چطور تقسیم شود؟</legend><div className="split-options">{[['equal','مساوی'],['custom','مبلغ دستی'],['percentage','درصدی']].map(item => <label className={values.splitType === item[0] ? 'selected' : ''} key={item[0]}><input type="radio" name="split" checked={values.splitType === item[0]} onChange={() => changeSplitType(item[0])} /><span>{item[1]}</span></label>)}</div></fieldset>
      <fieldset className="people-fieldset"><div className="people-legend"><legend>چه کسانی در هزینه شریک‌اند؟</legend><span>{selected.length} نفر انتخاب شده</span></div><div className="participant-list">{members.map(member => {
        const isSelected = selected.includes(member.id)
        return <div className={`participant-row ${isSelected ? 'selected' : ''}`} key={member.id}><button type="button" className="participant-person" onClick={() => toggle(member.id)}><span className="selection-box">{isSelected && <Check size={13} />}</span><Avatar user={member} size="small" /><span><strong>{member.name}</strong><small className="user-handle">@{member.username}</small></span></button>{isSelected && values.splitType === 'equal' && <strong className="calculated-share">{money(equalShare, group.currency)}</strong>}{isSelected && values.splitType !== 'equal' && <div className="share-input"><input type="number" min="0" step=".01" value={shares[member.id] ?? ''} onChange={event => setShares(current => ({ ...current, [member.id]: event.target.value }))} placeholder="۰" /><span>{values.splitType === 'percentage' ? '٪' : currencyLabel}</span></div>}</div>
      })}</div>{values.splitType === 'percentage' && <div className={`share-total ${percentageValid ? 'valid' : 'invalid'}`}><span>مجموع درصدها</span><strong>{new Intl.NumberFormat('fa-IR', { maximumFractionDigits: 2 }).format(percentageTotal)}٪</strong><small>{percentageValid ? 'آماده ذخیره است' : 'مجموع باید دقیقاً ۱۰۰٪ باشد'}</small></div>}</fieldset>
      <label className="upload-drop"><input type="file" accept="image/*" onChange={event => setReceipt(event.target.files[0])} /><span><ImagePlus size={21} /></span><div><strong>{receipt ? receipt.name : expense?.receiptImage ? 'جایگزینی تصویر رسید' : 'افزودن رسید'}</strong><small>اختیاری · PNG یا JPG تا ۵ مگابایت</small></div></label>
      <div className="form-actions"><button type="button" className="text-button" onClick={onCancel}>انصراف</button><button className="primary-button" disabled={busy || values.splitType === 'percentage' && !percentageValid}>{busy ? 'در حال ذخیره…' : expense ? 'ذخیره تغییرات' : 'افزودن هزینه'}</button></div>
    </form>
  )
}
