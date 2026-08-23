export function money(value, currency = 'IRT') {
  if (currency === 'IRT' || currency === 'IRR') return `${new Intl.NumberFormat('fa-IR', { maximumFractionDigits: 0 }).format(value || 0)} تومان`
  return new Intl.NumberFormat('fa-IR', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2
  }).format(value || 0)
}

export function shortDate(value) {
  return new Intl.DateTimeFormat('fa-IR', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value))
}

export function initials(name = '') {
  return name.trim().slice(0, 1).toUpperCase()
}
