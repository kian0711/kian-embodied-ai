CREATE TABLE `site_visitors` (
	`ip_hash` text PRIMARY KEY NOT NULL,
	`first_seen_at` text NOT NULL,
	`last_seen_at` text NOT NULL
);
