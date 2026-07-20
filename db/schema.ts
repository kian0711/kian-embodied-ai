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

export const readingPapers = sqliteTable("reading_papers", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  innovation: text("innovation").notNull(),
  method: text("method").notNull(),
  result: text("result").notNull(),
  implementation: text("implementation").notNull(),
  contributorName: text("contributor_name").notNull().default(""),
  contributorSchool: text("contributor_school").notNull().default(""),
  contributorWechat: text("contributor_wechat").notNull().default(""),
  paperUrl: text("paper_url").notNull().default(""),
  imageKey: text("image_key").notNull().default(""),
  imageName: text("image_name").notNull().default(""),
  status: text("status").notNull().default("approved"),
  pdfKey: text("pdf_key").notNull(),
  pdfName: text("pdf_name").notNull(),
  pdfSize: integer("pdf_size").notNull(),
  createdAt: text("created_at").notNull(),
});

export const siteViews = sqliteTable("site_views", {
  id: text("id").primaryKey(),
  viewCount: integer("view_count").notNull().default(0),
  updatedAt: text("updated_at").notNull(),
});

export const collaborators = sqliteTable("collaborators", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  school: text("school").notNull(),
  researchDirection: text("research_direction").notNull(),
  bio: text("bio").notNull(),
  photoKey: text("photo_key").notNull(),
  photoName: text("photo_name").notNull(),
  createdAt: text("created_at").notNull(),
});
