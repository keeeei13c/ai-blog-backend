import { Hono } from 'hono'
import { Bindings } from '../types/bindings'
import itemsRoutes from './items'
import openaiRoutes from './openai'
import { logger } from 'hono/logger'

const app = new Hono<{ Bindings: Bindings }>()


app.use('*', logger())

// ルートの定義
app.get('/', (c) => {
  return c.json({
    message: 'Welcome to Hono API'
  })
})

// 各ルートの集約
app.route('/api/items', itemsRoutes)
app.route('/api/openai', openaiRoutes)

export default app
