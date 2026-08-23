import crypto from 'node:crypto'

export function makeId() {
  return crypto.randomUUID()
}

export function makeCode() {
  return crypto.randomBytes(16).toString('hex')
}

