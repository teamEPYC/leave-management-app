ALTER TABLE "invitations" ALTER COLUMN "groups" SET DEFAULT '[]'::json;--> statement-breakpoint
ALTER TABLE "organizations" ALTER COLUMN "setting" SET DEFAULT '[]'::json;