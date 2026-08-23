import assert from 'node:assert/strict'
import test from 'node:test'

process.env.SUPABASE_URL = 'https://example.supabase.co'
process.env.SUPABASE_SECRET_KEY = 'test-secret'

const requests = []
global.fetch = async (url, options = {}) => {
  requests.push({ url, options })
  if (options.method === 'POST') return new Response('{}', { status: 200 })
  if (url.includes('/storage/v1/bucket/')) return new Response('{}', { status: 404 })
  if (url.endsWith('/storage/v1/object/fairshare-data/db.json')) {
    return new Response(JSON.stringify({ users: [] }), { status: 200, headers: { 'Content-Type': 'application/json' } })
  }
  return new Response('{}', { status: 200 })
}

const storage = await import('../src/services/supabaseStorage.js')

test('Supabase storage creates buckets and persists JSON and images', async () => {
  assert.equal(storage.isSupabaseConfigured(), true)
  await storage.ensureRemoteStorage()
  await storage.uploadDatabase({ users: [] })
  const database = await storage.downloadDatabase()
  const imageUrl = await storage.uploadPublicImage({
    originalname: 'receipt.png',
    mimetype: 'image/png',
    buffer: Buffer.from('image')
  })

  assert.deepEqual(database, { users: [] })
  assert.match(imageUrl, /^https:\/\/example\.supabase\.co\/storage\/v1\/object\/public\/fairshare-uploads\//)
  assert.equal(requests.filter(item => item.options.method === 'POST' && item.url.endsWith('/storage/v1/bucket')).length, 4)
  assert.ok(requests.some(item => item.url.endsWith('/fairshare-data/db.json') && item.options.headers?.['x-upsert'] === 'true'))
  assert.ok(requests.every(item => item.options.headers?.Authorization === 'Bearer test-secret'))
})
