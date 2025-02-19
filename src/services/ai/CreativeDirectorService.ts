import { OpenAIService } from "../openai";
import { z } from "zod";
import { ContentResult, CreativeResult } from "../../types/ai";
import { OpenAICompletionResponse } from "../../types/openai";
import { creativeResultSchema } from "../../types/ai";

export class CreativeDirectorService {
  private openaiService: OpenAIService;

  constructor(apiKey: string) {
    this.openaiService = new OpenAIService(apiKey);
  }

  async direct(contentData: ContentResult): Promise<OpenAICompletionResponse<CreativeResult>> {
    try {
      const prompt = this.buildPrompt(contentData);
      const result = await this.openaiService.createCompletion(prompt, {
        max_tokens: 1000,
        temperature: 0.8
      });
      
      if (!result.success || !result.data) {
        return { success: false, error: result.error };
      }

      const parsedData = creativeResultSchema.parse(JSON.parse(result.data));
      
      return {
        success: true,
        data: parsedData,
        usage: result.usage
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          success: false,
          error: "Invalid creative format"
        };
      }
      return {
        success: false,
        error: "Creative direction failed"
      };
    }
  }

  private buildPrompt(contentData: ContentResult): string {
    return `あなたは視覚的なストーリーテリングとSEOの専門家です。
以下の記事内容に基づいて、最適な画像生成プロンプトを作成してください：

${JSON.stringify(contentData, null, 2)}

必須要件：
1. ビジュアル戦略
- 記事のトーンや感情との一致
- ブランドの視覚的一貫性
- 注目を集める視覚的要素

2. 最適化
- 検索意図との整合性
- CTR向上のための工夫
- モバイルでの表示最適化

3. アクセシビリティ
- 意味のあるalt属性
- コントラストとカラーパレット
- スクリーンリーダー対応

JSON形式で以下の構造で出力してください：
{
  "mainImage": {
    "prompt": "詳細な画像生成プロンプト",
    "alt": "125文字以内のalt属性"
  },
  "sectionImages": [
    {
      "prompt": "セクション画像のプロンプト",
      "alt": "アクセシビリティ対応のalt属性",
      "placement": "記事内の最適な配置位置"
    }
  ]
}`;
  }
}