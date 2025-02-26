import { ContentResult, CreativeResult, FinalArticle, PlanningResult } from "../../types/ai";
import { generateSlug } from "../../utils/generate-slug";
import { UnsplashService } from "../image/unsplash";

export class ArticleTransformer {
  private unsplashService: UnsplashService;

  constructor() {
    this.unsplashService = new UnsplashService();
  }

  async transformToFinalArticle(
    planningResult: PlanningResult,
    contentResult: ContentResult,
    creativeResult: CreativeResult,
    topic: string
  ): Promise<FinalArticle> {
    const imageUrl = await this.unsplashService.getImage([
      ...planningResult.keywords,
      topic,
      "Technology"
    ]);

    return {
      title: contentResult.metadata.title,
      slug: generateSlug(contentResult.metadata.title),
      content: contentResult.content,
      image: imageUrl,
      imageAlt: creativeResult.mainImage.alt,
      category: topic || "Technology",
      keywords: contentResult.metadata.keywords.join(','),
      readTime: contentResult.metadata.readTime,
      metaDescription: contentResult.metadata.description,
      status: 'published',
      date: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }
}