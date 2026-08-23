import { ArrowUpRight, ReceiptText, UsersRound } from 'lucide-react'
import { Link } from 'react-router-dom'
import { assetUrl } from '../services/api.js'
import { money } from '../utils/format.js'

const covers = ['cover-purple', 'cover-blue', 'cover-peach', 'cover-lilac']

export default function GroupCard({ group, index }) {
  return (
    <Link className="group-card" to={`/groups/${group.id}`}>
      <div className={`group-cover ${covers[index % covers.length]}`} style={group.profilePicture ? { backgroundImage: `url(${assetUrl(group.profilePicture)})` } : {}}>
        <span className="currency-tag">{group.currency === 'IRT' || group.currency === 'IRR' ? 'تومان' : group.currency}</span>
        <span className="group-arrow"><ArrowUpRight size={18} /></span>
      </div>
      <div className="group-card-body">
        <h3>{group.name}</h3>
        <div className="group-meta"><span><UsersRound size={15} />{group.memberCount} عضو</span><span><ReceiptText size={15} />{group.expenseCount} هزینه</span></div>
        <div className="group-balance"><span>مانده شما</span><strong className={group.balance >= 0 ? 'positive' : 'negative'}>{group.balance >= 0 ? '+' : ''}{money(group.balance, group.currency)}</strong></div>
      </div>
    </Link>
  )
}
