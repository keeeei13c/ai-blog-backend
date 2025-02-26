import { Bindings } from '../types/bindings';
import { ArticleGenerationService } from '../services/ai/ArticleGenerationService';
import { generateRandomSlug } from '../utils/generate-slug';
import { UnsplashService } from '../services/image/unsplash';

export class CronController {
  constructor(private readonly env: Bindings) {}

  async generateDailyArticle(): Promise<void> {
    try {
      console.log('Starting daily article generation at:', new Date().toISOString());
      
      // トピックリストから1つランダムに選択
      const topics = [
        'Web Development',
        'Artificial Intelligence',
        'Cloud Computing',
        'Cybersecurity',
        'Mobile App Development',
        'Data Science',
        'DevOps',
        'Blockchain',
        'Internet of Things',
        'Machine Learning'
      ];
      
      const topic = topics[Math.floor(Math.random() * topics.length)];
      
      // 以下はarticles.tsのcreateメソッドの中身をそのまま持ってきたもの
      const generator = new ArticleGenerationService(this.env.OPENAI_API_KEY);
      const generationResult = await generator.generateArticle(topic);
      const unsplashService = new UnsplashService();
      const slug = generateRandomSlug();
      
      if (!generationResult.success || !generationResult.data) {
        console.error('Article generation failed:', generationResult.error);
        return;
      }

      // 画像検索用のキーワードを準備
      const searchKeywords = [
        ...generationResult.data.metadata.keywords,
        ...generationResult.data.metadata.imagePrompt || [],
        topic,
      ];

      // Unsplash画像の取得
      const imageUrl = await unsplashService.getImage([
        searchKeywords.join(', '),
        topic
      ]);

      const articleData = {
        title: generationResult.data.metadata.title,
        slug: slug,
        content: generationResult.data.content,
        image: imageUrl,
        image_alt: generationResult.data.metadata.title,
        category: topic || "Technology",
        keywords: generationResult.data.metadata.keywords.join(','),
        read_time: generationResult.data.metadata.readTime,
        meta_description: generationResult.data.metadata.description,
        status: 'published',
        date: new Date().toISOString().split('T')[0],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const result = await this.env.DB.prepare(`
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
      .run();

      console.log('Article created successfully:', articleData.title);
      
    } catch (error) {
      console.error('Article Generation Error:', error);
    }
  }
}