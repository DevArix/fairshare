import { assetUrl } from '../services/api.js'
import { initials } from '../utils/format.js'

const colors = ['#DFF7B5', '#FFE7A7', '#D6E6FF', '#FFD8D1', '#E8D9FF']

export default function Avatar({ user, size = 'medium' }) {
  const color = colors[(user?.name?.length || 0) % colors.length]
  if (user?.profilePicture) return <img className={`avatar ${size}`} src={assetUrl(user.profilePicture)} alt={user.name} />
  return <span className={`avatar ${size}`} style={{ backgroundColor: color }}>{initials(user?.name || '?')}</span>
}

