export function toCents(value) {
  const amount = Number(value)
  if (!Number.isFinite(amount)) return NaN
  return Math.round((amount + Number.EPSILON) * 100)
}

export function fromCents(value) {
  return value / 100
}

