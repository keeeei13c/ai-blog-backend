import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { cors } from 'hono/cors'
import type { Bindings } from './types/bindings'
import { itemsController } from './controllers/items'
import { AIController } from './controllers/openai'
import { articlesController } from './controllers/articles'  // 追加

const app = new Hono<{ Bindings: Bindings }>()

// ミドルウェアの設定
app.use('*', logger())
app.use('*', cors())

app.get('/', (c) => {
  return c.json({
    message: 'Welcome to Hono API'
  })
})

// アイテムのルート
app.get('/api/items', itemsController.getAll)
app.post('/api/items', itemsController.create)
app.get('/api/items/:id', itemsController.getOne)
app.put('/api/items/:id', itemsController.update)
app.delete('/api/items/:id', itemsController.delete)

// 記事のルート
app.get('/api/articles', articlesController.getAll)
app.get('/api/articles/:slug', articlesController.getBySlug)
app.post('/api/articles', articlesController.create)
app.get('/api/articles/related/:id', articlesController.getRelated)

// AIのルート
app.post('/api/ai/generate', async (c) => {
  const controller = new AIController(c.env.OPENAI_API_KEY)
  return controller.generate(c)
})

export default app