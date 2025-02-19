CREATE TABLE `articles` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`slug` text,
	`title` text NOT NULL,
	`content` text NOT NULL,
	`image` text NOT NULL,
	`category` text NOT NULL,
	`read_time` text NOT NULL,
	`date` text NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `articles_category_idx` ON `articles` (`category`);--> statement-breakpoint
CREATE UNIQUE INDEX `articles_slug_idx` ON `articles` (`slug`);--> statement-breakpoint
CREATE TABLE `items` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`created_at` text DEFAULT (current_timestamp) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `related_articles` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`article_id` integer NOT NULL,
	`related_article_id` integer NOT NULL,
	FOREIGN KEY (`article_id`) REFERENCES `articles`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`related_article_id`) REFERENCES `articles`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `unique_article_relation` ON `related_articles` (`article_id`,`related_article_id`);--> statement-breakpoint
CREATE INDEX `related_article_idx` ON `related_articles` (`related_article_id`);