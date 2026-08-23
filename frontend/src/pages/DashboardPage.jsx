import { ArrowRight, ArrowUpRight, Clock3, Plus, Scale, Sparkles, WalletCards } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import EmptyState from '../components/EmptyState.jsx'
import GroupCard from '../components/GroupCard.jsx'
import Modal from '../components/Modal.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useApi } from '../hooks/useApi.js'
import { api } from '../services/api.js'
import { money, shortDate } from '../utils/format.js'

export default function DashboardPage() {
  const { user } = useAuth()
  const { data, loading, error } = useApi(() => api.get('/groups'), [])
  const [balanceList, setBalanceList] = useState(null)
  const summary = data?.summaries?.[0] || { currency: 'IRT', owe: 0, owed: 0, net: 0 }
  const today = new Intl.DateTimeFormat('fa-IR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }).format(new Date())
  const currencyGroups = (data?.groups || []).filter(group => group.currency === summary.currency)
  const debts = currencyGroups.filter(group => group.balance < 0)
  const claims = currencyGroups.filter(group => group.balance > 0)
  const list = balanceList === 'debt' ? debts : claims

  return (
    <div className="dashboard-page">
      <section className="welcome-row">
        <div><p className="eyebrow">{today}</p><h2>{user.name.split(' ')[0]}، خوش آمدی.</h2><p>اینجا وضعیت هزینه‌های مشترکت را یک‌جا می‌بینی.</p></div>
        <Link className="primary-button" to="/groups/new"><Plus size={18} />ساخت گروه</Link>
      </section>
      {error && <div className="form-error">{error}</div>}
      <section className="summary-grid">
        <article className="summary-card dark"><div className="summary-icon"><Scale size={19} /></div><span>مانده خالص</span><strong>{summary.net >= 0 ? '+' : ''}{money(summary.net, summary.currency)}</strong><p>{summary.net >= 0 ? 'در مجموع طلبکار هستی' : 'کمی بدهی برای تسویه داری'}</p><Sparkles className="card-spark" size={65} /></article>
        <article className="summary-card"><button className="summary-icon warm summary-action" onClick={() => setBalanceList('claim')} aria-label="نمایش فهرست طلب‌ها"><ArrowUpRight size={19} /></button><span>طلب شما</span><strong className="positive">{money(summary.owed, summary.currency)}</strong><p>برای دیدن جزئیات روی آیکن بزن</p></article>
        <article className="summary-card"><button className="summary-icon soft summary-action" onClick={() => setBalanceList('debt')} aria-label="نمایش فهرست بدهی‌ها"><WalletCards size={19} /></button><span>بدهی شما</span><strong>{money(summary.owe, summary.currency)}</strong><p>برای دیدن جزئیات روی آیکن بزن</p></article>
      </section>
      {data?.summaries?.length > 1 && <p className="currency-note">مانده هر ارز جدا محاسبه می‌شود. برای جزئیات دقیق، گروه را باز کن.</p>}
      <section className="section-block">
        <div className="section-heading"><div><p className="eyebrow">فضاهای شما</p><h2>گروه‌ها</h2></div>{data?.groups?.length > 0 && <Link to="/groups/new">گروه جدید <ArrowRight size={16} /></Link>}</div>
        {loading ? <div className="card-skeletons"><span /><span /><span /></div> : data?.groups?.length ? <div className="group-grid">{data.groups.map((group, index) => <GroupCard key={group.id} group={group} index={index} />)}</div> : <EmptyState icon={<Plus size={24} />} title="اولین گروهت را بساز" text="دوستانت را دور هم جمع کن، هزینه‌ها را ثبت کن و محاسبات را به فیرشِر بسپار." action={<Link className="secondary-button" to="/groups/new">ساخت گروه</Link>} />}
      </section>
      <section className="activity-panel">
        <div className="section-heading compact"><div><p className="eyebrow">آخرین تغییرات</p><h2>فعالیت‌های اخیر</h2></div><Clock3 size={20} /></div>
        {data?.activities?.length ? <div className="activity-list">{data.activities.map(item => <div className="activity-item" key={item.id}><span className="activity-dot" /><div><p>{item.text}</p><span>{item.groupName} · {shortDate(item.createdAt)}</span></div></div>)}</div> : <p className="muted-copy">فعالیت‌های گروه‌هایت اینجا نمایش داده می‌شود.</p>}
      </section>
      {balanceList && <Modal title={balanceList === 'debt' ? 'فهرست بدهی‌های شما' : 'فهرست طلب‌های شما'} eyebrow={`جزئیات ${summary.currency === 'IRT' || summary.currency === 'IRR' ? 'تومان' : summary.currency}`} onClose={() => setBalanceList(null)}>{list.length ? <div className="dashboard-balance-list">{list.map(group => <Link to={`/groups/${group.id}`} key={group.id} onClick={() => setBalanceList(null)}><span className={`dashboard-balance-icon ${balanceList}`}><WalletCards size={18} /></span><div><strong>{group.name}</strong><span>{group.expenseCount} هزینه · {group.memberCount} عضو</span></div><b className={balanceList === 'claim' ? 'positive' : 'negative'}>{money(Math.abs(group.balance), group.currency)}</b><ArrowRight size={16} /></Link>)}</div> : <div className="dashboard-balance-empty"><span className={balanceList}><WalletCards size={25} /></span><h3>{balanceList === 'debt' ? 'بدهیات صاف شده' : 'خیالت راحت شد؟'}</h3><p>{balanceList === 'debt' ? 'در حال حاضر بدهی تسویه‌نشده‌ای نداری.' : 'در حال حاضر طلب تسویه‌نشده‌ای نداری.'}</p></div>}</Modal>}
    </div>
  )
}
