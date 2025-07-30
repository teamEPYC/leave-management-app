import { pgTable, text, uuid, timestamp, boolean, json, uniqueIndex, pgEnum } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

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
// Organizations

export const Organizations = pgTable("organizations", {
  id: uuid().primaryKey().defaultRandom(),
  name: text().notNull(),
  description: text(),
  icon: text(),
  domain: text().notNull(),
  setting: json("setting").notNull().default({}),
  createdBy: uuid("created_by").notNull().references(() => UserTable.id),
  ...CommonRows,
});

// ─────────────────────────────────────────────────────────────
// Roles

export const Roles = pgTable("roles", {
  id: uuid().primaryKey().defaultRandom(),
  name: text().notNull(), // 'OWNER', 'ADMIN', 'EMPLOYEE'
  ...CommonRows,
});

// ─────────────────────────────────────────────────────────────
// Users

export const UserTable = pgTable("users", {
  id: uuid().primaryKey().defaultRandom(),
  name: text().notNull(),
  image: text(),
  email: text().notNull(),
  phone: text(),
  roleId: uuid("role_id").notNull().references(() => Roles.id),
  organizationId: uuid("organization_id").references(() => Organizations.id),
  ...CommonRows,
}, (t) => [
  uniqueIndex("user_email_key").on(t.email).where(sql`${t.isActive}`),
]);

// ─────────────────────────────────────────────────────────────
// Invitations

export const Invitations = pgTable("invitations", {
  id: uuid().primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => Organizations.id),
  email: text().notNull(),
  status: invitationStatusEnum("status").notNull().default("SENT"),
  ...CommonRows,
});
