import { z } from "zod";

export const planningResultSchema = z.object({
  mainTheme: z.string(),
  subThemes: z.array(z.string()),
  keywords: z.array(z.string()),
  persona: z.object({
    description: z.string(),
    interests: z.array(z.string())
  }),
  engagementPrediction: z.object({
    score: z.number().min(0).max(100),
    reasoning: z.string()
  })
});

export const contentResultSchema = z.object({
  content: z.string(),
  metadata: z.object({
    title: z.string().max(60),
    description: z.string().min(120).max(160),
    keywords: z.array(z.string()),
    readTime: z.string()
  })
});

export const creativeResultSchema = z.object({
  mainImage: z.object({
    prompt: z.string(),
    alt: z.string().max(125)
  }),
  sectionImages: z.array(z.object({
    prompt: z.string(),
    alt: z.string().max(125),
    placement: z.string()
  }))
});

export type PlanningResult = z.infer<typeof planningResultSchema>;
export type ContentResult = z.infer<typeof contentResultSchema>;
export type CreativeResult = z.infer<typeof creativeResultSchema>;