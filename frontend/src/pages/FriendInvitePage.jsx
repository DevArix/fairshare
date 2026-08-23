import { ArrowRight, UserPlus, UsersRound } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Avatar from '../components/Avatar.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { api } from '../services/api.js'

export default function FriendInvitePage() {
  const { code } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [inviter, setInviter] = useState(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const accepting = useRef(false)

  useEffect(() => {
    sessionStorage.setItem('fairshare_friend_invite', code)
    api.get(`/friends/invitations/${code}`).then(value => setInviter(value.inviter)).catch(err => {
      sessionStorage.removeItem('fairshare_friend_invite')
      setError(err.message)
    })
  }, [code])

  useEffect(() => {
    if (user && inviter && user.id === inviter.id) sessionStorage.removeItem('fairshare_friend_invite')
  }, [user, inviter])

  useEffect(() => {
    if (user && inviter && user.id !== inviter.id) accept()
  }, [user, inviter])

  async function accept() {
    if (accepting.current) return
    accepting.current = true
    setBusy(true)
    setError('')
    try {
      await api.post(`/friends/invitations/${code}/accept`, {})
      sessionStorage.removeItem('fairshare_friend_invite')
      navigate('/friends', { replace: true })
    } catch (err) {
      accepting.current = false
      setError(err.message)
      setBusy(false)
    }
  }

  const ownInvite = user && inviter && user.id === inviter.id

  return (
    <div className="invite-page"><div className="invite-brand"><span className="logo-mark"><img src="/logo.png?v=20260820" alt="" /></span><span>فیرشِر</span></div><main className="invite-card friend-invite-card">{error && !inviter ? <><span className="invite-icon error">!</span><p className="eyebrow">دعوت‌نامه در دسترس نیست</p><h1>این لینک قابل استفاده نیست</h1><p>{error}</p><Link className="primary-button" to={user ? '/friends' : '/login'}>رفتن به فیرشِر</Link></> : !inviter ? <div className="invite-loading"><span className="logo-mark"><img src="/logo.png?v=20260820" alt="" /></span><p>در حال بررسی دعوت‌نامه…</p></div> : <><div className="friend-invite-cover"><div className="friend-invite-avatar"><Avatar user={inviter} size="large" /><span><UserPlus size={18} /></span></div></div><p className="eyebrow">دعوت به دوستی</p><h1>{inviter.name} دعوتت کرده</h1><p>بعد از ورود یا ساخت حساب، شما دو نفر خودکار به فهرست دوستان هم اضافه می‌شوید.</p><div className="friend-invite-person"><UsersRound size={18} /><div><strong>{inviter.name}</strong><span className="user-handle">@{inviter.username}</span></div></div>{error && <div className="form-error">{error}</div>}{ownInvite ? <><p>این لینک دعوت متعلق به حساب خودت است.</p><Link className="primary-button wide" to="/friends">رفتن به دوستان<ArrowRight size={17} /></Link></> : user ? <button className="primary-button wide" onClick={accept} disabled={busy}>{busy ? 'در حال اضافه کردن خودکار…' : `تلاش دوباره برای افزودن ${inviter.name}`}<ArrowRight size={17} /></button> : <div className="invite-auth-actions"><Link className="primary-button wide" to="/login">ورود و پذیرش دعوت<ArrowRight size={17} /></Link><Link className="secondary-button wide" to="/register">ساخت حساب و پذیرش دعوت</Link></div>}</>}</main></div>
  )
}
