import { Check, ChevronDown, PackageCheck, Plus, Trash2, UsersRound } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Avatar from '../components/Avatar.jsx'
import CustomSelect from '../components/CustomSelect.jsx'
import EmptyState from '../components/EmptyState.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useApi } from '../hooks/useApi.js'
import { api } from '../services/api.js'

export default function BringListPage() {
  const { user } = useAuth()
  const groupsRequest = useApi(() => api.get('/groups'), [])
  const [groupId, setGroupId] = useState('')
  const [title, setTitle] = useState('')
  const [assignedTo, setAssignedTo] = useState('')
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)
  const [busyItem, setBusyItem] = useState('')
  const [memberPickerOpen, setMemberPickerOpen] = useState(false)
  const memberPickerRef = useRef(null)

  useEffect(() => {
    if (!groupId && groupsRequest.data?.groups?.length) setGroupId(groupsRequest.data.groups[0].id)
  }, [groupsRequest.data, groupId])

  const groupRequest = useApi(() => groupId ? api.get(`/groups/${groupId}`) : Promise.resolve(null), [groupId])
  const itemsRequest = useApi(() => groupId ? api.get(`/groups/${groupId}/bring-items`) : Promise.resolve({ items: [] }), [groupId])
  const members = groupRequest.data?.group?.members || []
  const items = itemsRequest.data?.items || []
  const selectedGroup = groupsRequest.data?.groups?.find(group => group.id === groupId)
  const selectedMember = members.find(member => member.userId === assignedTo)

  useEffect(() => {
    function closePicker(event) {
      if (!memberPickerRef.current?.contains(event.target)) setMemberPickerOpen(false)
    }
    document.addEventListener('mousedown', closePicker)
    return () => document.removeEventListener('mousedown', closePicker)
  }, [])

  useEffect(() => {
    if (!members.length) return
    if (!members.some(member => member.userId === assignedTo)) {
      setAssignedTo(members.find(member => member.userId === user.id)?.userId || members[0].userId)
    }
  }, [members, assignedTo, user.id])

  async function addItem(event) {
    event.preventDefault()
    if (!title.trim() || !assignedTo) return
    setSaving(true)
    setMessage('')
    try {
      await api.post(`/groups/${groupId}/bring-items`, { title, assignedTo })
      setTitle('')
      setMessage('مورد جدید اضافه شد')
      await itemsRequest.refresh()
    } catch (error) {
      setMessage(error.message)
    } finally {
      setSaving(false)
    }
  }

  async function toggleItem(item) {
    setBusyItem(item.id)
    setMessage('')
    try {
      await api.patch(`/groups/${groupId}/bring-items/${item.id}`, { done: !item.done })
      await itemsRequest.refresh()
    } catch (error) {
      setMessage(error.message)
    } finally {
      setBusyItem('')
    }
  }

  async function removeItem(item) {
    setBusyItem(item.id)
    setMessage('')
    try {
      await api.delete(`/groups/${groupId}/bring-items/${item.id}`)
      await itemsRequest.refresh()
    } catch (error) {
      setMessage(error.message)
    } finally {
      setBusyItem('')
    }
  }

  if (groupsRequest.loading) return <div className="bring-loading"><span /><span /></div>

  if (!groupsRequest.data?.groups?.length) {
    return <EmptyState icon={<UsersRound size={23} />} title="اول یک گروه بساز" text="برای تقسیم وسایل و کارها باید دست‌کم یک گروه داشته باشی." action={<Link className="primary-button" to="/groups/new">ساخت گروه</Link>} />
  }

  return (
    <div className="bring-page">
      <section className="bring-hero">
        <div><p className="eyebrow light">برنامهٔ مشترک</p><h2>کی چی بیاره؟</h2><p>هر وسیله یا کاری را به یکی از اعضای گروه بسپار تا چیزی فراموش نشود.</p></div>
        <span><PackageCheck size={31} /></span>
      </section>

      <section className="bring-toolbar surface">
        <div className="custom-select-field"><span className="custom-select-label">انتخاب گروه</span><CustomSelect value={groupId} onChange={setGroupId} ariaLabel="انتخاب گروه" options={groupsRequest.data.groups.map(group => ({ value: group.id, label: group.name }))} /></div>
        <div className="bring-toolbar-summary"><strong>{selectedGroup?.name}</strong><span>{members.length} عضو · {items.filter(item => !item.done).length} مورد باقی مانده</span></div>
      </section>

      <div className="bring-layout">
        <form className="bring-form surface" onSubmit={addItem}>
          <div className="section-heading compact"><div><p className="eyebrow">مورد تازه</p><h2>اضافه کردن به فهرست</h2></div><Plus size={20} /></div>
          <label>وسیله یا کار<input value={title} onChange={event => setTitle(event.target.value)} maxLength="120" placeholder="مثلاً نوشابه یا خرید زغال" /></label>
          <div className="bring-member-field"><span className="bring-field-label">چه کسی انجامش بدهد؟</span><div className={`member-picker ${memberPickerOpen ? 'open' : ''}`} ref={memberPickerRef} onKeyDown={event => event.key === 'Escape' && setMemberPickerOpen(false)}><button type="button" className="member-picker-trigger" onClick={() => setMemberPickerOpen(!memberPickerOpen)} disabled={groupRequest.loading} aria-haspopup="listbox" aria-expanded={memberPickerOpen}>{selectedMember ? <><Avatar user={selectedMember.user} size="small" /><span className="member-picker-copy"><strong>{selectedMember.user.name}</strong><small className="user-handle">@{selectedMember.user.username}</small></span></> : <span className="member-picker-copy"><strong>در حال دریافت اعضا…</strong></span>}<ChevronDown size={17} /></button>{memberPickerOpen && <div className="member-picker-menu" role="listbox" aria-label="انتخاب مسئول">{members.map(member => <button type="button" role="option" aria-selected={member.userId === assignedTo} className={member.userId === assignedTo ? 'selected' : ''} key={member.userId} onClick={() => { setAssignedTo(member.userId); setMemberPickerOpen(false) }}><Avatar user={member.user} size="small" /><span><strong>{member.user.name}</strong><small className="user-handle">@{member.user.username}</small></span><i>{member.userId === assignedTo && <Check size={14} />}</i></button>)}</div>}</div></div>
          <button className="primary-button wide" disabled={saving || !title.trim() || !assignedTo}>{saving ? 'در حال افزودن…' : 'اضافه کردن'}</button>
          {(message || groupsRequest.error || groupRequest.error) && <p className="bring-message">{message || groupsRequest.error || groupRequest.error}</p>}
        </form>

        <section className="bring-list-card surface">
          <div className="section-heading compact"><div><p className="eyebrow">فهرست گروه</p><h2>وسایل و کارها</h2></div><span className="count-badge">{items.length}</span></div>
          {itemsRequest.loading ? <div className="bring-list-loading"><span /><span /><span /></div> : itemsRequest.error ? <div className="form-error">{itemsRequest.error}</div> : items.length ? <div className="bring-items">{items.map(item => {
            return <article className={item.done ? 'done' : ''} key={item.id}>
              <button className="bring-check" onClick={() => toggleItem(item)} disabled={busyItem === item.id} aria-label={item.done ? 'برگرداندن به فهرست' : 'علامت زدن به عنوان آماده'}>{item.done && <Check size={17} />}</button>
              <div className="bring-item-main"><strong>{item.title}</strong><span><Avatar user={item.assignedUser} size="small" />مسئول: {item.assignedUser.name}</span></div>
              <small>{item.done ? 'آماده شد' : 'در انتظار'}</small>
              <button className="bring-delete" onClick={() => removeItem(item)} disabled={busyItem === item.id} aria-label={`حذف ${item.title}`}><Trash2 size={16} /></button>
            </article>
          })}</div> : <EmptyState icon={<PackageCheck size={23} />} title="فهرست هنوز خالی است" text="اولین وسیله یا کار را از فرم کناری اضافه کن." />}
        </section>
      </div>
    </div>
  )
}
