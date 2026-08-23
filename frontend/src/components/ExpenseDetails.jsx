import { CalendarDays, Pencil, ReceiptText, Trash2, UsersRound, WalletCards } from 'lucide-react'
import { api, assetUrl } from '../services/api.js'
import { money, shortDate } from '../utils/format.js'
import Avatar from './Avatar.jsx'
import Modal from './Modal.jsx'

export default function ExpenseDetails({ expense, group, onClose, onEdit, onDeleted }) {
  async function remove() {
    if (!window.confirm(`هزینه «${expense.title}» حذف شود؟ مانده‌ها دوباره محاسبه می‌شوند.`)) return
    await api.delete(`/groups/${group.id}/expenses/${expense.id}`)
    onDeleted()
  }

  return (
    <Modal title={expense.title} eyebrow="جزئیات هزینه" onClose={onClose}>
      <div className="expense-detail-amount"><span>{group.currency === 'IRT' || group.currency === 'IRR' ? 'تومان' : group.currency}</span><strong>{money(expense.amount, group.currency)}</strong></div>
      <div className="detail-facts"><div><WalletCards size={17} /><span>پرداخت‌کننده</span><strong>{expense.paidByUser.name}</strong></div><div><CalendarDays size={17} /><span>تاریخ</span><strong>{shortDate(expense.date)}</strong></div><div><UsersRound size={17} /><span>روش تقسیم</span><strong>{{ equal: 'مساوی', custom: 'دستی', percentage: 'درصدی' }[expense.splitType]}</strong></div></div>
      {expense.description && <p className="expense-description">{expense.description}</p>}
      <div className="detail-section"><div className="detail-title"><h3>سهم افراد</h3><span>{expense.shares.length} نفر</span></div><div className="share-list">{expense.shares.map(share => <div key={share.id}><Avatar user={share.user} size="small" /><div><strong>{share.user.name}</strong><small>{share.percentage !== null ? `${share.percentage}٪` : 'سهم نهایی'}</small></div><b>{money(share.amount, group.currency)}</b></div>)}</div></div>
      {expense.receiptImage && <a className="receipt-link" href={assetUrl(expense.receiptImage)} target="_blank" rel="noreferrer"><ReceiptText size={18} />مشاهده تصویر رسید</a>}
      <div className="detail-actions"><button className="secondary-button" onClick={onEdit}><Pencil size={16} />ویرایش هزینه</button><button className="danger-button" onClick={remove}><Trash2 size={16} />حذف</button></div>
    </Modal>
  )
}
