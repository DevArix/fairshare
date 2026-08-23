import { ArrowLeft, KeyRound } from 'lucide-react'
import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout.jsx'
import { api } from '../services/api.js'

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''
  const [values, setValues] = useState({ password: '', confirmPassword: '' })
  const [message, setMessage] = useState('')
  const [error, setError] = useState(token ? '' : 'لینک بازیابی معتبر نیست')
  const [busy, setBusy] = useState(false)

  async function submit(event) {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      const result = await api.post('/auth/reset-password', { token, ...values })
      setMessage(result.message)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <AuthLayout eyebrow="امنیت حساب" title="رمز جدید را انتخاب کن" subtitle="رمز عبور جدید باید حداقل ۸ نویسه داشته باشد.">
      {message ? <div className="success-message recovery-message">{message}</div> : <form className="auth-form" onSubmit={submit}>
        {error && <div className="form-error">{error}</div>}
        <label>رمز عبور جدید<div className="input-with-icon"><KeyRound size={18} /><input type="password" value={values.password} onChange={event => setValues({ ...values, password: event.target.value })} placeholder="حداقل ۸ نویسه" autoComplete="new-password" required /></div></label>
        <label>تکرار رمز عبور<div className="input-with-icon"><KeyRound size={18} /><input type="password" value={values.confirmPassword} onChange={event => setValues({ ...values, confirmPassword: event.target.value })} placeholder="رمز را دوباره وارد کن" autoComplete="new-password" required /></div></label>
        <button className="primary-button wide" disabled={busy || !token}>{busy ? 'در حال ذخیره…' : 'ثبت رمز عبور جدید'}</button>
      </form>}
      <p className="auth-switch"><Link to="/login"><ArrowLeft size={15} />بازگشت به ورود</Link></p>
    </AuthLayout>
  )
}
