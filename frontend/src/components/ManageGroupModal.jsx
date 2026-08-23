import { Check, Copy, Link2, RefreshCw, ShieldCheck, Trash2, UserPlus } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { api } from '../services/api.js'
import Avatar from './Avatar.jsx'
import Modal from './Modal.jsx'
import { siteUrl } from '../utils/siteUrl.js'

export default function ManageGroupModal({ group, friends, onClose, onSaved }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')
  const [deleting, setDeleting] = useState(false)
  const available = useMemo(() => friends.filter(friend => !group.members.some(item => item.userId === friend.id)), [friends, group.members])
  const ownerId = group.ownerId || group.adminId
  const isOwner = ownerId === user.id
  const isAdmin = group.adminId === user.id
  const link = siteUrl(`/invite/${group.invitationCode}`)

  async function act(load) {
    setError('')
    try {
      await load()
      onSaved()
    } catch (err) {
      setError(err.message)
    }
  }

  async function copy() {
    await navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  async function leave() {
    await act(() => api.post(`/groups/${group.id}/leave`, {}))
    navigate('/')
  }

  async function removeGroup() {
    if (!window.confirm(`گروه «${group.name}» و تمام هزینه‌ها، تسویه‌ها و سوابق آن برای همیشه حذف شود؟`)) return
    setDeleting(true)
    setError('')
    try {
      await api.delete(`/groups/${group.id}`)
      navigate('/')
    } catch (err) {
      setError(err.message)
      setDeleting(false)
    }
  }

  return (
    <Modal title="مدیریت گروه" eyebrow={isOwner ? 'تنظیمات مالک' : isAdmin ? 'تنظیمات مدیر' : 'دسترسی کامل عضو'} onClose={onClose} wide>
      {error && <div className="form-error">{error}</div>}
      <section className="manage-section"><div className="manage-title"><span><Link2 size={18} /></span><div><h3>لینک دعوت به گروه</h3><p>مهمان بعد از ثبت‌نام یا ورود، خودکار عضو این گروه می‌شود.</p></div></div><div className="invite-copy"><input value={group.invitationEnabled ? link : 'لینک دعوت غیرفعال است'} readOnly /><button onClick={copy} disabled={!group.invitationEnabled}>{copied ? <Check size={17} /> : <Copy size={17} />}{copied ? 'کپی شد' : 'کپی'}</button></div><div className="inline-actions"><button onClick={() => act(() => api.post(`/groups/${group.id}/invitation/regenerate`, {}))}><RefreshCw size={15} />ساخت لینک جدید</button>{group.invitationEnabled && <button className="danger-text" onClick={() => act(() => api.post(`/groups/${group.id}/invitation/disable`, {}))}>غیرفعال کردن لینک</button>}</div></section>
      <section className="manage-section"><div className="manage-title"><span><UserPlus size={18} /></span><div><h3>اعضای گروه</h3><p>{group.members.length} نفر در این گروه هستند.</p></div></div><div className="manage-member-list">{group.members.map(item => <div key={item.userId}><Avatar user={item.user} size="small" /><div><strong>{item.user.name}</strong><small className="user-handle">@{item.user.username}</small></div>{item.userId === group.adminId ? <span className="admin-badge"><ShieldCheck size={13} />مدیر</span> : <div className="member-actions"><button onClick={() => act(() => api.patch(`/groups/${group.id}/admin`, { userId: item.userId }))}>مدیر شود</button>{item.userId !== ownerId && item.userId !== user.id && <button aria-label="حذف عضو" onClick={() => act(() => api.delete(`/groups/${group.id}/members/${item.userId}`))}><Trash2 size={15} /></button>}</div>}</div>)}</div>{available.length > 0 && <div className="add-friend-row"><span>افزودن دوست</span><div>{available.map(friend => <button key={friend.id} onClick={() => act(() => api.post(`/groups/${group.id}/members`, { userId: friend.id }))}><Avatar user={friend} size="small" />{friend.name}<UserPlus size={14} /></button>)}</div></div>}</section>
      {isOwner && <section className="group-danger-zone"><div><strong>حذف کامل گروه</strong><p>فقط مالک اصلی می‌تواند تمام هزینه‌ها، تسویه‌ها، اعضا و سوابق گروه را برای همیشه پاک کند.</p></div><button className="danger-button" onClick={removeGroup} disabled={deleting}><Trash2 size={16} />{deleting ? 'در حال حذف…' : 'حذف گروه'}</button></section>}
      {!isOwner && !isAdmin && <button className="danger-button wide" onClick={leave}>خروج از گروه</button>}
    </Modal>
  )
}
