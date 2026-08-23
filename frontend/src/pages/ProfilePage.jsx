import { Camera, CheckCircle2, KeyRound, Save, ShieldCheck } from 'lucide-react'
import { useEffect, useState } from 'react'
import Avatar from '../components/Avatar.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { api } from '../services/api.js'
import { shortDate } from '../utils/format.js'

export default function ProfilePage() {
  const { user, setUser } = useAuth()
  const [profile, setProfile] = useState({ name: user.name, username: user.username })
  const [picture, setPicture] = useState(null)
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '' })
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!message) return
    const timer = setTimeout(() => setMessage(''), 3400)
    return () => clearTimeout(timer)
  }, [message])

  async function saveProfile(event) {
    event.preventDefault()
    setError('')
    setMessage('')
    try {
      const body = new FormData()
      body.append('name', profile.name)
      body.append('username', profile.username)
      if (picture) body.append('profilePicture', picture)
      const value = await api.put('/users/profile', body)
      setUser(value.user)
      setMessage('پروفایل ذخیره شد')
    } catch (err) {
      setError(err.message)
    }
  }

  async function savePassword(event) {
    event.preventDefault()
    setError('')
    setMessage('')
    try {
      const value = await api.put('/users/password', passwords)
      setMessage(value.message)
      setPasswords({ currentPassword: '', newPassword: '' })
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="profile-layout">
      <aside className="profile-card surface"><div className="profile-avatar-wrap"><Avatar user={user} size="large" /><label><Camera size={15} /><input type="file" accept="image/*" onChange={event => setPicture(event.target.files[0])} /></label></div><h2>{user.name}</h2><p className="user-handle">@{user.username}</p><div className="profile-fact"><span><ShieldCheck size={17} /></span><div><strong>عضو فیرشِر</strong><small>عضویت از {shortDate(user.createdAt)}</small></div></div><div className="profile-fact"><span><KeyRound size={17} /></span><div><strong>حساب محافظت‌شده</strong><small>رمز عبور شما به‌صورت هش امن نگهداری می‌شود</small></div></div></aside>
      <div className="settings-stack">{message && <div className="profile-toast" role="status"><span><CheckCircle2 size={21} /></span><div><strong>{message}</strong><small>تغییرات با موفقیت اعمال شد.</small></div></div>}{error && <div className="form-error">{error}</div>}<form className="surface settings-form" onSubmit={saveProfile}><div className="form-intro"><p className="eyebrow">اطلاعات عمومی</p><h2>اطلاعات پروفایل</h2><p>دوستان و اعضای گروه شما را با این اطلاعات می‌بینند.</p></div><div className="field-row"><label>نام و نام خانوادگی<input value={profile.name} onChange={event => setProfile({ ...profile, name: event.target.value })} required /></label><label>نام کاربری<input value={profile.username} onChange={event => setProfile({ ...profile, username: event.target.value })} required /></label></div><label>ایمیل<input value={user.email} disabled /><small className="field-help">تغییر ایمیل در نسخه اول در دسترس نیست.</small></label><button className="primary-button"><Save size={16} />ذخیره پروفایل</button></form><form className="surface settings-form" onSubmit={savePassword}><div className="form-intro"><p className="eyebrow">امنیت حساب</p><h2>تغییر رمز عبور</h2><p>برای رمز جدید حداقل ۸ نویسه انتخاب کن.</p></div><div className="field-row"><label>رمز عبور فعلی<input type="password" value={passwords.currentPassword} onChange={event => setPasswords({ ...passwords, currentPassword: event.target.value })} required /></label><label>رمز عبور جدید<input type="password" value={passwords.newPassword} onChange={event => setPasswords({ ...passwords, newPassword: event.target.value })} required /></label></div><button className="secondary-button"><KeyRound size={16} />به‌روزرسانی رمز</button></form></div>
    </div>
  )
}
