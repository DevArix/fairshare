import { ArrowRight, CheckCircle2, UsersRound } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { api, assetUrl } from '../services/api.js'

export default function InvitePage() {
  const { code } = useParams()
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const [group, setGroup] = useState(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const joining = useRef(false)

  useEffect(() => {
    sessionStorage.setItem('fairshare_invite', code)
    api.get(`/invitations/${code}`).then(value => setGroup(value.group)).catch(err => {
      sessionStorage.removeItem('fairshare_invite')
      setError(err.message)
    })
  }, [code])

  useEffect(() => {
    if (user && group) join()
  }, [user, group])

  async function join() {
    if (joining.current) return
    joining.current = true
    setBusy(true)
    setError('')
    try {
      const value = await api.post(`/invitations/${code}/join`, {})
      sessionStorage.removeItem('fairshare_invite')
      navigate(`/groups/${value.groupId}`)
    } catch (err) {
      joining.current = false
      setError(err.message)
      setBusy(false)
    }
  }

  return (
      <div className="invite-page"><div className="invite-brand"><span className="logo-mark"><img src="/logo.png?v=20260820" alt="" /></span><span>فیرشِر</span></div><main className="invite-card">{error && !group ? <><span className="invite-icon error">!</span><p className="eyebrow">دعوت‌نامه در دسترس نیست</p><h1>این لینک قابل استفاده نیست</h1><p>{error}</p><Link className="primary-button" to={user ? '/' : '/login'}>رفتن به فیرشِر</Link></> : !group || loading ? <div className="invite-loading"><span className="logo-mark"><img src="/logo.png?v=20260820" alt="" /></span><p>در حال بررسی دعوت‌نامه…</p></div> : <><div className="invite-cover" style={group.profilePicture ? { backgroundImage: `url(${assetUrl(group.profilePicture)})` } : {}}><span><UsersRound size={28} /></span></div><p className="eyebrow">دعوت شدی</p><h1>عضویت در {group.name}</h1><p>{user ? 'در حال اضافه‌کردن خودکار شما به گروه هستیم.' : 'بعد از ورود یا ساخت حساب، خودکار عضو این گروه می‌شوی.'}</p><div className="invite-facts"><span><UsersRound size={17} />{group.memberCount} عضو</span><span><CheckCircle2 size={17} />هزینه‌های {group.currency === 'IRT' || group.currency === 'IRR' ? 'تومانی' : group.currency}</span></div>{error && <div className="form-error">{error}</div>}{user ? <button className="primary-button wide" onClick={join} disabled={busy}>{busy ? 'در حال عضویت خودکار…' : 'تلاش دوباره برای عضویت'}<ArrowRight size={17} /></button> : <div className="invite-auth-actions"><Link className="primary-button wide" to="/login">ورود و عضویت خودکار<ArrowRight size={17} /></Link><Link className="secondary-button wide" to="/register">ساخت حساب و عضویت خودکار</Link></div>}</>}</main></div>
  )
}
