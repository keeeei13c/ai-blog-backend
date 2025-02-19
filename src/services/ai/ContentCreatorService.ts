import { ContentResult, contentResultSchema, PlanningResult } from "../../types/ai";
import { OpenAICompletionResponse } from "../../types/openai";
import { OpenAIService } from "../openai";
import { z } from "zod";

export class ContentCreatorService {
  private openaiService: OpenAIService;
  private readonly MAX_TOKENS = 3500; // 約4000文字相当

  constructor(apiKey: string) {
    this.openaiService = new OpenAIService(apiKey);
  }

  async create(planningData: PlanningResult): Promise<OpenAICompletionResponse<ContentResult>> {
    try {
      const prompt = this.buildPrompt(planningData);
      const result = await this.openaiService.createCompletion(prompt, {
        max_tokens: this.MAX_TOKENS,
        temperature: 0.7
      });
      
      if (!result.success || !result.data) {
        return { success: false, error: result.error || "No data received" };
      }

      const parsedData = contentResultSchema.parse(JSON.parse(result.data));
      
      return {
        success: true,
        data: parsedData,
        usage: result.usage
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          success: false,
          error: "Invalid content format"
        };
      }
      return {
        success: false,
        error: "Content creation failed"
      };
    }
  }

  private buildPrompt(planningData: PlanningResult): string {
    return `あなたは専門的なコンテンツライターです。
以下の企画に基づいて、約4000文字のSEO最適化された記事を作成してください：

${JSON.stringify(planningData, null, 2)}

必須要件：
1. 構造と見出し
- 明確な階層構造（H2、H3、H4）
- スキャナブルな文章構造
- 適切な段落分け

2. SEO最適化
- キーワードの自然な配置
- 適切な内部リンク提案
- Featured Snippetを意識した構造

3. コンテンツ品質
- E-E-A-T原則の遵守
- 具体的な例示と数値
- 信頼できる情報源の引用

JSON形式で以下の構造で出力してください：
{
  "content": "Markdown形式の記事本文",
  "metadata": {
    "title": "60文字以内のSEOタイトル",
    "description": "120-160文字のメタディスクリプション",
    "keywords": ["キーワード配列"],
    "readTime": "推定読了時間"
  }
}`;
  }
}