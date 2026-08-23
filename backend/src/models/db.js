import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const currentFile = fileURLToPath(import.meta.url)
const currentDir = path.dirname(currentFile)
const dbPath = process.env.DB_PATH ? path.resolve(process.env.DB_PATH) : path.join(currentDir, '../../data/db.json')

const emptyDb = {
  users: [],
  friendRequests: [],
  friendships: [],
  friendInvitations: [],
  groups: [],
  groupMembers: [],
  bringItems: [],
  expenses: [],
  expenseShares: [],
  settlements: [],
  activities: [],
  passwordResetTokens: []
}

let queue = Promise.resolve()

export async function ensureDb() {
  try {
    await fs.access(dbPath)
  } catch {
    await fs.mkdir(path.dirname(dbPath), { recursive: true })
    await fs.writeFile(dbPath, JSON.stringify(emptyDb, null, 2))
  }
}

async function loadDb() {
  await ensureDb()
  const value = await fs.readFile(dbPath, 'utf8')
  const data = JSON.parse(value)
  for (const key of Object.keys(emptyDb)) if (!Array.isArray(data[key])) data[key] = []
  return data
}

async function saveDb(data) {
  const tempPath = `${dbPath}.tmp`
  await fs.writeFile(tempPath, JSON.stringify(data, null, 2))
  await fs.rename(tempPath, dbPath)
}

export async function readDb() {
  await queue
  return loadDb()
}

export function writeDb(data) {
  const job = queue.then(() => saveDb(data))
  queue = job.catch(() => {})
  return job
}

export function changeDb(update) {
  const job = queue.then(async () => {
    const data = await loadDb()
    const result = await update(data)
    await saveDb(data)
    return result
  })
  queue = job.then(() => {}, () => {})
  return job
}
