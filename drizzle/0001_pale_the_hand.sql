CREATE TABLE `rate_limits` (
	`key` text PRIMARY KEY NOT NULL,
	`hits` integer DEFAULT 0 NOT NULL,
	`expires_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_rate_limits_expires` ON `rate_limits` (`expires_at`);--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_jobs` (
	`id` text PRIMARY KEY NOT NULL,
	`tenant_id` text NOT NULL,
	`slug` text NOT NULL,
	`title_es` text NOT NULL,
	`title_en` text NOT NULL,
	`summary_es` text DEFAULT '' NOT NULL,
	`summary_en` text DEFAULT '' NOT NULL,
	`description_es` text DEFAULT '' NOT NULL,
	`description_en` text DEFAULT '' NOT NULL,
	`requirements_es` text DEFAULT '' NOT NULL,
	`requirements_en` text DEFAULT '' NOT NULL,
	`location` text DEFAULT 'Laredo, TX' NOT NULL,
	`shift` text DEFAULT 'Por confirmar' NOT NULL,
	`employment_type` text DEFAULT 'Temporal / proyecto' NOT NULL,
	`pay_min` real,
	`pay_max` real,
	`pay_unit` text DEFAULT 'hora' NOT NULL,
	`openings` integer DEFAULT 1 NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`featured` integer DEFAULT false NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`published_at` text,
	`closes_at` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`created_by` text,
	`updated_by` text,
	FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_jobs`("id", "tenant_id", "slug", "title_es", "title_en", "summary_es", "summary_en", "description_es", "description_en", "requirements_es", "requirements_en", "location", "shift", "employment_type", "pay_min", "pay_max", "pay_unit", "openings", "status", "featured", "sort_order", "published_at", "closes_at", "created_at", "updated_at", "created_by", "updated_by") SELECT "id", "tenant_id", "slug", "title_es", "title_en", "summary_es", "summary_en", "description_es", "description_en", "requirements_es", "requirements_en", "location", "shift", "employment_type", "pay_min", "pay_max", "pay_unit", "openings", "status", "featured", "sort_order", "published_at", "closes_at", "created_at", "updated_at", "created_by", "updated_by" FROM `jobs`;--> statement-breakpoint
DROP TABLE `jobs`;--> statement-breakpoint
ALTER TABLE `__new_jobs` RENAME TO `jobs`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `idx_jobs_tenant_slug` ON `jobs` (`tenant_id`,`slug`);--> statement-breakpoint
CREATE INDEX `idx_jobs_tenant_status_order` ON `jobs` (`tenant_id`,`status`,`sort_order`);--> statement-breakpoint
CREATE INDEX `idx_jobs_status_published` ON `jobs` (`status`,`published_at`);--> statement-breakpoint
CREATE UNIQUE INDEX `idx_memberships_tenant_user` ON `memberships` (`tenant_id`,`user_id`) WHERE "memberships"."user_id" is not null;