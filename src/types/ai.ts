import { z } from "zod";

// Planning Result Schema (コンテンツプランナーの出力)
export const planningResultSchema = z.object({
  mainTheme: z.string(),
  subThemes: z.array(z.string()),
  keywords: z.array(z.string()),
  persona: z.object({
    description: z.string(),
    interests: z.array(z.string())
  }),
  engagementPrediction: z.object({
    score: z.number(),
    reasoning: z.string()
  })
});

// Content Result Schema (コンテンツクリエイターの出力)
export const contentResultSchema = z.object({
  content: z.string(),
  metadata: z.object({
    title: z.string().max(60),
    description: z.string().min(120).max(160),
    keywords: z.array(z.string()),
    readTime: z.number() // 数値として保存
  })
});

// Creative Result Schema (クリエイティブディレクターの出力)
export const creativeResultSchema = z.object({
  mainImage: z.object({
    prompt: z.string(),
    alt: z.string().max(125)
  }),
  sectionImages: z.array(z.object({
    prompt: z.string(),
    alt: z.string(),
    placement: z.string()
  }))
});

// 各結果の型定義
export type PlanningResult = z.infer<typeof planningResultSchema>;
export type ContentResult = z.infer<typeof contentResultSchema>;
export type CreativeResult = z.infer<typeof creativeResultSchema>;

// 最終的なDB保存用の型（すべてのAIサービスの結果を統合）
export const finalArticleSchema = z.object({
  title: z.string(),
  slug: z.string(),
  content: z.string(),
  image: z.string(),
  imageAlt: z.string().nullable(),
  category: z.string(),
  keywords: z.string(), // カンマ区切りの文字列として保存
  readTime: z.number(),
  metaDescription: z.string().nullable(),
  status: z.string(),
  date: z.string(), // YYYY-MM-DD形式
  createdAt: z.string(),
  updatedAt: z.string()
});

export type FinalArticle = z.infer<typeof finalArticleSchema>;