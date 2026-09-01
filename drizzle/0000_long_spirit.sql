CREATE TABLE `job_applications` (
	`id` text PRIMARY KEY NOT NULL,
	`full_name` text NOT NULL,
	`phone` text NOT NULL,
	`email` text NOT NULL,
	`city` text DEFAULT '' NOT NULL,
	`work_area` text NOT NULL,
	`preferred_role` text DEFAULT '' NOT NULL,
	`experience` text NOT NULL,
	`availability` text NOT NULL,
	`preferred_language` text DEFAULT 'es' NOT NULL,
	`resume_key` text,
	`resume_filename` text,
	`resume_content_type` text,
	`resume_size` integer,
	`status` text DEFAULT 'new' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
