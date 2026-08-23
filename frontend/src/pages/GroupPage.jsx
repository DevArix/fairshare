import { Activity, ArrowLeft, ArrowRight, CalendarDays, ChevronRight, CircleDollarSign, History, Plus, ReceiptText, Scale, Settings2, TrendingUp, UsersRound, WalletCards } from 'lucide-react'
import { useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import Avatar from '../components/Avatar.jsx'
import BalanceModal from '../components/BalanceModal.jsx'
import EmptyState from '../components/EmptyState.jsx'
import ExpenseDetails from '../components/ExpenseDetails.jsx'
import ExpenseForm from '../components/ExpenseForm.jsx'
import ManageGroupModal from '../components/ManageGroupModal.jsx'
import Modal from '../components/Modal.jsx'
import SettlementDetails from '../components/SettlementDetails.jsx'
import StatisticsCard from '../components/StatisticsCard.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useApi } from '../hooks/useApi.js'
import { api, assetUrl } from '../services/api.js'
import { money, shortDate } from '../utils/format.js'

const tabs = [
  { id: 'overview', label: 'نمای کلی', icon: Scale },
  { id: 'expenses', label: 'هزینه‌ها', icon: ReceiptText },
  { id: 'balances', label: 'مانده‌ها', icon: WalletCards },
  { id: 'settlements', label: 'تسویه‌ها', icon: History },
  { id: 'statistics', label: 'آمار', icon: TrendingUp },
  { id: 'activity', label: 'فعالیت‌ها', icon: Activity }
]

export default function GroupPage() {
  const { groupId } = useParams()
  const [searchParams] = useSearchParams()
  const { user } = useAuth()
  const { data, loading, error, refresh } = useApi(() => api.get(`/groups/${groupId}`), [groupId])
  const { data: friendData } = useApi(() => api.get('/friends'), [])
  const [tab, setTab] = useState(searchParams.get('tab') === 'settlements' ? 'settlements' : 'overview')
  const [adding, setAdding] = useState(false)
  const [managing, setManaging] = useState(false)
  const [selectedExpense, setSelectedExpense] = useState(null)
  const [editingExpense, setEditingExpense] = useState(null)
  const [selectedBalance, setSelectedBalance] = useState(null)
  const [selectedSettlement, setSelectedSettlement] = useState(null)

  if (loading) return <div className="group-loading"><span /><span /><span /></div>
  if (error || !data) return <div className="surface error-surface"><h2>گروه در دسترس نیست</h2><p>{error || 'اطلاعات این گروه بارگذاری نشد.'}</p><Link className="secondary-button" to="/"><ArrowLeft size={16} />بازگشت به نمای کلی</Link></div>

  const { group, expenses, balances, settlements, statistics, activities } = data
  const mine = balances.filter(item => item.debtorId === user.id || item.creditorId === user.id)
  const owe = mine.filter(item => item.debtorId === user.id).reduce((sum, item) => sum + item.amount, 0)
  const owed = mine.filter(item => item.creditorId === user.id).reduce((sum, item) => sum + item.amount, 0)
  const net = owed - owe

  function saved() {
    setAdding(false)
    setEditingExpense(null)
    setSelectedExpense(null)
    setSelectedBalance(null)
    setSelectedSettlement(null)
    refresh()
  }

  function expenseRow(expense) {
    return <button className="expense-row" key={expense.id} onClick={() => setSelectedExpense(expense)}><span className="expense-symbol"><ReceiptText size={18} /></span><div><strong>{expense.title}</strong><span>{shortDate(expense.date)} · {expense.shares.length} شریک</span></div><div><strong>{money(expense.amount, group.currency)}</strong><span>پرداخت توسط {expense.paidByUser.name}</span></div><ChevronRight size={17} /></button>
  }

  function balanceRow(balance) {
    const currentOwes = balance.debtorId === user.id
    const currentOwed = balance.creditorId === user.id
    const text = currentOwes ? `شما به ${balance.creditor.name} بدهکارید` : currentOwed ? `${balance.debtor.name} به شما بدهکار است` : `${balance.debtor.name} به ${balance.creditor.name} بدهکار است`
    return <button className="balance-row" key={`${balance.debtorId}-${balance.creditorId}`} onClick={() => setSelectedBalance(balance)}><div className="avatar-pair"><Avatar user={balance.debtor} size="small" /><Avatar user={balance.creditor} size="small" /></div><div><strong>{text}</strong><span>برای دیدن ریز کامل بزن</span></div><b className={currentOwed ? 'positive' : currentOwes ? 'negative' : ''}>{money(balance.amount, group.currency)}</b><ChevronRight size={17} /></button>
  }

  return (
    <div className="group-page">
      <Link className="back-link" to="/"><ArrowLeft size={16} />همه گروه‌ها</Link>
      <section className="group-hero" style={group.profilePicture ? { backgroundImage: `linear-gradient(100deg, rgba(47,23,79,.95), rgba(61,35,95,.72)), url(${assetUrl(group.profilePicture)})` } : {}}>
        <div className="group-hero-main"><span className="group-hero-icon">{group.name.slice(0, 1).toUpperCase()}</span><div><div className="hero-tags"><span>{group.currency === 'IRT' || group.currency === 'IRR' ? 'تومان' : group.currency}</span><span>{group.members.length} عضو</span></div><h1>{group.name}</h1><p>{group.description || 'هزینه‌های مشترک، شفاف برای همه اعضا.'}</p></div></div>
        <div className="group-hero-side"><div className="member-stack">{group.members.slice(0, 5).map(item => <Avatar user={item.user} size="small" key={item.userId} />)}{group.members.length > 5 && <span>+{group.members.length - 5}</span>}</div><button className="hero-manage" onClick={() => setManaging(true)}><Settings2 size={17} />مدیریت</button><button className="hero-add" onClick={() => setAdding(true)}><Plus size={18} />افزودن هزینه</button></div>
      </section>
      <nav className="group-tabs">{tabs.map(item => <button key={item.id} className={tab === item.id ? 'active' : ''} onClick={() => setTab(item.id)}><item.icon size={16} />{item.label}</button>)}</nav>

      {tab === 'overview' && <div className="group-overview">
        <section className="group-summary-cards"><article><span className="summary-icon soft"><WalletCards size={18} /></span><div><small>مانده خالص شما</small><strong className={net >= 0 ? 'positive' : 'negative'}>{net >= 0 ? '+' : ''}{money(net, group.currency)}</strong></div></article><article><span className="summary-icon warm"><ArrowRight size={18} /></span><div><small>طلب شما</small><strong className="positive">{money(owed, group.currency)}</strong></div></article><article><span className="summary-icon pale"><CircleDollarSign size={18} /></span><div><small>بدهی شما</small><strong>{money(owe, group.currency)}</strong></div></article></section>
        <div className="overview-columns"><section className="surface"><div className="section-heading compact"><div><p className="eyebrow">آخرین خرج‌ها</p><h2>هزینه‌های اخیر</h2></div>{expenses.length > 4 && <button onClick={() => setTab('expenses')}>مشاهده همه</button>}</div>{expenses.length ? <div className="expense-list">{expenses.slice(0, 4).map(expenseRow)}</div> : <EmptyState icon={<ReceiptText size={22} />} title="هنوز هزینه‌ای ثبت نشده" text="اولین هزینه گروه را اضافه کن و دقیقاً مشخص کن چه کسانی شریک بوده‌اند." action={<button className="secondary-button" onClick={() => setAdding(true)}>افزودن هزینه</button>} />}</section><section className="surface"><div className="section-heading compact"><div><p className="eyebrow">بین اعضا</p><h2>مانده‌های فعلی</h2></div>{balances.length > 4 && <button onClick={() => setTab('balances')}>مشاهده همه</button>}</div>{balances.length ? <div className="balance-list">{balances.slice(0, 4).map(balanceRow)}</div> : <EmptyState icon={<Scale size={22} />} title="همه تسویه‌اند" text="در این گروه هیچ بدهی بازی وجود ندارد." />}</section></div>
      </div>}

      {tab === 'expenses' && <section className="surface tab-surface"><div className="section-heading"><div><p className="eyebrow">تاریخچه کامل</p><h2>همه هزینه‌ها</h2><p>{expenses.length} هزینه ثبت‌شده</p></div><button className="primary-button" onClick={() => setAdding(true)}><Plus size={17} />افزودن هزینه</button></div>{expenses.length ? <div className="expense-list roomy">{expenses.map(expenseRow)}</div> : <EmptyState icon={<ReceiptText size={22} />} title="تاریخچه هزینه خالی است" text="هزینه‌هایی که اعضا ثبت کنند اینجا نمایش داده می‌شود." />}</section>}

      {tab === 'balances' && <section className="surface tab-surface"><div className="section-heading"><div><p className="eyebrow">محاسبه خودکار</p><h2>مانده اعضا</h2><p>هر مانده را باز کن تا جزئیاتش را ببینی یا پرداخت ثبت کنی.</p></div></div>{balances.length ? <div className="balance-list roomy">{balances.map(balanceRow)}</div> : <EmptyState icon={<Scale size={22} />} title="مانده بازی وجود ندارد" text="همه اعضای این گروه در حال حاضر تسویه‌اند." />}</section>}

      {tab === 'settlements' && <section className="surface tab-surface"><div className="section-heading"><div><p className="eyebrow">سوابق پرداخت</p><h2>تاریخچه تسویه</h2><p>برای دیدن جزئیات یا ویرایش، روی هر پرداخت بزن.</p></div></div>{settlements.length ? <div className="settlement-list">{settlements.map(item => <button className="settlement-row" key={item.id} onClick={() => setSelectedSettlement(item)}><span className="settlement-check">✓</span><div><strong>{item.payer.name} به {item.receiver.name} پرداخت کرد</strong><span>{item.note || 'پرداخت بدهی'} · {shortDate(item.settlementDate)}</span></div><b>{money(item.amount, group.currency)}</b><span className="status-badge">تکمیل‌شده</span></button>)}</div> : <EmptyState icon={<History size={22} />} title="هنوز پرداختی ثبت نشده" text="یک مانده باز را انتخاب کن تا پرداخت یا دریافت را ثبت کنی." />}</section>}

      {tab === 'statistics' && <section className="surface tab-surface"><div className="section-heading"><div><p className="eyebrow">بر پایه هزینه‌های واقعی</p><h2>چه کسی بیشتر پرداخت کرده؟</h2><p>هر بخش نمودار مجموع پرداخت همان عضو را نشان می‌دهد.</p></div></div><StatisticsCard data={statistics} currency={group.currency} /></section>}

      {tab === 'activity' && <section className="surface tab-surface"><div className="section-heading"><div><p className="eyebrow">جدیدترین در بالا</p><h2>فعالیت‌های گروه</h2><p>سوابق تغییرات مهم گروه.</p></div></div>{activities.length ? <div className="group-activity-list">{activities.map(item => <div key={item.id}><span className="activity-mark"><Activity size={15} /></span><Avatar user={item.user} size="small" /><div><strong>{item.text}</strong><span>{shortDate(item.createdAt)}</span></div></div>)}</div> : <EmptyState icon={<Activity size={22} />} title="هنوز فعالیتی نیست" text="رویدادهای گروه از جدید به قدیم اینجا نمایش داده می‌شوند." />}</section>}

      {adding && <Modal title="افزودن هزینه" eyebrow={group.name} onClose={() => setAdding(false)} wide><ExpenseForm group={group} onCancel={() => setAdding(false)} onSaved={saved} /></Modal>}
      {editingExpense && <Modal title="ویرایش هزینه" eyebrow="مانده‌ها دوباره محاسبه می‌شوند" onClose={() => setEditingExpense(null)} wide><ExpenseForm group={group} expense={editingExpense} onCancel={() => setEditingExpense(null)} onSaved={saved} /></Modal>}
      {selectedExpense && <ExpenseDetails expense={selectedExpense} group={group} onClose={() => setSelectedExpense(null)} onEdit={() => { setEditingExpense(selectedExpense); setSelectedExpense(null) }} onDeleted={saved} />}
      {selectedBalance && <BalanceModal balance={selectedBalance} group={group} onClose={() => setSelectedBalance(null)} onSaved={saved} />}
      {selectedSettlement && <SettlementDetails settlement={selectedSettlement} group={group} onClose={() => setSelectedSettlement(null)} onSaved={saved} />}
      {managing && <ManageGroupModal group={group} friends={friendData?.friends || []} onClose={() => setManaging(false)} onSaved={refresh} />}
    </div>
  )
}
