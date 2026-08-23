import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail } from 'lucide-react'
import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout.jsx'
import { useAuth } from '../context/AuthContext.jsx'

export default function LoginPage() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const [values, setValues] = useState({ login: '', password: '' })
  const [visible, setVisible] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  if (user) return <Navigate to="/" replace />

  async function submit(event) {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      await login(values)
      const friendInvite = sessionStorage.getItem('fairshare_friend_invite')
      const invite = sessionStorage.getItem('fairshare_invite')
      navigate(friendInvite ? `/friends/invite/${friendInvite}` : invite ? `/invite/${invite}` : '/')
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <AuthLayout eyebrow="خوش برگشتی" title="وارد حسابت شو" subtitle="دنگ‌ها قاطی شده؟ اینجا همه‌چیز شفاف و مرتب می‌شود.">
      <form className="auth-form" onSubmit={submit}>
        {error && <div className="form-error">{error}</div>}
        <label>نام کاربری یا ایمیل<div className="input-with-icon"><Mail size={18} /><input value={values.login} onChange={event => setValues({ ...values, login: event.target.value })} placeholder="you@example.com" autoComplete="username" required /></div></label>
        <label>رمز عبور<div className="input-with-icon password-input"><LockKeyhole size={18} /><input type={visible ? 'text' : 'password'} value={values.password} onChange={event => setValues({ ...values, password: event.target.value })} placeholder="رمز عبورت را وارد کن" autoComplete="current-password" required /><button type="button" onClick={() => setVisible(!visible)} aria-label="نمایش رمز عبور">{visible ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></label>
        <div className="form-between"><label className="check-label"><input type="checkbox" />مرا به خاطر بسپار</label><Link className="forgot-link" to="/forgot-password">رمز عبور را فراموش کرده‌ام</Link></div>
        <button className="primary-button wide" disabled={busy}>{busy ? 'در حال ورود…' : 'ورود'}<ArrowRight size={18} /></button>
      </form>
      <p className="auth-switch">هنوز حساب نداری؟ <Link to="/register">حساب بساز</Link></p>
    </AuthLayout>
  )
}
