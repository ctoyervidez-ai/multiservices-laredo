CREATE TABLE `auth_bootstrap` (
	`tenant_id` text PRIMARY KEY NOT NULL,
	`code_hash_b64` text,
	`code_key_version` integer DEFAULT 1 NOT NULL,
	`expires_at` text NOT NULL,
	`used_at` text,
	`used_by_user_id` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`used_by_user_id`) REFERENCES `portal_users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `auth_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`token_hash_b64` text NOT NULL,
	`tenant_id` text NOT NULL,
	`user_id` text NOT NULL,
	`auth_version` integer NOT NULL,
	`created_at` text NOT NULL,
	`last_seen_at` text NOT NULL,
	`idle_expires_at` text NOT NULL,
	`absolute_expires_at` text NOT NULL,
	`revoked_at` text,
	`revoked_reason` text,
	`ip_hash_b64` text,
	`user_agent_hash_b64` text,
	FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `portal_users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `auth_sessions_token_hash_b64_unique` ON `auth_sessions` (`token_hash_b64`);--> statement-breakpoint
CREATE INDEX `idx_auth_sessions_user_created` ON `auth_sessions` (`user_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `idx_auth_sessions_expiry` ON `auth_sessions` (`idle_expires_at`,`absolute_expires_at`);--> statement-breakpoint
CREATE INDEX `idx_auth_sessions_active_token` ON `auth_sessions` (`token_hash_b64`) WHERE "auth_sessions"."revoked_at" is null;--> statement-breakpoint
CREATE TABLE `portal_users` (
	`id` text PRIMARY KEY NOT NULL,
	`tenant_id` text NOT NULL,
	`email` text NOT NULL,
	`display_name` text NOT NULL,
	`password_algorithm` text NOT NULL,
	`password_iterations` integer NOT NULL,
	`password_salt_b64` text NOT NULL,
	`password_hash_b64` text NOT NULL,
	`pepper_version` integer DEFAULT 1 NOT NULL,
	`auth_version` integer DEFAULT 1 NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`password_changed_at` text NOT NULL,
	`last_login_at` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_portal_users_tenant_email` ON `portal_users` (`tenant_id`,`email`);--> statement-breakpoint
CREATE INDEX `idx_portal_users_tenant_status` ON `portal_users` (`tenant_id`,`status`);