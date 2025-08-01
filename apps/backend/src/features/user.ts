import bcrypt from "bcryptjs";
import { WithDb } from "../utils/commonTypes";
import { RoleTable, UserOrganizationTable, UserTable } from "./db/schema";
import { and, eq } from "drizzle-orm";
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
      name,
      roleId: null,
      organizationId: null,
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
