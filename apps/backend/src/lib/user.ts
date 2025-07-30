import { WithDb } from "../utils/commonTypes";
import { UserTable } from "../features/db/schema";
import { eq } from "drizzle-orm";
import { ErrorCodes } from "../utils/error";

// Select presets
export const UserSelectInfo = {
  basic: {
    id: UserTable.id,
  },
  info: {
    id: UserTable.id,
    email: UserTable.email,
    name: UserTable.name,
    image: UserTable.image,
    roleId: UserTable.roleId,
    organizationId: UserTable.organizationId,
  },
};

// Create user from Google login
export async function createUser({
  email,
  name,
  image,
  roleId,
  organizationId,
  db,
}: WithDb<{
  email: string;
  name: string;
  image?: string;
  roleId: string;
  organizationId: string;
}>) {
  const user = await db
    .insert(UserTable)
    .values({
      email,
      name,
      image,
      roleId,
      organizationId,
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
      error: "Email already in use. Use another email or login.",
    } as const;
  }

  return { ok: true, user: user[0] } as const;
}

// Get user by email
export async function getUserByEmail({
  email,
  db,
}: WithDb<{ email: string }>) {
  const user = await db
    .select(UserSelectInfo.info)
    .from(UserTable)
    .where(eq(UserTable.email, email));

  return user.length > 0 ? user[0] : null;
}

// Get user by ID
export async function getUserById({
  id,
  db,
}: WithDb<{ id: string }>) {
  const user = await db
    .select(UserSelectInfo.info)
    .from(UserTable)
    .where(eq(UserTable.id, id));

  return user.length > 0 ? user[0] : null;
}
