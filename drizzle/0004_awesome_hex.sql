CREATE TABLE `portal_invites` (
	`id` text PRIMARY KEY NOT NULL,
	`tenant_id` text NOT NULL,
	`email` text NOT NULL,
	`role` text NOT NULL,
	`token_hash` text NOT NULL,
	`expires_at` text NOT NULL,
	`used_at` text,
	`created_at` text NOT NULL,
	FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `portal_invites_token_hash_unique` ON `portal_invites` (`token_hash`);--> statement-breakpoint
CREATE INDEX `idx_invites_tenant_email` ON `portal_invites` (`tenant_id`,`email`);--> statement-breakpoint
CREATE TABLE `site_content` (
	`tenant_id` text PRIMARY KEY NOT NULL,
	`values_json` text DEFAULT '{}' NOT NULL,
	`revision` integer DEFAULT 0 NOT NULL,
	`updated_at` text NOT NULL,
	`updated_by` text,
	FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON UPDATE no action ON DELETE no action
);
