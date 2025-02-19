import { Context } from 'hono'
import { Bindings } from '../types/bindings'
import { Article, RelatedArticle } from '../types/article';
import { ArticleGenerationService } from '../services/ai/ArticleGenerationService';
import { generateSlug } from '../utils/generate-slug';

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
        const { topic } = await c.req.json()
        
        const generator = new ArticleGenerationService(c.env.OPENAI_API_KEY)
        const generationResult = await generator.generateArticle(topic)
        
        if (!generationResult.success || !generationResult.data) {
          return c.json({
            success: false,
            message: 'Article generation failed',
            error: generationResult.error
          }, 500)
        }
  
        const articleData = {
          title: generationResult.data.metadata.title,
          slug: generateSlug(generationResult.data.metadata.title),
          content: generationResult.data.content,
          image: "https://placehold.co/600x400", // 静的なダミー画像
          category: topic || "Technology", // デフォルトカテゴリ
          keywords: generationResult.data.metadata.keywords.join(','),
          read_time: generationResult.data.metadata.readTime,
          meta_description: generationResult.data.metadata.description,
          status: 'published',
          date: new Date().toISOString().split('T')[0], // YYYY-MM-DD形式
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
  
        const result = await c.env.DB.prepare(`
          INSERT INTO articles (
            title, slug, content, image, category, keywords,
            read_time, meta_description, status, date, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `)
        .bind(
          articleData.title,
          articleData.slug,
          articleData.content,
          articleData.image,
          articleData.category,
          articleData.keywords,
          articleData.read_time,
          articleData.meta_description,
          articleData.status,
          articleData.date,
          articleData.created_at,
          articleData.updated_at
        )
        .run()
  
        return c.json({
          success: true,
          message: 'Article created successfully',
          data: {
            id: result.meta.last_row_id,
            article: articleData,
            token_usage: generationResult.usage
          }
        }, 201)
      } catch (error) {
        console.error('Article Generation Error:', error)
        return c.json({
          success: false,
          message: 'Failed to generate and create article',
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
