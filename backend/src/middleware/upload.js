import multer from 'multer'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { isSupabaseConfigured, uploadPublicImage } from '../services/supabaseStorage.js'
import { makeId } from '../utils/id.js'

const currentFile = fileURLToPath(import.meta.url)
const currentDir = path.dirname(currentFile)
const uploadsPath = path.join(currentDir, '../../uploads')

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, done) => done(null, file.mimetype.startsWith('image/'))
})

export async function saveUploadedImage(file) {
  if (!file) return null
  if (isSupabaseConfigured()) return uploadPublicImage(file)
  await fs.mkdir(uploadsPath, { recursive: true })
  const filename = `${makeId()}${path.extname(file.originalname).toLowerCase()}`
  await fs.writeFile(path.join(uploadsPath, filename), file.buffer)
  return `/uploads/${filename}`
}

