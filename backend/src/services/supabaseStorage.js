import path from 'node:path'
import { makeId } from '../utils/id.js'

const supabaseUrl = (process.env.SUPABASE_URL || '').replace(/\/$/, '')
const supabaseKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const dataBucket = process.env.SUPABASE_DATA_BUCKET || 'fairshare-data'
const uploadsBucket = process.env.SUPABASE_UPLOADS_BUCKET || 'fairshare-uploads'

export function isSupabaseConfigured() {
  return Boolean(supabaseUrl && supabaseKey)
}

function authHeaders(extra = {}) {
  const headers = { apikey: supabaseKey }
  if (!supabaseKey.startsWith('sb_secret_')) headers.Authorization = `Bearer ${supabaseKey}`
  return { ...headers, ...extra }
}

async function storageRequest(resource, options = {}) {
  const response = await fetch(`${supabaseUrl}/storage/v1${resource}`, {
    ...options,
    headers: authHeaders(options.headers)
  })
  if (!response.ok) {
    const detail = await response.text().catch(() => '')
    throw new Error(`Supabase Storage: ${response.status}${detail ? ` ${detail}` : ''}`)
  }
  return response
}

async function ensureBucket(id, isPublic) {
  const current = await fetch(`${supabaseUrl}/storage/v1/bucket/${id}`, { headers: authHeaders() })
  if (current.ok) return
  if (current.status !== 404 && current.status !== 400) {
    const detail = await current.text().catch(() => '')
    throw new Error(`Supabase Storage: ${current.status}${detail ? ` ${detail}` : ''}`)
  }
  await storageRequest('/bucket', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, name: id, public: isPublic, file_size_limit: (isPublic ? 5 : 50) * 1024 * 1024 })
  })
}

export async function ensureRemoteStorage() {
  if (!isSupabaseConfigured()) return
  await Promise.all([
    ensureBucket(dataBucket, false),
    ensureBucket(uploadsBucket, true)
  ])
}

export async function downloadDatabase() {
  const response = await fetch(`${supabaseUrl}/storage/v1/object/${dataBucket}/db.json`, { headers: authHeaders() })
  if (response.status === 404 || response.status === 400) return null
  if (!response.ok) {
    const detail = await response.text().catch(() => '')
    throw new Error(`Supabase Storage: ${response.status}${detail ? ` ${detail}` : ''}`)
  }
  return response.json()
}

export async function uploadDatabase(data) {
  await storageRequest(`/object/${dataBucket}/db.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-upsert': 'true'
    },
    body: JSON.stringify(data)
  })
}

export async function uploadPublicImage(file) {
  await ensureRemoteStorage()
  const extension = path.extname(file.originalname).toLowerCase()
  const objectName = `${makeId()}${extension}`
  await storageRequest(`/object/${uploadsBucket}/${objectName}`, {
    method: 'POST',
    headers: {
      'Content-Type': file.mimetype,
      'x-upsert': 'false'
    },
    body: file.buffer
  })
  return `${supabaseUrl}/storage/v1/object/public/${uploadsBucket}/${objectName}`
}
