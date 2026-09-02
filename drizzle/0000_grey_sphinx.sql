CREATE TABLE `applications` (
	`id` text PRIMARY KEY NOT NULL,
	`reference` text NOT NULL,
	`submission_key` text NOT NULL,
	`tenant_id` text NOT NULL,
	`job_id` text,
	`role_interest` text NOT NULL,
	`full_name` text NOT NULL,
	`phone` text NOT NULL,
	`email` text NOT NULL,
	`city` text DEFAULT '' NOT NULL,
	`availability` text DEFAULT '' NOT NULL,
	`message` text DEFAULT '' NOT NULL,
	`resume_key` text,
	`resume_filename` text,
	`status` text DEFAULT 'new' NOT NULL,
	`source` text DEFAULT 'website' NOT NULL,
	`consent_at` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`job_id`) REFERENCES `jobs`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `applications_reference_unique` ON `applications` (`reference`);--> statement-breakpoint
CREATE UNIQUE INDEX `idx_applications_tenant_submission` ON `applications` (`tenant_id`,`submission_key`);--> statement-breakpoint
CREATE INDEX `idx_applications_tenant_status_created` ON `applications` (`tenant_id`,`status`,`created_at`);--> statement-breakpoint
CREATE INDEX `idx_applications_job_created` ON `applications` (`job_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `audit_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`tenant_id` text NOT NULL,
	`actor_id` text,
	`actor_email` text NOT NULL,
	`action` text NOT NULL,
	`entity_type` text NOT NULL,
	`entity_id` text NOT NULL,
	`summary` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_audit_tenant_created` ON `audit_logs` (`tenant_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `jobs` (
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
	`pay_min` integer,
	`pay_max` integer,
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
CREATE UNIQUE INDEX `idx_jobs_tenant_slug` ON `jobs` (`tenant_id`,`slug`);--> statement-breakpoint
CREATE INDEX `idx_jobs_tenant_status_order` ON `jobs` (`tenant_id`,`status`,`sort_order`);--> statement-breakpoint
CREATE INDEX `idx_jobs_status_published` ON `jobs` (`status`,`published_at`);--> statement-breakpoint
CREATE TABLE `media_assets` (
	`id` text PRIMARY KEY NOT NULL,
	`tenant_id` text NOT NULL,
	`object_key` text NOT NULL,
	`filename` text NOT NULL,
	`content_type` text NOT NULL,
	`size_bytes` integer NOT NULL,
	`alt_es` text DEFAULT '' NOT NULL,
	`alt_en` text DEFAULT '' NOT NULL,
	`visibility` text DEFAULT 'public' NOT NULL,
	`created_by` text,
	`created_at` text NOT NULL,
	FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `media_assets_object_key_unique` ON `media_assets` (`object_key`);--> statement-breakpoint
CREATE INDEX `idx_media_tenant_created` ON `media_assets` (`tenant_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `memberships` (
	`id` text PRIMARY KEY NOT NULL,
	`tenant_id` text NOT NULL,
	`user_id` text,
	`email` text NOT NULL,
	`role` text DEFAULT 'editor' NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_memberships_tenant_email` ON `memberships` (`tenant_id`,`email`);--> statement-breakpoint
CREATE INDEX `idx_memberships_user_id` ON `memberships` (`user_id`);--> statement-breakpoint
CREATE TABLE `site_settings` (
	`tenant_id` text PRIMARY KEY NOT NULL,
	`hero_line_1_es` text NOT NULL,
	`hero_accent_es` text NOT NULL,
	`hero_line_2_es` text NOT NULL,
	`hero_lead_es` text NOT NULL,
	`hero_line_1_en` text NOT NULL,
	`hero_accent_en` text NOT NULL,
	`hero_line_2_en` text NOT NULL,
	`hero_lead_en` text NOT NULL,
	`contact_phone` text NOT NULL,
	`contact_whatsapp` text NOT NULL,
	`contact_email` text NOT NULL,
	`hero_media_id` text,
	`transport_media_id` text,
	`operations_media_id` text,
	`updated_at` text NOT NULL,
	`updated_by` text,
	FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`hero_media_id`) REFERENCES `media_assets`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`transport_media_id`) REFERENCES `media_assets`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`operations_media_id`) REFERENCES `media_assets`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `tenants` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `tenants_slug_unique` ON `tenants` (`slug`);