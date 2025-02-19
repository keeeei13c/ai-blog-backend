import { Hono } from 'hono'
import { Bindings } from '../types/bindings'
import { articlesController } from '../controllers/articles'

const app = new Hono<{ Bindings: Bindings }>()

// 記事関連のルーティング
app.get('/', articlesController.getAll)
app.get('/:slug', articlesController.getBySlug)
app.post('/', articlesController.create)
app.get('/related/:id', articlesController.getRelated)

export default app