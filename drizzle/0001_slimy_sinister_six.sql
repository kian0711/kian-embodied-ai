CREATE TABLE `reading_papers` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`innovation` text NOT NULL,
	`method` text NOT NULL,
	`result` text NOT NULL,
	`implementation` text NOT NULL,
	`pdf_key` text NOT NULL,
	`pdf_name` text NOT NULL,
	`pdf_size` integer NOT NULL,
	`created_at` text NOT NULL
);
