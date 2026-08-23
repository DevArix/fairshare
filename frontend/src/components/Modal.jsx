import { X } from 'lucide-react'
import { useEffect } from 'react'

export default function Modal({ title, eyebrow, children, onClose, wide = false }) {
  useEffect(() => {
    function close(event) {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', close)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', close)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return (
    <div className="modal-layer" role="presentation" onMouseDown={event => event.target === event.currentTarget && onClose()}>
      <div className={`modal-box ${wide ? 'wide' : ''}`} role="dialog" aria-modal="true" aria-label={title}>
        <div className="modal-head"><div>{eyebrow && <p className="eyebrow">{eyebrow}</p>}<h2>{title}</h2></div><button onClick={onClose} aria-label="بستن"><X size={20} /></button></div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  )
}
