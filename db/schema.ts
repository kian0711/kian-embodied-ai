import { integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const papers = sqliteTable("papers", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  paperId: text("paper_id").notNull(),
  title: text("title").notNull(),
  abstract: text("abstract").notNull().default(""),
  authors: text("authors").notNull().default(""),
  year: integer("year").notNull(),
  publishedAt: text("published_at"),
  url: text("url").notNull(),
  category: text("category").notNull(),
  categoryLabel: text("category_label").notNull(),
  citations: integer("citations").notNull().default(0),
  addedAt: text("added_at").notNull(),
}, (table) => [uniqueIndex("papers_paper_id_unique").on(table.paperId)]);

export const paperSync = sqliteTable("paper_sync", {
  id: text("id").primaryKey(),
  lastSyncDate: text("last_sync_date").notNull(),
  lastSyncAt: text("last_sync_at").notNull(),
  addedCount: integer("added_count").notNull().default(0),
});
