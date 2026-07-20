CREATE TABLE `collaborators` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`school` text NOT NULL,
	`research_direction` text NOT NULL,
	`bio` text NOT NULL,
	`photo_key` text NOT NULL,
	`photo_name` text NOT NULL,
	`created_at` text NOT NULL
);
