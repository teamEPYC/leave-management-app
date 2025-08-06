ALTER TABLE "organizations" DROP CONSTRAINT "organizations_created_by_users_id_fk";
--> statement-breakpoint
ALTER TABLE "users" DROP CONSTRAINT "users_role_id_roles_id_fk";
--> statement-breakpoint
ALTER TABLE "users" DROP CONSTRAINT "users_organization_id_organizations_id_fk";
--> statement-breakpoint
ALTER TABLE "organizations" ALTER COLUMN "setting" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "invitations" ADD COLUMN "employee_type" "employee_type" DEFAULT 'FULL_TIME' NOT NULL;--> statement-breakpoint
ALTER TABLE "invitations" ADD COLUMN "groups" json DEFAULT '{}'::json;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "full_time_start_date" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "organizations" DROP COLUMN "created_by";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "role_id";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "organization_id";