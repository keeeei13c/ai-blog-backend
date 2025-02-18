import { sql } from "drizzle-orm";
import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export const items = sqliteTable("items", {
  id: text("id").primaryKey().notNull(),
  name: text("name").notNull(),
  created_at: text("created_at")
    .notNull()
    .default(sql`(current_timestamp)`)
});