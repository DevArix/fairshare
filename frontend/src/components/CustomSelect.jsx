import { Check, ChevronDown } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

export default function CustomSelect({ value, onChange, options, disabled = false, placeholder = 'انتخاب کنید', ariaLabel }) {
  const [open, setOpen] = useState(false)
  const box = useRef(null)
  const selected = options.find(option => option.value === value)

  useEffect(() => {
    function close(event) {
      if (!box.current?.contains(event.target)) setOpen(false)
    }
    document.addEventListener('pointerdown', close)
    return () => document.removeEventListener('pointerdown', close)
  }, [])

  useEffect(() => {
    if (disabled) setOpen(false)
  }, [disabled])

  function choose(option) {
    onChange(option.value)
    setOpen(false)
  }

  return (
    <div className={`custom-select ${open ? 'open' : ''}`} ref={box} onKeyDown={event => event.key === 'Escape' && setOpen(false)}>
      <button type="button" className="custom-select-trigger" disabled={disabled} onClick={() => setOpen(!open)} aria-label={ariaLabel} aria-haspopup="listbox" aria-expanded={open}>
        <span className="custom-select-copy"><strong>{selected?.label || placeholder}</strong>{selected?.detail && <small dir="auto">{selected.detail}</small>}</span>
        <ChevronDown size={17} />
      </button>
      {open && <div className="custom-select-menu" role="listbox" aria-label={ariaLabel}>{options.map(option => <button type="button" role="option" aria-selected={option.value === value} className={option.value === value ? 'selected' : ''} key={option.value} onClick={() => choose(option)}><span><strong>{option.label}</strong>{option.detail && <small dir="auto">{option.detail}</small>}</span><i>{option.value === value && <Check size={14} />}</i></button>)}</div>}
    </div>
  )
}
