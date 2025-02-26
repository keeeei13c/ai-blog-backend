import { OpenAIService } from "../openai";
import { z } from "zod";
import { OpenAICompletionResponse } from "../../types/openai";

// 統合された結果の型定義
export const articleGenerationResultSchema = z.object({
  content: z.string(),
  metadata: z.object({
    title: z.string(),
    description: z.string(),
    keywords: z.array(z.string()),
    readTime: z.string(),
    imagePrompt: z.string().optional() // optionalに変更
  })
});

export type ArticleGenerationResult = z.infer<typeof articleGenerationResultSchema>;

export class ArticleGenerationService {
  private openaiService: OpenAIService;

  constructor(apiKey: string) {
    this.openaiService = new OpenAIService(apiKey, "gpt-4o-mini");
  }

  async generateArticle(topic?: string): Promise<OpenAICompletionResponse<ArticleGenerationResult>> {
    try {
      const prompt = this.buildPrompt(topic);
      const result = await this.openaiService.createCompletion(prompt, {
        temperature: 0.7,
        max_tokens: 3500,
        response_format: { type: "json_object" }
      });

      if (!result.success || !result.data) {
        return { 
          success: false, 
          error: result.error || "No data received" 
        };
      }

      let parsedData = articleGenerationResultSchema.parse(JSON.parse(result.data));

      // **Unsplash用のキーワードを最適化**
      parsedData.metadata.keywords = this.optimizeImageKeywords(parsedData.metadata.keywords, topic);
      
      return {
        success: true,
        data: parsedData,
        usage: result.usage
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          success: false,
          error: "Invalid generation result format"
        };
      }
      return {
        success: false,
        error: "Article generation failed"
      };
    }
  }

  private buildPrompt(topic?: string): string {
    return `あなたは専門的なコンテンツライターです。
以下のトピックに基づいて、SEO最適化された記事と関連メタデータを生成してください。

${topic ? `トピック: ${topic}` : '現在のトレンドに基づいて適切なトピックを選択してください。'}

以下の要件を満たす記事を生成してください：

1. 記事の構造
- 明確な階層構造（H2、H3）を持つMarkdown形式
- スキャンしやすい文章構造
- 適切な段落分け
- 約2000-4000文字の長さ

2. SEO最適化
- メインキーワードの自然な配置
- Featured Snippetを意識した構造
- メタディスクリプションの最適化

3. コンテンツ品質
- 具体的な例示と実用的な情報
- 読者の課題解決に焦点を当てた内容
- 信頼性の高い情報提供

4. 画像の説明（Unsplash検索用）
- 記事の内容を表す画像を選ぶための説明を生成してください
- **"imagePrompt"** の値として設定してください（英語で記述）

JSON形式で以下の構造で出力してください：
{
  "content": "Markdown形式の記事本文",
  "metadata": {
    "title": "60文字以内のSEOタイトル",
    "description": "120-160文字のメタディスクリプション",
    "keywords": ["メインキーワード", "関連キーワード"],
    "readTime": "推定読了時間（例：'5 minutes'）",
    "imagePrompt": "記事のメイン画像のための説明文"
  }
}`;
  }

  /**
   * **Unsplash用のキーワード最適化**
   * - `imagePrompt` がある場合は `keywords` を補強
   * - `keywords` が不足している場合は自動補完
   */
  private optimizeImageKeywords(keywords: string[], topic?: string): string[] {
    const enhancedKeywords = new Set(keywords.map(k => k.toLowerCase()));

    // トピックを追加（被りを防ぐ）
    if (topic) {
      enhancedKeywords.add(topic.toLowerCase());
    }

    // **ジャンルごとのキーワード補強**
    const categoryKeywords: Record<string, string[]> = {
      "food": ["Food", "Recipe", "Delicious", "Cooking", "Cuisine", "Gourmet", "Healthy Food", "Street Food"],
      "technology": ["Technology", "Coding", "Software Development", "AI", "Machine Learning", "Cybersecurity", "Blockchain"],
      "business": ["Business", "Finance", "Startup", "Entrepreneur", "Corporate", "Marketing", "Leadership"],
      "travel": ["Travel", "Adventure", "Tourism", "Nature", "Hiking", "Beaches", "Mountains", "Cultural Travel"],
      "health": ["Health", "Wellness", "Fitness", "Nutrition", "Mental Health", "Yoga", "Gym", "Healthy Lifestyle"],
      "education": ["Education", "Learning", "School", "University", "E-learning", "Books", "Study", "Online Courses"],
      "sports": ["Sports", "Athletics", "Football", "Basketball", "Tennis", "Running", "Cycling", "Extreme Sports"],
      "fashion": ["Fashion", "Style", "Trendy", "Clothing", "Luxury", "Streetwear", "Designer", "Accessories"],
      "music": ["Music", "Concert", "Live Performance", "Instruments", "Rock", "Pop", "Jazz", "Classical Music"],
      "art": ["Art", "Painting", "Sculpture", "Exhibition", "Illustration", "Graffiti", "Museum", "Creative"],
      "photography": ["Photography", "Portrait", "Landscape", "Street Photography", "Aerial", "Studio", "Black and White"],
      "science": ["Science", "Physics", "Biology", "Chemistry", "Astronomy", "Genetics", "Research", "Laboratory"],
      "history": ["History", "Ancient", "Medieval", "Modern", "World War", "Cultural Heritage", "Historical Sites"],
      "architecture": ["Architecture", "Buildings", "Urban Design", "Skyscrapers", "Bridges", "Interior Design"],
      "automobile": ["Car", "Automobile", "Motorcycle", "Sports Car", "Electric Vehicle", "Vintage Cars"],
      "space": ["Space", "Astronomy", "Planets", "NASA", "Galaxy", "Rocket", "Aliens", "Moon"],
      "gaming": ["Gaming", "Video Games", "Esports", "PC Gaming", "Console Gaming", "Retro Games", "VR", "RPG"],
      "finance": ["Finance", "Investment", "Stock Market", "Cryptocurrency", "Banking", "Wealth", "Economy"],
      "environment": ["Environment", "Sustainability", "Climate Change", "Recycling", "Nature Conservation"],
      "pets": ["Pets", "Dogs", "Cats", "Birds", "Exotic Pets", "Pet Care", "Veterinary"],
      "parenting": ["Parenting", "Children", "Babies", "Family", "Motherhood", "Fatherhood"],
      "home": ["Home", "Interior Design", "Furniture", "Decor", "Smart Home", "DIY Home Improvement"],
      "fitness": ["Fitness", "Workout", "Gym", "Personal Training", "Strength Training", "Cardio"],
      "mindfulness": ["Mindfulness", "Meditation", "Self-Care", "Happiness", "Inner Peace"],
      "books": ["Books", "Reading", "Library", "Literature", "Bookstore", "Writing"],
      "cinema": ["Cinema", "Movies", "Film Industry", "Hollywood", "Independent Film"],
      "relationships": ["Relationships", "Dating", "Love", "Marriage", "Friendship", "Family Bonds"],
      "psychology": ["Psychology", "Human Mind", "Mental Health", "Behavioral Science", "Self-Improvement"],
      "food and drinks": ["Food", "Drinks", "Beverage", "Cocktails", "Coffee", "Tea", "Wine"],
      "DIY": ["DIY", "Crafts", "Handmade", "Woodworking", "Painting", "Repairs"],
      "law": ["Law", "Legal", "Justice", "Courts", "Lawyers", "Criminal Law"],
      "military": ["Military", "Defense", "Army", "Navy", "Air Force", "Weapons"],
      "aviation": ["Aviation", "Airplanes", "Pilots", "Airports", "Flying"],
      "urban life": ["Urban", "City Life", "Street Culture", "Public Transport", "Nightlife"],
      "festivals": ["Festivals", "Celebrations", "Carnivals", "Music Festivals", "Cultural Events"],
      "hiking": ["Hiking", "Mountains", "Trails", "Outdoor Adventure", "Camping"],
      "weddings": ["Weddings", "Bride", "Groom", "Ceremony", "Marriage", "Celebration"],
      "gardening": ["Gardening", "Plants", "Flowers", "Landscaping", "Greenhouse"],
      "extreme sports": ["Extreme Sports", "Skydiving", "Snowboarding", "BMX", "Surfing"],
      "luxury": ["Luxury", "Expensive", "High-End", "Fashion", "Lifestyle"],
      "startup": ["Startup", "Entrepreneurship", "Innovation", "Business Growth"],
      "urban planning": ["Urban Planning", "City Design", "Infrastructure", "Smart Cities"],
      "cosplay": ["Cosplay", "Anime", "Costumes", "Comic Con", "Fantasy"],
      "mythology": ["Mythology", "Legends", "Folklore", "Myths", "Gods"],
      "subcultures": ["Subcultures", "Punk", "Gothic", "Hip-Hop", "Alternative"],
      "artificial intelligence": ["Artificial Intelligence", "Machine Learning", "Deep Learning", "AI Ethics"],
      "cybersecurity": ["Cybersecurity", "Hacking", "Online Security", "Data Privacy"],
      "philosophy": ["Philosophy", "Ethics", "Existentialism", "Logic", "Wisdom"]
    };    

    // **トピックに応じたキーワードを追加**
    for (const [category, words] of Object.entries(categoryKeywords)) {
      if (keywords.some(k => category.includes(k.toLowerCase()))) {
        words.forEach(w => enhancedKeywords.add(w));
      }
    }

    // **フォールバック**
    if (enhancedKeywords.size < 3) {
      enhancedKeywords.add("Photography");
      enhancedKeywords.add("Stock Image");
    }

    return Array.from(enhancedKeywords);
  }
}
