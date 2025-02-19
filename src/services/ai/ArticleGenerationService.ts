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
    imagePrompt: z.string()
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

      const parsedData = articleGenerationResultSchema.parse(JSON.parse(result.data));
      
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
}