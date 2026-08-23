import { ArrowRight } from 'lucide-react'
import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout.jsx'
import { useAuth } from '../context/AuthContext.jsx'

export default function RegisterPage() {
  const { user, register } = useAuth()
  const navigate = useNavigate()
  const [values, setValues] = useState({ name: '', username: '', email: '', password: '', confirmPassword: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  if (user) return <Navigate to="/" replace />

  async function submit(event) {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      await register(values)
      const friendInvite = sessionStorage.getItem('fairshare_friend_invite')
      const invite = sessionStorage.getItem('fairshare_invite')
      navigate(friendInvite ? `/friends/invite/${friendInvite}` : invite ? `/invite/${invite}` : '/')
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  function field(name) {
    return event => setValues({ ...values, [name]: event.target.value })
  }

  return (
    <AuthLayout eyebrow="شروع کنیم" title="حسابت را بساز" subtitle="پروفایلت را بساز تا مدیریت هزینه‌های مشترک بعدی ساده باشد.">
      <form className="auth-form register-form" onSubmit={submit}>
        {error && <div className="form-error">{error}</div>}
        <div className="form-grid"><label>نام و نام خانوادگی<input value={values.name} onChange={field('name')} placeholder="نام کامل" required /></label><label>نام کاربری<input value={values.username} onChange={field('username')} placeholder="یک نام کاربری انتخاب کن" required /></label></div>
        <label>ایمیل<input type="email" value={values.email} onChange={field('email')} placeholder="you@example.com" required /></label>
        <div className="form-grid"><label>رمز عبور<input type="password" value={values.password} onChange={field('password')} placeholder="حداقل ۸ نویسه" required /></label><label>تکرار رمز عبور<input type="password" value={values.confirmPassword} onChange={field('confirmPassword')} placeholder="رمز را دوباره وارد کن" required /></label></div>
        <label className="check-label terms"><input type="checkbox" required />متعهد می‌شوم هزینه‌ها را درست و منصفانه ثبت کنم.</label>
        <button className="primary-button wide" disabled={busy}>{busy ? 'در حال ساخت حساب…' : 'ساخت حساب'}<ArrowRight size={18} /></button>
      </form>
      <p className="auth-switch">از قبل حساب داری؟ <Link to="/login">وارد شو</Link></p>
    </AuthLayout>
  )
}
