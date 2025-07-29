import { pgTable, text, uuid, timestamp, integer, boolean, uniqueIndex, index, primaryKey, pgEnum } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// ─────────────────────────────────────────────
// Shared Base Fields

export const CommonRows = {
  isActive: boolean().notNull().default(true),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
};

// ─────────────────────────────────────────────
// Enums

export const userRoleEnum = pgEnum("user_role", ["admin", "manager", "employee"]);
export const leaveStatusEnum = pgEnum("leave_status", ["pending", "approved", "rejected", "cancelled"]);
export const leaveCategoryEnum = pgEnum("leave_category", ["full_day", "half_day"]);
export const allHandsStatusEnum = pgEnum("allhands_status", ["active", "expired", "disabled"]);
export const notificationTypeEnum = pgEnum("notification_type", [
  "leave_applied", "approved", "rejected", "cancelled", "calendar_push", "calendar_remove"
]);

// ─────────────────────────────────────────────
// Users

export const Users = pgTable("users", {
  id: uuid().primaryKey().defaultRandom(),
  name: text().notNull(),
  email: text().notNull(),
  phone: text(),
  role: userRoleEnum("role").notNull(),
  groupId: uuid("group_id").references(() => Groups.id),
  ...CommonRows,
}, (t) => [
  uniqueIndex("user_email_key").on(t.email),
]);

// ─────────────────────────────────────────────
// Leave Types

export const LeaveTypes = pgTable("leave_types", {
  id: uuid().primaryKey().defaultRandom(),
  name: text().notNull(),
  shortCode: text().notNull(),
  description: text(),
  icon: text(),
  isLimited: boolean().notNull().default(true),
  value: integer(),
  ...CommonRows,
});

// ─────────────────────────────────────────────
// Leave Requests

export const LeaveRequests = pgTable("leave_requests", {
  id: uuid().primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => Users.id),
  leaveTypeId: uuid("leave_type_id").notNull().references(() => LeaveTypes.id),
  fromDate: timestamp("from_date", { withTimezone: true }).notNull(),
  toDate: timestamp("to_date", { withTimezone: true }).notNull(),
  category: leaveCategoryEnum("category").notNull(),
  notes: text(),
  status: leaveStatusEnum("status").notNull().default("pending"),
  reviewerId: uuid("reviewer_id").references(() => Users.id),
  reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
  ...CommonRows,
});

// ─────────────────────────────────────────────
// Groups

export const Groups = pgTable("groups", {
  id: uuid().primaryKey().defaultRandom(),
  name: text().notNull(),
  ...CommonRows,
});

// ─────────────────────────────────────────────
// Approval Managers

export const ApprovalManagers = pgTable("approval_managers", {
  id: uuid().primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => Users.id),
  groupId: uuid("group_id").notNull().references(() => Groups.id),
  ...CommonRows,
});

// ─────────────────────────────────────────────
// Calendar Settings

export const CalendarSettings = pgTable("calendar_settings", {
  id: uuid().primaryKey().defaultRandom(),
  adminUserId: uuid("admin_user_id").notNull().references(() => Users.id),
  clientId: text().notNull(),
  clientSecret: text().notNull(),
  isActive: boolean().notNull().default(true),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
});

// ─────────────────────────────────────────────
// All Hands Periods

export const AllHands = pgTable("all_hands", {
  id: uuid().primaryKey().defaultRandom(),
  groupId: uuid("group_id").notNull().references(() => Groups.id),
  startDate: timestamp("start_date", { withTimezone: true }).notNull(),
  endDate: timestamp("end_date", { withTimezone: true }).notNull(),
  reason: text(),
  status: allHandsStatusEnum("status").notNull().default("active"),
  ...CommonRows,
});


// Notifications

export const Notifications = pgTable("notifications", {
  id: uuid().primaryKey().defaultRandom(),
  type: notificationTypeEnum("type").notNull(),
  userId: uuid("user_id").notNull().references(() => Users.id),
  leaveId: uuid("leave_id").references(() => LeaveRequests.id),
  message: text().notNull(),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
});

// ─────────────────────────────────────────────
// Leave Balances

export const LeaveBalances = pgTable("leave_balances", {
  id: uuid().primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => Users.id),
  leaveTypeId: uuid("leave_type_id").notNull().references(() => LeaveTypes.id),
  year: integer().notNull(), // e.g. 2025
  used: integer().notNull().default(0),
  balance: integer().notNull().default(0),
  ...CommonRows,
});
