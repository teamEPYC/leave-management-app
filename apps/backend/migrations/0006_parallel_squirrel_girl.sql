CREATE TYPE "public"."employee_type" AS ENUM('FULL_TIME', 'PART_TIME');--> statement-breakpoint
CREATE TYPE "public"."leave_limit_type" AS ENUM('YEAR', 'QUARTER', 'MONTH');--> statement-breakpoint
CREATE TABLE "leave_type_groups" (
	"id" uuid PRIMARY KEY NOT NULL,
	"leave_type_id" uuid NOT NULL,
	"group_id" uuid NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "leave_types" (
	"id" uuid PRIMARY KEY NOT NULL,
	"organization_id" uuid NOT NULL,
	"name" text NOT NULL,
	"short_code" text NOT NULL,
	"icon" text,
	"description" text,
	"is_limited" boolean DEFAULT true NOT NULL,
	"limit_type" "leave_limit_type",
	"limit_days" numeric(5, 2),
	"applies_to_everyone" boolean DEFAULT true NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "employee_type" "employee_type" DEFAULT 'FULL_TIME' NOT NULL;--> statement-breakpoint
ALTER TABLE "leave_type_groups" ADD CONSTRAINT "leave_type_groups_leave_type_id_leave_types_id_fk" FOREIGN KEY ("leave_type_id") REFERENCES "public"."leave_types"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leave_type_groups" ADD CONSTRAINT "leave_type_groups_group_id_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leave_types" ADD CONSTRAINT "leave_types_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "uq_leave_type_group" ON "leave_type_groups" USING btree ("leave_type_id","group_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_leave_type_name_org" ON "leave_types" USING btree (lower("name"),"organization_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_leave_type_code_org" ON "leave_types" USING btree (lower("short_code"),"organization_id");