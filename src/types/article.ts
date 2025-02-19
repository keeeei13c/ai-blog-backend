export type Article = {
  id: number;
  slug: string;
  title: string;
  content: string;
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