import multer from 'multer'
import path from 'node:path'
import { makeId } from '../utils/id.js'

const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, done) => done(null, `${makeId()}${path.extname(file.originalname).toLowerCase()}`)
})

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, done) => done(null, file.mimetype.startsWith('image/'))
})

