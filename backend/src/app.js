import 'dotenv/config'
import cors from 'cors'
import express from 'express'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import authRoutes from './routes/authRoutes.js'
import userRoutes from './routes/userRoutes.js'
import friendRoutes from './routes/friendRoutes.js'
import groupRoutes from './routes/groupRoutes.js'
import inviteRoutes from './routes/inviteRoutes.js'
import settlementRoutes from './routes/settlementRoutes.js'
import { errorHandler } from './middleware/errorHandler.js'

const app = express()
const currentFile = fileURLToPath(import.meta.url)
const currentDir = path.dirname(currentFile)
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173,http://localhost:4173,http://127.0.0.1:4173').split(',')

app.use(cors({
  origin(origin, done) {
    if (!origin || allowedOrigins.includes(origin)) return done(null, true)
    done(new Error('این نشانی وب اجازه دسترسی ندارد'))
  }
}))
app.use(express.json({ limit: '2mb' }))
app.use('/uploads', express.static(path.join(currentDir, '../uploads')))

app.get('/api/health', (req, res) => res.json({ status: 'ok' }))
app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/friends', friendRoutes)
app.use('/api/groups', groupRoutes)
app.use('/api/settlements', settlementRoutes)
app.use('/api/invitations', inviteRoutes)
app.use(errorHandler)

export default app
