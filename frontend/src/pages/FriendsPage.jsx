import { Check, Clock3, Copy, Link2, UserPlus, UsersRound, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import Avatar from '../components/Avatar.jsx'
import EmptyState from '../components/EmptyState.jsx'
import { useApi } from '../hooks/useApi.js'
import { api } from '../services/api.js'

export default function FriendsPage() {
  const { data, loading, error, refresh } = useApi(() => api.get('/friends'), [])
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [message, setMessage] = useState('')
  const [searching, setSearching] = useState(false)
  const [inviteCode, setInviteCode] = useState('')
  const [inviteError, setInviteError] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    api.get('/friends/invite-link').then(value => setInviteCode(value.code)).catch(err => setInviteError(err.message))
  }, [])

  const inviteLink = inviteCode ? `${window.location.origin}/friends/invite/${inviteCode}` : ''

  async function copyInvite() {
    try {
      await navigator.clipboard.writeText(inviteLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      setInviteError('کپی خودکار ممکن نشد؛ لینک را دستی انتخاب کنید')
    }
  }

  async function search(event) {
    event.preventDefault()
    if (query.trim().length < 2) return
    const startedAt = Date.now()
    setSearching(true)
    setMessage('')
    try {
      const value = await api.get(`/users/search?q=${encodeURIComponent(query)}`)
      setResults(value.users)
    } catch (err) {
      setMessage(err.message)
    } finally {
      const wait = 600 - (Date.now() - startedAt)
      if (wait > 0) await new Promise(resolve => setTimeout(resolve, wait))
      setSearching(false)
    }
  }

  async function send(receiverId) {
    try {
      await api.post('/friends/requests', { receiverId })
      setResults(current => current.filter(item => item.id !== receiverId))
      setMessage('درخواست دوستی ارسال شد')
    } catch (err) {
      setMessage(err.message)
    }
  }

  async function answer(requestId, status) {
    try {
      await api.patch(`/friends/requests/${requestId}`, { status })
      refresh()
    } catch (err) {
      setMessage(err.message)
    }
  }

  return (
    <div className="friends-page">
      <section className="friend-search-card"><div><p className="eyebrow">جمع دوستانت را بزرگ‌تر کن</p><h2>پیدا کردن دوست</h2><p>با نام، نام کاربری یا ایمیل جستجو کن. درخواست تکراری خودکار جلوگیری می‌شود.</p></div><form onSubmit={search}><input value={query} onChange={event => setQuery(event.target.value)} placeholder="نام یک نفر را جستجو کن…" /><button className={`primary-button search-button ${searching ? 'searching' : ''}`} disabled={searching}>{searching ? <span className="search-dots" aria-label="در حال جستجو"><span /><span /><span /></span> : 'جستجو'}</button></form>{message && <p className="inline-message">{message}</p>}{results.length > 0 && <div className="search-results">{results.map(person => <div key={person.id}><Avatar user={person} /><div><strong>{person.name}</strong><span className="user-handle">@{person.username}</span></div><button className="secondary-button" onClick={() => send(person.id)}><UserPlus size={16} />افزودن</button></div>)}</div>}</section>
      <section className="site-invite-card"><div className="site-invite-intro"><span><Link2 size={22} /></span><div><p className="eyebrow">دعوت به سایت</p><h2>دوستت را با لینک دعوت کن</h2><p>این لینک را بفرست؛ دوستت پس از ورود یا ساخت حساب می‌تواند مستقیم به فهرست دوستانت اضافه شود.</p></div></div><label className="site-invite-field">لینک دعوت اختصاصی شما<div className="invite-copy"><input value={inviteLink || 'در حال ساخت لینک…'} readOnly /><button type="button" onClick={copyInvite} disabled={!inviteLink}>{copied ? <Check size={17} /> : <Copy size={17} />}{copied ? 'کپی شد' : 'کپی لینک'}</button></div>{inviteError && <small>{inviteError}</small>}</label></section>
      <div className="friends-columns">
        <section className="surface"><div className="section-heading compact"><div><p className="eyebrow">آدم‌های شما</p><h2>دوستان</h2></div><span className="count-badge">{data?.friends?.length || 0}</span></div>{loading ? <div className="list-skeleton" /> : data?.friends?.length ? <div className="friend-list">{data.friends.map(friend => <div key={friend.id}><Avatar user={friend} /><div><strong>{friend.name}</strong><span className="user-handle">@{friend.username}</span></div><span className="friend-status"><span />دوست</span></div>)}</div> : <EmptyState icon={<UsersRound size={22} />} title="هنوز دوستی نداری" text="از بخش بالا یک نفر را پیدا کن و اولین درخواست دوستی را بفرست." />}</section>
        <section className="surface"><div className="section-heading compact"><div><p className="eyebrow">منتظر پاسخ شما</p><h2>درخواست‌های دوستی</h2></div><Clock3 size={19} /></div>{error && <div className="form-error">{error}</div>}{data?.requests?.length ? <div className="request-list">{data.requests.map(request => <div key={request.id}><Avatar user={request.sender} /><div><strong>{request.sender.name}</strong><span className="user-handle">@{request.sender.username}</span></div><div><button className="accept-button" onClick={() => answer(request.id, 'accepted')} aria-label="پذیرفتن"><Check size={17} /></button><button className="reject-button" onClick={() => answer(request.id, 'rejected')} aria-label="رد کردن"><X size={17} /></button></div></div>)}</div> : <EmptyState icon={<Check size={22} />} title="همه‌چیز مرتب است" text="درخواست‌های دوستی جدید اینجا نمایش داده می‌شوند." />}</section>
      </div>
    </div>
  )
}
