import { ArrowLeft, CheckCircle2, History } from 'lucide-react'
import { Link } from 'react-router-dom'
import Avatar from '../components/Avatar.jsx'
import EmptyState from '../components/EmptyState.jsx'
import { useApi } from '../hooks/useApi.js'
import { api } from '../services/api.js'
import { money, shortDate } from '../utils/format.js'

export default function SettlementsPage() {
  const { data, loading, error } = useApi(() => api.get('/settlements'), [])
  const settlements = data?.settlements || []
  const groupCount = new Set(settlements.map(item => item.groupId)).size

  return (
    <div className="settlements-page">
      <section className="settlements-hero"><div><p className="eyebrow light">سوابق مالی شما</p><h2>همهٔ تسویه‌ها یک‌جا</h2><p>پرداخت‌های تمام گروه‌ها را ببین و برای بررسی یا ویرایش وارد همان گروه شو.</p></div><span><History size={30} /></span></section>
      <section className="surface settlements-all-card">
        <div className="section-heading compact"><div><p className="eyebrow">تاریخچه کامل</p><h2>پرداخت‌ها</h2><p>{settlements.length} پرداخت در {groupCount} گروه</p></div><span className="count-badge">{settlements.length}</span></div>
        {error && <div className="form-error">{error}</div>}
        {loading ? <div className="settlements-loading"><span /><span /><span /></div> : settlements.length ? <div className="settlements-global-list">{settlements.map(item => <Link to={`/groups/${item.groupId}?tab=settlements`} key={item.id}><span className="global-settlement-check"><CheckCircle2 size={18} /></span><div className="global-settlement-copy"><strong>{item.payer.name} به {item.receiver.name} پرداخت کرد</strong><span>{item.group.name} · {item.note || 'پرداخت بدهی'} · {shortDate(item.settlementDate)}</span></div><div className="global-settlement-people"><Avatar user={item.payer} size="small" /><Avatar user={item.receiver} size="small" /></div><b>{money(item.amount, item.group.currency)}</b><ArrowLeft size={16} /></Link>)}</div> : !error && <EmptyState icon={<History size={23} />} title="هنوز تسویه‌ای نداری" text="وقتی در یکی از گروه‌ها پرداختی ثبت شود، تاریخچه آن اینجا نمایش داده می‌شود." />}
      </section>
    </div>
  )
}
