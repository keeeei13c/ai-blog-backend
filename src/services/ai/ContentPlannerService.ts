import { PlanningResult, planningResultSchema } from "../../types/ai";
import { OpenAICompletionResponse } from "../../types/openai";
import { OpenAIService } from "../openai";
import { z } from "zod";

export class ContentPlannerService {
  private openaiService: OpenAIService;

  constructor(apiKey: string) {
    this.openaiService = new OpenAIService(apiKey);
  }

  async plan(topic?: string): Promise<OpenAICompletionResponse<PlanningResult>> {
    try {
      const prompt = this.buildPrompt(topic);
      const result = await this.openaiService.createCompletion(prompt, {
        temperature: 0.9, // 高い創造性のために
        max_tokens: 1000
      });
      
      if (!result.success) {
        return { success: false, error: result.error };
      }

      if (!result.data) {
        return { success: false, error: "No data received from OpenAI" };
      }

      const parsedData = planningResultSchema.parse(JSON.parse(result.data));
      
      return {
        success: true,
        data: parsedData,
        usage: result.usage
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          success: false,
          error: "Invalid planning response format"
        };
      }
      return {
        success: false,
        error: "Content planning failed"
      };
    }
  }

  private buildPrompt(topic?: string): string {
    return `あなたは優れたコンテンツストラテジストです。
現在のトレンドと市場分析に基づいて、魅力的なブログ記事の企画を立案してください。

${topic ? `メインテーマ案: ${topic}` : ''}

以下の要素を考慮してください：
1. 市場分析
- 現在のトレンドと需要
- 競合分析
- 差別化ポイント

2. ユーザー視点
- ターゲット読者の詳細なペルソナ
- 解決する課題や提供する価値
- 想定される検索意図

3. SEO戦略
- メインキーワードとLong-tail keywords
- 検索ボリュームと競合度
- 内部リンク構造の提案

JSON形式で以下の構造で出力してください：
{
  "mainTheme": "メインテーマ",
  "subThemes": ["サブテーマ1", "サブテーマ2", "サブテーマ3"],
  "keywords": ["主要キーワード", "関連キーワード"],
  "persona": {
    "description": "具体的なペルソナ像",
    "interests": ["興味関心1", "興味関心2"]
  },
  "engagementPrediction": {
    "score": 0-100の予測スコア,
    "reasoning": "スコアの根拠"
  }
}`;
  }
}