import { Bell, History, LayoutDashboard, LogOut, Menu, PackageCheck, Plus, UserRound, UsersRound, X } from 'lucide-react'
import { useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { api } from '../services/api.js'
import { shortDate } from '../utils/format.js'
import Avatar from './Avatar.jsx'

const links = [
  { to: '/', label: 'نمای کلی', icon: LayoutDashboard },
  { to: '/settlements', label: 'تسویه‌ها', icon: History, mobile: false },
  { to: '/friends', label: 'دوستان', icon: UsersRound },
  { to: '/groups/new', label: 'ساخت گروه', icon: Plus },
  { to: '/bring-list', label: 'کی چی بیاره؟', icon: PackageCheck },
  { to: '/profile', label: 'پروفایل', icon: UserRound }
]

const titles = {
  '/': ['نمای کلی', 'تصویر شفاف هزینه‌ها و دنگ‌های مشترک'],
  '/friends': ['دوستان', 'کسانی که با آن‌ها هزینه مشترک داری'],
  '/groups/new': ['ساخت گروه', 'یک فضای مشترک تازه بساز'],
  '/settlements': ['تسویه‌ها', 'همه پرداخت‌های ثبت‌شده در گروه‌های شما'],
  '/bring-list': ['کی چی بیاره؟', 'وسایل و کارها را بین اعضای گروه تقسیم کن'],
  '/profile': ['پروفایل', 'حساب کاربری‌ات را مدیریت کن']
}

export default function AppShell() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [notificationsLoading, setNotificationsLoading] = useState(false)
  const [notificationsError, setNotificationsError] = useState('')
  const heading = location.pathname.startsWith('/groups/') && location.pathname !== '/groups/new' ? ['گروه', 'هزینه‌ها، مانده‌ها و فعالیت‌ها'] : titles[location.pathname] || titles['/']

  async function toggleNotifications() {
    if (notificationsOpen) {
      setNotificationsOpen(false)
      return
    }
    setNotificationsOpen(true)
    setNotificationsLoading(true)
    setNotificationsError('')
    try {
      const data = await api.get('/groups')
      setNotifications(data.activities || [])
    } catch (error) {
      setNotificationsError(error.message)
    } finally {
      setNotificationsLoading(false)
    }
  }

  return (
    <div className="app-layout">
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="brand"><span className="logo-mark"><img src="/logo.png?v=20260820" alt="" /></span><span>فیرشِر</span></div>
        <button className="mobile-close" onClick={() => setOpen(false)} aria-label="بستن منو"><X size={20} /></button>
        <nav className="main-nav">
          <p className="nav-label">فضای کار</p>
          {links.map(item => <NavLink key={item.to} to={item.to} end={item.to === '/'} onClick={() => setOpen(false)}><item.icon size={18} /><span>{item.label}</span></NavLink>)}
        </nav>
        <div className="sidebar-note">
          <span>بد نیست بدانی</span>
          <p>روی هر مانده بزن تا دقیقاً ببینی از کدام هزینه‌ها ساخته شده است.</p>
        </div>
        <div className="sidebar-user">
          <Link className="sidebar-profile-link" to="/profile" onClick={() => setOpen(false)} aria-label="باز کردن پروفایل">
            <Avatar user={user} />
            <div><strong>{user.name}</strong><span className="user-handle">@{user.username}</span></div>
          </Link>
          <button onClick={logout} aria-label="خروج از حساب"><LogOut size={18} /></button>
        </div>
      </aside>
      {open && <button className="sidebar-backdrop" onClick={() => setOpen(false)} aria-label="بستن منو" />}
      <main className="main-area">
        <header className="topbar">
          <div className="topbar-title">
            <button className="menu-button" onClick={() => setOpen(true)} aria-label="باز کردن منو"><Menu size={22} /></button>
            <div><h1>{heading[0]}</h1><p>{heading[1]}</p></div>
          </div>
          <div className="topbar-actions">
            {notificationsOpen && <button className="notification-backdrop" onClick={() => setNotificationsOpen(false)} aria-label="بستن اعلان‌ها" />}
            <div className="notification-wrap"><button className={`icon-button notification-button ${notificationsOpen ? 'active' : ''}`} onClick={toggleNotifications} aria-label="اعلان‌ها" aria-expanded={notificationsOpen}><Bell size={19} />{notifications.length > 0 && <span className="notification-count">{notifications.length}</span>}</button>{notificationsOpen && <div className="notification-panel" role="dialog" aria-label="اعلان‌های اخیر"><div className="notification-head"><div><strong>اعلان‌ها</strong><span>آخرین فعالیت گروه‌های شما</span></div><button onClick={() => setNotificationsOpen(false)} aria-label="بستن"><X size={17} /></button></div>{notificationsLoading ? <div className="notification-loading"><span /><span /><span /></div> : notificationsError ? <p className="notification-error">{notificationsError}</p> : notifications.length ? <div className="notification-list">{notifications.map(item => <Link key={item.id} to={`/groups/${item.groupId}`} onClick={() => setNotificationsOpen(false)}><span className="notification-dot" /><div><strong>{item.text}</strong><small>{item.groupName} · {shortDate(item.createdAt)}</small></div></Link>)}</div> : <div className="notification-empty"><Bell size={21} /><strong>اعلان تازه‌ای نیست</strong><span>فعالیت‌های جدید گروه‌ها اینجا نمایش داده می‌شوند.</span></div>}</div>}</div>
            <Link className="topbar-profile-link" to="/profile" aria-label="باز کردن پروفایل"><Avatar user={user} /></Link>
          </div>
        </header>
        <div className="page-content"><Outlet /></div>
      </main>
      <nav className="mobile-nav">
        {links.filter(item => item.mobile !== false).map(item => <NavLink key={item.to} to={item.to} end={item.to === '/'}><item.icon size={19} /><span>{item.to === '/bring-list' ? 'چی بیاره؟' : item.label.split(' ')[0]}</span></NavLink>)}
      </nav>
    </div>
  )
}
