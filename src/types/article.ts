export type Article = {
  id: number;
  slug: string;
  title: string;
  content: string;
  image: string;
  imageAlt: string | null;
  category: string;
  keywords: string | null;
  readTime: number;
  metaDescription: string | null;
  status: string;
  date: string;
  createdAt: string;
  updatedAt: string;
}

export type RelatedArticle = {
  id: number;
  title: string;
  category: string;
}

export type ArticleResponse = {
  success: boolean;
  data?: Article;
  error?: string;
}

export type ArticleListResponse = {
  success: boolean;
  data?: Article[];
  error?: string;
}