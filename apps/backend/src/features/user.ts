import bcrypt from "bcryptjs";
import { WithDb } from "../utils/commonTypes";
import { InvitationTable, OrganizationTable, RoleTable, UserOrganizationTable, UserTable } from "./db/schema";
import { and, eq, gt } from "drizzle-orm";
import { ErrorCodes } from "../utils/error";


type OrgRoleCheckArgs = {
  db: ReturnType<typeof import("./db/connect").connectDb>;
  userId: string;
  organizationId: string;
};

const UserSelectInfo = {
  basic: {
    id: UserTable.id,
  },
  info: {
    id: UserTable.id,
    email: UserTable.email,
    name: UserTable.name,
  },
  withPassword: {
    id: UserTable.id,
  },
};

export async function createUser({
  email,
  name,
  plainTextPassword,
  db,
}: WithDb<{
  email: string;
  company: string;
  name: string;
  plainTextPassword: string;
}>) {
  const hashedPassword = await bcrypt.hash(plainTextPassword, 10);

  const user = await db
    .insert(UserTable)
    .values({
      email,
      name
    })
    .onConflictDoNothing({
      target: [UserTable.email],
      where: eq(UserTable.isActive, true),
    })
    .returning();

  if (user.length === 0) {
    return {
      ok: false,
      errorCode: ErrorCodes.EMAIL_ALREADY_IN_USE,
      error: `Email already in use. Use another email or login.`,
    } as const;
  }

  return { ok: true, user: user[0] } as const;
}

export async function getUserByEmail({
  email,
  db,
}: WithDb<{ email: string; selectInfo?: typeof UserSelectInfo }>) {
  const user = await db
    .select({
      id: UserTable.id,
      email: UserTable.email,
      name: UserTable.name,
    })
    .from(UserTable)
    .where(eq(UserTable.email, email));

  if (user.length === 0) {
    return null;
  }

  return user[0];
}

export async function getUserById({
  id,
  db,
}: WithDb<{ id: string; selectInfo?: typeof UserSelectInfo }>) {
  const user = await db
    .select({
      id: UserTable.id,
      email: UserTable.email,
      name: UserTable.name,
    })
    .from(UserTable)
    .where(eq(UserTable.id, id));

  if (user.length === 0) {
    return null;
  }

  return user[0];
}



export async function getUserRole({
  db,
  userId,
  organizationId,
}: OrgRoleCheckArgs): Promise<{
  isOwner: boolean;
  isAdmin: boolean;
  isEmployee: boolean;
  hasAccess: boolean;
}> {
  // Get user’s role in the org
  const membership = await db
    .select({
      roleName: RoleTable.name,
    })
    .from(UserOrganizationTable)
    .innerJoin(RoleTable, eq(UserOrganizationTable.roleId, RoleTable.id))
    .where(
      and(
        eq(UserOrganizationTable.userId, userId),
        eq(UserOrganizationTable.organizationId, organizationId)
      )
    )
    .limit(1);

  const role = membership[0]?.roleName;

  const isOwner = role === "OWNER";
  const isAdmin = role === "ADMIN";
  const isEmployee = role === "EMPLOYEE";

  return {
    isOwner,
    isAdmin,
    isEmployee,
    hasAccess: !!role,
  };
}


export async function getRoleIdByName({
  db,
  roleName,
}: WithDb<{ roleName: "OWNER" | "ADMIN" | "EMPLOYEE" }>) {
  const res = await db
    .select({ id: RoleTable.id })
    .from(RoleTable)
    .where(eq(RoleTable.name, roleName))
    .limit(1);

  if (res.length === 0) {
    throw new Error(`Role '${roleName}' not found`);
  }

  return res[0].id;
}



export async function getValidInvitation({
  db,
  organizationId,
  email,
  invitationId,
}: {
  db: ReturnType<typeof import("./db/connect").connectDb>;
  organizationId: string;
  email: string;
  invitationId?: string;
}) {
  const conditions = [
    eq(InvitationTable.organizationId, organizationId),
    eq(InvitationTable.email, email.toLowerCase()),
    eq(InvitationTable.status, "SENT"),
    gt(InvitationTable.expiresAt, new Date()),
  ];

  if (invitationId) {
    conditions.push(eq(InvitationTable.id, invitationId));
  }

  const invites = await db
    .select()
    .from(InvitationTable)
    .where(and(...conditions))
    .limit(1);

  return invites.length > 0 ? invites[0] : null;
}


export async function addUserToOrganization({
  db,
  userId,
  organizationId,
  roleId,
  isOwner = false,
}: WithDb<{
  userId: string;
  organizationId: string;
  roleId: string;
  isOwner?: boolean;
}>) {
  return db.insert(UserOrganizationTable).values({
    userId,
    organizationId,
    roleId,
    isOwner,
  });
}




// TODO: check user already in organization
export async function isUserAlreadyInOrganization({
  db,
  email,
  organizationId,
}: WithDb<{ email: string; organizationId: string }>): Promise<boolean> {
  // 1. Check if user exists
  const existingUser = await getUserByEmail({ db, email });
  if (!existingUser) return false;

  // 2. Check membership
  const { hasAccess } = await getUserRole({
    db,
    userId: existingUser.id,
    organizationId,
  });

  return hasAccess;
}







export async function getUserWithOrganization({
  userId,
  db,
}: WithDb<{ userId: string }>) {
  const result = await db
    .select({
      id: UserTable.id,
      email: UserTable.email,
      name: UserTable.name,
      image: UserTable.image,
      phone: UserTable.phone,
      employeeType: UserTable.employeeType,
      organizationId: UserOrganizationTable.organizationId,
      roleId: UserOrganizationTable.roleId,
      isOwner: UserOrganizationTable.isOwner,
    })
    .from(UserTable)
    .leftJoin(UserOrganizationTable, eq(UserTable.id, UserOrganizationTable.userId))
    .where(eq(UserTable.id, userId))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}


export async function getOrganizationCreator({
  organizationId,
  db,
}: WithDb<{ organizationId: string }>) {
  const result = await db
    .select({
      id: UserTable.id,
      email: UserTable.email,
      name: UserTable.name,
      image: UserTable.image,
    })
    .from(UserOrganizationTable)
    .innerJoin(UserTable, eq(UserOrganizationTable.userId, UserTable.id))
    .where(
      and(
        eq(UserOrganizationTable.organizationId, organizationId),
        eq(UserOrganizationTable.isOwner, true)
      )
    )
    .limit(1);

  return result.length > 0 ? result[0] : null;
}


export async function getUserOrganizations({
  userId,
  db,
}: WithDb<{ userId: string }>) {
  return db
    .select({
      organizationId: UserOrganizationTable.organizationId,
      roleId: UserOrganizationTable.roleId,
      isOwner: UserOrganizationTable.isOwner,
      organizationName: OrganizationTable.name,
      organizationDomain: OrganizationTable.domain,
    })
    .from(UserOrganizationTable)
    .innerJoin(OrganizationTable, eq(UserOrganizationTable.organizationId, OrganizationTable.id))
    .where(eq(UserOrganizationTable.userId, userId));
}
