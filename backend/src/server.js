import app from './app.js'
import { ensureDb } from './models/db.js'

const port = process.env.PORT || 4000

await ensureDb()

app.listen(port, () => {
  process.stdout.write(`API فیرشِر روی http://localhost:${port} اجرا شد\n`)
})
