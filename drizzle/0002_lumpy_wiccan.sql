ALTER TABLE `user` ADD `role` text DEFAULT 'patient' NOT NULL;--> statement-breakpoint
ALTER TABLE `user` ADD `password_needs_change` integer NOT NULL;