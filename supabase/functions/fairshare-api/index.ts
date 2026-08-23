import express from 'express'
import app from '../../../backend/src/app.js'

const edgeApp = express()
edgeApp.use('/fairshare-api', app)
edgeApp.use(app)
edgeApp.listen(8000)
