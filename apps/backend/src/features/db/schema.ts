import { pgTable, text, uuid, timestamp, boolean, json, uniqueIndex, pgEnum, numeric } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { check } from "drizzle-orm/gel-core";

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
export const employeeTypeEnum = pgEnum("employee_type", ["FULL_TIME", "PART_TIME"]);
export const leaveLimitTypeEnum = pgEnum("leave_limit_type", ["YEAR", "QUARTER", "MONTH"]);

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
  employeeType: employeeTypeEnum("employee_type").notNull().default("FULL_TIME"),
  fullTimeStartDate: timestamp({ withTimezone: true }),
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
  setting: json("setting").default([]),
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
  employeeType: employeeTypeEnum("employee_type").notNull().default("FULL_TIME"),
  groups: json("groups").default([]),
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



// ─────────────────────────────────────────────────────────────
// GroupTable

export const GroupTable = pgTable("groups", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => OrganizationTable.id),
  name: text().notNull(),
  description: text(),
  icon: text(),
  createdBy: uuid("created_by")
    .notNull()
    .references(() => UserTable.id),
  ...CommonRows,
});


// ─────────────────────────────────────────────────────────────
// GroupUserTable

export const GroupUserTable = pgTable("group_users", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  groupId: uuid("group_id")
    .notNull()
    .references(() => GroupTable.id),
  userId: uuid("user_id")
    .notNull()
    .references(() => UserTable.id),
  isApprovalManager: boolean("is_approval_manager").notNull().default(false),
  addedBy: uuid("added_by")
    .notNull()
    .references(() => UserTable.id),
  ...CommonRows,
});


// ─────────────────────────────────────────────────────────────
// LeaveTypeTable 

export const LeaveTypeTable = pgTable(
  "leave_types",
  {
    id: uuid("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => OrganizationTable.id),
    name: text("name").notNull(),
    shortCode: text("short_code").notNull(),
    icon: text("icon"),
    description: text("description"),
    isLimited: boolean("is_limited").notNull().default(true),
    limitType: leaveLimitTypeEnum("limit_type"), // YEAR / QUARTER / MONTH
    limitDays: numeric("limit_days", { precision: 5, scale: 2 }), // e.g., 12.5
    appliesToEveryone: boolean("applies_to_everyone").notNull().default(true),
    employeeType: employeeTypeEnum("employee_type").notNull().default("FULL_TIME"),
    ...CommonRows,
  },
  (t) => [
    // Keep: Unique Name per org (case-insensitive)
    uniqueIndex("uq_leave_type_name_org").on(
      sql`lower(${t.name})`,
      t.organizationId
    ),
    // Keep: Ensure positive limit days
    check("chk_limit_days_positive", sql`
      (limit_days IS NULL OR limit_days > 0)
    `),
  ]
);


// ─────────────────────────────────────────────────────────────
// LeaveTypeGroupTable

export const LeaveTypeGroupTable = pgTable(
  "leave_type_groups",
  {
    id: uuid("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    leaveTypeId: uuid("leave_type_id")
      .notNull()
      .references(() => LeaveTypeTable.id),
    groupId: uuid("group_id")
      .notNull()
      .references(() => GroupTable.id),
    ...CommonRows,
  },
  (t) => [
    uniqueIndex("uq_leave_type_group").on(t.leaveTypeId, t.groupId),
  ]
);
