DROP INDEX `articles_category_idx`;--> statement-breakpoint
DROP INDEX `articles_slug_idx`;--> statement-breakpoint
ALTER TABLE `articles` ADD `metadata` text;--> statement-breakpoint
ALTER TABLE `articles` ADD `status` text NOT NULL;