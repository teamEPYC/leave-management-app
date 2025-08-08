import { and, eq } from "drizzle-orm";
import { GroupTable, UserOrganizationTable } from "../db/schema";
import { ErrorCodes } from "../../utils/error";
import { WithDb, WithDbAndEnv } from "../../utils/commonTypes";

export async function ensureUniqueGroupName({
    db,
    organizationId,
    groupName,
}: WithDbAndEnv<{ organizationId: string; groupName: string }>) {
    const existingGroup = await db
        .select()
        .from(GroupTable)
        .where(
            and(
                eq(GroupTable.organizationId, organizationId),
                eq(GroupTable.name, groupName)
            )
        )
        .limit(1);

    if (existingGroup.length > 0) {
        return {
            ok: false,
            errorCode: ErrorCodes.ALREADY_EXISTS,
            error: "A group with this name already exists in the organization",
            status: 400,
        } as const;
    }

    return { ok: true } as const;
}

// 3. Validate users belong to same org
export async function ensureUsersInOrganization({
    db,
    organizationId,
    userIds,
}: WithDbAndEnv<{ organizationId: string; userIds: string[] }>) {
    if (!userIds || userIds.length === 0) return { ok: true } as const;

    const memberships = await db
        .select({ userId: UserOrganizationTable.userId })
        .from(UserOrganizationTable)
        .where(eq(UserOrganizationTable.organizationId, organizationId));

    const memberSet = new Set(memberships.map((m) => m.userId));
    const invalidUsers = userIds.filter((id) => !memberSet.has(id));

    if (invalidUsers.length > 0) {
        return {
            ok: false,
            errorCode: ErrorCodes.INVALID_USER,
            error: `Some users are not part of this organization: ${invalidUsers.join(", ")}`,
            status: 400,
        } as const;
    }

    return { ok: true } as const;
}



export async function getActiveGroupById({
    db,
    groupId,
}: WithDb<{ groupId: string }>) {
    const group = await db
        .select()
        .from(GroupTable)
        .where(and(eq(GroupTable.id, groupId), eq(GroupTable.isActive, true)))
        .limit(1);

    if (group.length === 0) {
        return {
            ok: false,
            errorCode: ErrorCodes.NOT_FOUND,
            error: "Group not found or already inactive",
            status: 404,
        } as const;
    }

    return {
        ok: true,
        group: group[0],
    } as const;
}
