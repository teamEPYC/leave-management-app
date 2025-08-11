import { and, eq, inArray } from "drizzle-orm";
import { GroupTable, GroupUserTable, UserOrganizationTable } from "../db/schema";
import { ErrorCodes } from "../../utils/error";
import { WithDbAndEnv } from "../../utils/commonTypes";
import { getUserFromApiKey } from "../auth/auth";
import { getUserRole } from "../user";

export async function listGroupsForCurrentOrg({
    db,
    env,
    apiKey,
}: WithDbAndEnv<{ apiKey: string }>) {
    // 1. Auth
    const userRes = await getUserFromApiKey({ db, env, apiKey });
    if (!userRes.ok) return { ok: false, ...userRes, status: 401 } as const;
    const user = userRes.user;

    // 2. Find the organization where the user is active
    const userOrg = await db
        .select({ organizationId: UserOrganizationTable.organizationId })
        .from(UserOrganizationTable)
        .where(eq(UserOrganizationTable.userId, user.id))
        .limit(1);

    if (userOrg.length === 0) {
        return {
            ok: false,
            errorCode: ErrorCodes.NOT_FOUND,
            error: "User does not belong to any active organization",
            status: 404,
        } as const;
    }

    const organizationId = userOrg[0].organizationId;

    // 3. Role check
    const { isOwner, isAdmin, isEmployee } = await getUserRole({
        db,
        userId: user.id,
        organizationId,
    });

    let whereCondition;

    if (isOwner || isAdmin) {
        // OWNER / ADMIN → all active groups in the org
        whereCondition = and(eq(GroupTable.organizationId, organizationId), eq(GroupTable.isActive, true));
    }
    else if (isEmployee) {
        // EMPLOYEE → only active groups where user is a member
        const memberships = await db
            .select({ groupId: GroupUserTable.groupId })
            .from(GroupUserTable)
            .where(eq(GroupUserTable.userId, user.id));

        if (memberships.length === 0) {
            return {
                ok: true,
                data: [],
                message: "No active groups found",
            } as const;
        }

        whereCondition = and(inArray(GroupTable.id, memberships.map((m) => m.groupId)), eq(GroupTable.isActive, true));
    }
    else {
        // No access
        return {
            ok: false,
            errorCode: ErrorCodes.UNAUTHORIZED_USER,
            error: "You do not have permission to view groups of this organization",
            status: 403,
        } as const;
    }

    // 4. Fetch groups
    const groups = await db.select().from(GroupTable).where(whereCondition);

    if (groups.length === 0) {
        return {
            ok: true,
            data: [],
            message: "No active groups found",
        } as const;
    }

    return { ok: true, data: groups } as const;
}
