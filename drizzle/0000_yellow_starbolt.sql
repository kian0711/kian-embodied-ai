CREATE TABLE `paper_sync` (
	`id` text PRIMARY KEY NOT NULL,
	`last_sync_date` text NOT NULL,
	`last_sync_at` text NOT NULL,
	`added_count` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `papers` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`paper_id` text NOT NULL,
	`title` text NOT NULL,
	`abstract` text DEFAULT '' NOT NULL,
	`authors` text DEFAULT '' NOT NULL,
	`year` integer NOT NULL,
	`published_at` text,
	`url` text NOT NULL,
	`category` text NOT NULL,
	`category_label` text NOT NULL,
	`citations` integer DEFAULT 0 NOT NULL,
	`added_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `papers_paper_id_unique` ON `papers` (`paper_id`);