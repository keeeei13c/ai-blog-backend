export type Article = {
  id: number;
  slug: string | null;
  title: string;
  content: string;
  image: string;
  category: string;
  readTime: string;
  date: string;
  createdAt: string;
  updatedAt: string;
}

export type RelatedArticle = {
  id: number;
  title: string;
  category: string;
}