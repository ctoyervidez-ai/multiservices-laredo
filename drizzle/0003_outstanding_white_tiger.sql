CREATE TABLE `daily_metrics` (
	`id` text PRIMARY KEY NOT NULL,
	`tenant_id` text NOT NULL,
	`day` text NOT NULL,
	`event` text NOT NULL,
	`path` text NOT NULL,
	`count` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_daily_metrics_tenant_day` ON `daily_metrics` (`tenant_id`,`day`);--> statement-breakpoint
CREATE TABLE `inquiries` (
	`id` text PRIMARY KEY NOT NULL,
	`tenant_id` text NOT NULL,
	`reference` text NOT NULL,
	`submission_key` text NOT NULL,
	`full_name` text NOT NULL,
	`company` text NOT NULL,
	`phone` text NOT NULL,
	`email` text NOT NULL,
	`need` text NOT NULL,
	`message` text DEFAULT '' NOT NULL,
	`status` text DEFAULT 'new' NOT NULL,
	`consent_at` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `inquiries_reference_unique` ON `inquiries` (`reference`);--> statement-breakpoint
CREATE UNIQUE INDEX `idx_inquiries_tenant_submission` ON `inquiries` (`tenant_id`,`submission_key`);--> statement-breakpoint
CREATE INDEX `idx_inquiries_tenant_created` ON `inquiries` (`tenant_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` text PRIMARY KEY NOT NULL,
	`tenant_id` text NOT NULL,
	`entity_id` text NOT NULL,
	`recipient` text NOT NULL,
	`subject` text NOT NULL,
	`body` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`first_attempt_at` text,
	`attempted_at` text,
	`accepted_at` text,
	`provider_id` text,
	`created_at` text NOT NULL,
	FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_notifications_tenant_status_created` ON `notifications` (`tenant_id`,`status`,`created_at`);--> statement-breakpoint
CREATE TABLE `password_resets` (
	`token_hash` text PRIMARY KEY NOT NULL,
	`tenant_id` text NOT NULL,
	`user_id` text NOT NULL,
	`auth_version` integer NOT NULL,
	`expires_at` text NOT NULL,
	`used_at` text,
	FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `portal_users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_password_resets_expiry` ON `password_resets` (`expires_at`);