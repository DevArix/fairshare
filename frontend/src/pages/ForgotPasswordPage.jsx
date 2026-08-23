import { ArrowLeft, Mail } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout.jsx'
import { api } from '../services/api.js'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(event) {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      const result = await api.post('/auth/forgot-password', { email })
      setMessage(result.message)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <AuthLayout eyebrow="بازیابی حساب" title="رمزت را فراموش کرده‌ای؟" subtitle="ایمیل حسابت را وارد کن تا لینک انتخاب رمز جدید را برایت بفرستیم.">
      {message ? <div className="success-message recovery-message">{message}</div> : <form className="auth-form" onSubmit={submit}>
        {error && <div className="form-error">{error}</div>}
        <label>ایمیل حساب<div className="input-with-icon"><Mail size={18} /><input type="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="you@example.com" autoComplete="email" required /></div></label>
        <button className="primary-button wide" disabled={busy}>{busy ? 'در حال ارسال…' : 'ارسال لینک بازیابی'}</button>
      </form>}
      <p className="auth-switch"><Link to="/login"><ArrowLeft size={15} />بازگشت به ورود</Link></p>
    </AuthLayout>
  )
}
