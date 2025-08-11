import { and, eq, inArray } from "drizzle-orm";
import { GroupTable, GroupUserTable } from "../db/schema";
import { ErrorCodes } from "../../utils/error";
import { WithDbAndEnv } from "../../utils/commonTypes";
import { getUserRole } from "../user";
import { ensureUniqueGroupName, ensureUsersInOrganization } from "./helpers"; // group-specific helpers
import { getUserFromApiKey } from "../auth/auth";

type CreateGroupInput = {
    organizationId: string;
    name: string;
    description?: string;
    icon?: string;
    approvalManagerIds?: string[];
    memberIds?: string[];
};

export async function createGroup({
    db,
    env,
    apiKey,
    input,
}: WithDbAndEnv<{ apiKey: string; input: CreateGroupInput }>) {
    // 1. Auth + Role check → must be OWNER or ADMIN in this org
    const userRes = await getUserFromApiKey({ db, env, apiKey });
    if (!userRes.ok) {
        return { ok: false, ...userRes, status: 401 } as const;
    }
    const user = userRes.user;

    const { isOwner, isAdmin } = await getUserRole({
        db,
        userId: user.id,
        organizationId: input.organizationId,
    });
    if (!isOwner && !isAdmin) {
        return {
            ok: false,
            errorCode: ErrorCodes.UNAUTHORIZED_USER,
            error: "Only OWNER or ADMIN can create groups",
            status: 403,
        } as const;
    }

    // 2. Ensure group name is unique in the organization
    const nameCheck = await ensureUniqueGroupName({
        db,
        env,
        organizationId: input.organizationId,
        groupName: input.name,
    });
    if (!nameCheck.ok) return nameCheck;

    // 3. Validate all provided users belong to the same organization
    const userValidation = await ensureUsersInOrganization({
        db,
        env,
        organizationId: input.organizationId,
        userIds: [
            ...(input.approvalManagerIds || []),
            ...(input.memberIds || []),
        ],
    });
    if (!userValidation.ok) return userValidation;

    // 4. Create group
    const [group] = await db
        .insert(GroupTable)
        .values({
            organizationId: input.organizationId,
            name: input.name,
            description: input.description,
            icon: input.icon,
            createdBy: user.id,
        })
        .returning();

    // 5. Deduplicate & remove overlaps
    const approvalManagers = new Set(input.approvalManagerIds || []);
    const members = new Set(input.memberIds || []);

    // Remove approval managers from members list
    for (const managerId of approvalManagers) {
        members.delete(managerId);
    }

    // 6. Check DB for existing memberships in this org+group
    const existing = await db
        .select({ userId: GroupUserTable.userId })
        .from(GroupUserTable)
        .innerJoin(GroupTable, eq(GroupTable.id, GroupUserTable.groupId))
        .where(
            and(
                eq(GroupTable.organizationId, input.organizationId),
                eq(GroupUserTable.groupId, group.id),
                inArray(
                    GroupUserTable.userId,
                    [...approvalManagers, ...members]
                )
            )
        );

    const existingUserIds = new Set(existing.map((e) => e.userId));

    // Filter out existing ones
    const filteredApprovalManagers = [...approvalManagers].filter(
        (uid) => !existingUserIds.has(uid)
    );
    const filteredMembers = [...members].filter(
        (uid) => !existingUserIds.has(uid)
    );

    // 7. Insert approval managers
    if (filteredApprovalManagers.length) {
        const managerRows = filteredApprovalManagers.map((uid) => ({
            groupId: group.id,
            userId: uid,
            isApprovalManager: true,
            addedBy: user.id,
        }));
        await db.insert(GroupUserTable).values(managerRows);
    }

    // 8. Insert members
    if (filteredMembers.length) {
        const memberRows = filteredMembers.map((uid) => ({
            groupId: group.id,
            userId: uid,
            isApprovalManager: false,
            addedBy: user.id,
        }));
        await db.insert(GroupUserTable).values(memberRows);
    }

    return {
        ok: true,
        data: {
            groupId: group.id,
        },
    } as const;
}
