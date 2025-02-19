import { sql } from "drizzle-orm";
import { sqliteTable, text, integer, index, uniqueIndex } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

// 元のテーブル定義
export const items = sqliteTable("items", {
  id: text("id").primaryKey().notNull(),
  name: text("name").notNull(),
  created_at: text("created_at")
    .notNull()
    .default(sql`(current_timestamp)`)
});

export const articles = sqliteTable("articles", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  category: text("category").notNull(),
  keywords: text("keywords"),
  readTime: integer("read_time").notNull(),
  metaDescription: text("meta_description"),
  status: text("status").notNull().default("draft"),
  date: text("date").notNull(),
  createdAt: text("created_at").notNull().default(sql`(datetime('now'))`),
  updatedAt: text("updated_at").notNull().default(sql`(datetime('now'))`)
});

// 関連記事テーブル
export const relatedArticles = sqliteTable("related_articles", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  articleId: integer("article_id")
    .notNull()
    .references(() => articles.id, { onDelete: "cascade" }),
  relatedArticleId: integer("related_article_id")
    .notNull()
    .references(() => articles.id, { onDelete: "cascade" })
}, (table) => [
  uniqueIndex("unique_article_relation").on(table.articleId, table.relatedArticleId),
  index("related_article_idx").on(table.relatedArticleId)
]);

// リレーション定義
export const articlesRelations = relations(articles, ({ many }) => ({
  relatedTo: many(relatedArticles, { relationName: "article" }),
  relatedFrom: many(relatedArticles, { relationName: "relatedArticle" })
}));

export const relatedArticlesRelations = relations(relatedArticles, ({ one }) => ({
  article: one(articles, {
    fields: [relatedArticles.articleId],
    references: [articles.id],
    relationName: "article"
  }),
  relatedArticle: one(articles, {
    fields: [relatedArticles.relatedArticleId],
    references: [articles.id],
    relationName: "relatedArticle"
  })
}));
