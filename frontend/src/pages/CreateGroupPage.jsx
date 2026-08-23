import { ArrowLeft, Camera, Check, Copy, Link2, UsersRound } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import Avatar from '../components/Avatar.jsx'
import CustomSelect from '../components/CustomSelect.jsx'
import { useApi } from '../hooks/useApi.js'
import { api } from '../services/api.js'

export default function CreateGroupPage() {
  const { data } = useApi(() => api.get('/friends'), [])
  const [values, setValues] = useState({ name: '', description: '', currency: 'IRT' })
  const [selected, setSelected] = useState([])
  const [picture, setPicture] = useState(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [createdGroup, setCreatedGroup] = useState(null)
  const [copied, setCopied] = useState(false)
  const [copyError, setCopyError] = useState('')

  const inviteLink = createdGroup ? `${window.location.origin}/invite/${createdGroup.invitationCode}` : ''

  function toggle(id) {
    setSelected(current => current.includes(id) ? current.filter(item => item !== id) : [...current, id])
  }

  async function submit(event) {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      const body = new FormData()
      Object.entries(values).forEach(([key, value]) => body.append(key, value))
      body.append('friendIds', JSON.stringify(selected))
      if (picture) body.append('profilePicture', picture)
      const result = await api.post('/groups', body)
      setCreatedGroup(result.group)
      setBusy(false)
    } catch (err) {
      setError(err.message)
      setBusy(false)
    }
  }

  async function copyInvite() {
    try {
      await navigator.clipboard.writeText(inviteLink)
      setCopied(true)
      setCopyError('')
      setTimeout(() => setCopied(false), 1800)
    } catch {
      setCopyError('کپی خودکار ممکن نشد؛ لینک را دستی انتخاب کنید')
    }
  }

  return (
    <div className="create-page">
      <Link className="back-link" to="/"><ArrowLeft size={16} />بازگشت به نمای کلی</Link>
      <div className="create-layout">
        {createdGroup ? <section className="group-created-card surface"><span><Check size={28} /></span><p className="eyebrow">گروه آماده است</p><h2>{createdGroup.name} ساخته شد</h2><p>لینک دعوت کنار صفحه آماده‌ی ارسال است. مهمان‌ها بعد از ثبت‌نام یا ورود، خودکار عضو گروه می‌شوند.</p><div className="group-created-actions"><Link className="primary-button" to={`/groups/${createdGroup.id}`}>ورود به گروه<ArrowLeft size={17} /></Link><Link className="secondary-button" to="/">بازگشت به گروه‌ها</Link></div></section> : <form className="create-form surface" onSubmit={submit}><div className="form-intro"><p className="eyebrow">اطلاعات پایه</p><h2>فضای مشترکت را نام‌گذاری کن</h2><p>اعضا و تنظیمات دعوت را هر زمان بخواهی می‌توانی تغییر بدهی.</p></div>{error && <div className="form-error">{error}</div>}<label>تصویر گروه <span className="optional">اختیاری</span><span className="picture-picker"><input type="file" accept="image/*" onChange={event => setPicture(event.target.files[0])} /><span><Camera size={20} /></span><div><strong>{picture ? picture.name : 'انتخاب تصویر'}</strong><small>PNG یا JPG تا ۵ مگابایت</small></div></span></label><label>نام گروه<input value={values.name} onChange={event => setValues({ ...values, name: event.target.value })} placeholder="سفر شمال" required /></label><label>توضیحات <span className="optional">اختیاری</span><textarea rows="3" value={values.description} onChange={event => setValues({ ...values, description: event.target.value })} placeholder="این گروه برای چه هزینه‌هایی است؟" /></label><div className="custom-select-field"><span className="custom-select-label">ارز گروه</span><CustomSelect value={values.currency} onChange={currency => setValues({ ...values, currency })} ariaLabel="انتخاب ارز گروه" options={[{ value: 'IRT', label: 'تومان ایران', detail: 'مناسب پرداخت‌های داخل ایران' }, { value: 'USD', label: 'دلار آمریکا', detail: 'USD' }, { value: 'EUR', label: 'یورو', detail: 'EUR' }]} /><small className="field-help">تمام هزینه‌های این گروه با همین ارز ثبت می‌شوند.</small></div><div className="create-actions"><Link className="text-button" to="/">انصراف</Link><button className="primary-button" disabled={busy}>{busy ? 'در حال ساخت…' : 'ساخت گروه'}</button></div></form>}
        <aside className={`invite-friends-panel ${createdGroup ? 'ready' : ''}`}>{createdGroup ? <><p className="eyebrow">لینک آماده است</p><h2>دعوت به {createdGroup.name}</h2><p>این لینک را برای هر کسی بفرستی، بعد از ورود یا ساخت حساب خودکار عضو گروه می‌شود.</p><div className="create-invite-box"><span><Link2 size={22} /></span><label>لینک دعوت گروه<div className="invite-copy"><input value={inviteLink} readOnly /><button type="button" onClick={copyInvite}>{copied ? <Check size={17} /> : <Copy size={17} />}{copied ? 'کپی شد' : 'کپی'}</button></div></label>{copyError && <small>{copyError}</small>}</div><Link className="secondary-button wide" to={`/groups/${createdGroup.id}`}>مدیریت گروه و اعضا</Link></> : <><p className="eyebrow">با هم شروع کنید</p><h2>همین حالا دوست اضافه کن</h2><p>دوستان فعلی را مستقیم اضافه کن. بقیه با لینک اختصاصی، بعد از ثبت‌نام یا ورود خودکار عضو گروه می‌شوند.</p>{data?.friends?.length ? <div className="select-friends-list">{data.friends.map(friend => <button type="button" className={selected.includes(friend.id) ? 'selected' : ''} key={friend.id} onClick={() => toggle(friend.id)}><Avatar user={friend} /><div><strong>{friend.name}</strong><span className="user-handle">@{friend.username}</span></div><span className="selection-box">{selected.includes(friend.id) && <Check size={13} />}</span></button>)}</div> : <div className="friends-tip"><span><UsersRound size={22} /></span><p>گروه را بساز و لینک دعوت را برای عضویت خودکار افراد بفرست.</p></div>}</>}</aside>
      </div>
    </div>
  )
}
