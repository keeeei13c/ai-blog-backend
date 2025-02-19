import { Hono } from 'hono'
import { Bindings } from '../types/bindings'
import { articlesController } from '../controllers/articles'

// 記事関連のルーティング
const articles = new Hono<{ Bindings: Bindings }>()

articles.get('/', articlesController.getAll)
articles.get('/:slug', articlesController.getBySlug)
articles.post('/', articlesController.create)
articles.get('/related/:id', articlesController.getRelated)

export default articles