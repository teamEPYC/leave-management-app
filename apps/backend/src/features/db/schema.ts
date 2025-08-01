import { pgTable, text, uuid, timestamp, boolean, json, uniqueIndex, pgEnum } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// ─────────────────────────────────────────────────────────────
// Shared fields

// ─────────────────────────────────────────────────────────────
// Shared fields

export const CommonRows = {
  isActive: boolean().notNull().default(true),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
};

// ─────────────────────────────────────────────────────────────
// Enums

export const invitationStatusEnum = pgEnum("invitation_status", ["SENT", "ACCEPT"]);

// ─────────────────────────────────────────────────────────────
// Users

export const UserTable = pgTable("users", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text().notNull(),
  image: text(),
  email: text().notNull(),
  phone: text(),
  roleId: uuid("role_id").notNull().references(() => RoleTable.id),
  organizationId: uuid("organization_id").references(() => OrganizationTable.id),
  ...CommonRows,
}, (t) => [
  uniqueIndex("user_email_key").on(t.email).where(sql`${t.isActive}`),
]);


// ─────────────────────────────────────────────────────────────
// Roles

export const RoleTable = pgTable("roles", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text().notNull(), // 'OWNER', 'ADMIN', 'EMPLOYEE'
  ...CommonRows,
});



// ─────────────────────────────────────────────────────────────
// Organizations

export const OrganizationTable = pgTable("organizations", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text().notNull(),
  description: text(),
  icon: text(),
  domain: text().notNull(),
  setting: json("setting").notNull().default({}),
  createdBy: uuid("created_by").notNull().references(() => UserTable.id),
  ...CommonRows,
});

// ─────────────────────────────────────────────────────────────
// Invitations

export const InvitationTable = pgTable("invitations", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  organizationId: uuid("organization_id").notNull().references(() => OrganizationTable.id),
  email: text().notNull(),
  roleId: uuid("role_id").notNull().references(() => RoleTable.id),
  status: invitationStatusEnum("status").notNull().default("SENT"),
  expiresAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  ...CommonRows,
});


// ─────────────────────────────────────────────────────────────
// UserOrganizationTable 

export const UserOrganizationTable = pgTable("user_organization", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  organizationId: uuid("organization_id").notNull().references(() => OrganizationTable.id),
  userId: uuid("user_id").notNull().references(() => UserTable.id),
  roleId: uuid("role_id").notNull().references(() => RoleTable.id),
  isOwner: boolean('is_owner').notNull().default(false),
  ...CommonRows,
});
