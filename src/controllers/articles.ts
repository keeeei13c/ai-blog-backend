import { Context } from 'hono'
import { Bindings } from '../types/bindings'
import { Article, RelatedArticle } from '../types/article';

export const articlesController = {
  // 記事一覧取得
  getAll: async (c: Context<{ Bindings: Bindings }>) => {
    try {
      const articles = await c.env.DB.prepare(
        'SELECT * FROM articles ORDER BY created_at DESC'
      ).all();

      return c.json({
        success: true,
        data: articles
      })
    } catch (error) {
      console.error('DB Error:', error)
      return c.json({
        success: false,
        message: 'Failed to fetch articles'
      }, 500)
    }
  },

  // 記事詳細取得
  getBySlug: async (c: Context<{ Bindings: Bindings }>) => {
    try {
      const { slug } = c.req.param()
      const article = await c.env.DB.prepare(
        'SELECT * FROM articles WHERE slug = ?'
      )
      .bind(slug)
      .first<Article>();

      if (!article) {
        return c.json({
          success: false,
          message: 'Article not found'
        }, 404)
      }

      return c.json({
        success: true,
        data: article
      })
    } catch (error) {
      console.error('DB Error:', error)
      return c.json({
        success: false,
        message: 'Failed to fetch article'
      }, 500)
    }
  },

  // 記事作成（AI生成）
  create: async (c: Context<{ Bindings: Bindings }>) => {
    try {
      const body = await c.req.json()
      
      // TODO: AIによる記事生成ロジック

      const result = await c.env.DB.prepare(`
        INSERT INTO articles (title, content, image, category, read_time, date)
        VALUES (?, ?, ?, ?, ?, ?)
      `)
      .bind(
        body.title,
        body.content,
        body.image,
        body.category,
        body.readTime,
        body.date
      )
      .run()

      return c.json({
        success: true,
        message: 'Article created successfully',
        data: { id: result.meta.last_row_id }
      }, 201)
    } catch (error) {
      console.error('DB Error:', error)
      return c.json({
        success: false,
        message: 'Failed to create article'
      }, 500)
    }
  },

  // 関連記事取得
  getRelated: async (c: Context<{ Bindings: Bindings }>) => {
    try {
      const { id } = c.req.param()
      const relatedArticles = await c.env.DB.prepare(`
        SELECT a.id, a.title, a.category
        FROM articles a
        INNER JOIN related_articles ra ON a.id = ra.related_article_id
        WHERE ra.article_id = ?
      `)
      .bind(id)
      .all<RelatedArticle>();

      return c.json({
        success: true,
        data: relatedArticles
      })
    } catch (error) {
      console.error('DB Error:', error)
      return c.json({
        success: false,
        message: 'Failed to fetch related articles'
      }, 500)
    }
  }
}