import { and, eq, inArray } from "drizzle-orm";
import { GroupTable, GroupUserTable } from "../db/schema";
import { ErrorCodes } from "../../utils/error";
import { WithDbAndEnv } from "../../utils/commonTypes";
import { getUserFromApiKey } from "../auth/auth";
import { getUserRole } from "../user";
import { ensureUniqueGroupName, ensureUsersInOrganization, getActiveGroupById } from "./helpers";

type EditGroupInput = {
    name?: string;
    description?: string;
    icon?: string;
    approvalManagerIds?: string[];
    memberIds?: string[];
};

export async function editGroup({
    db,
    env,
    apiKey,
    groupId,
    input,
}: WithDbAndEnv<{ apiKey: string; groupId: string; input: EditGroupInput }>) {
    // 1. Auth + get user
    const userRes = await getUserFromApiKey({ db, env, apiKey });
    if (!userRes.ok) return { ok: false, ...userRes, status: 401 } as const;
    const user = userRes.user;

    // 2. Find group
    // const group = await db
    //     .select()
    //     .from(GroupTable)
    //     .where(and(eq(GroupTable.id, groupId), eq(GroupTable.isActive, true)))
    //     .limit(1);

    // if (group.length === 0) {
    //     return {
    //         ok: false,
    //         errorCode: ErrorCodes.NOT_FOUND,
    //         error: "Group not found or inactive",
    //         status: 404,
    //     } as const;
    // }


    const groupRes = await getActiveGroupById({ db, groupId });
    if (!groupRes.ok) return groupRes;
    const group = groupRes.group;

    // 3. Role check — must be OWNER or ADMIN
    const { isOwner, isAdmin } = await getUserRole({
        db,
        userId: user.id,
        organizationId: group.organizationId,
    });

    if (!isOwner && !isAdmin) {
        return {
            ok: false,
            errorCode: ErrorCodes.UNAUTHORIZED_USER,
            error: "Only OWNER or ADMIN can edit groups",
            status: 403,
        } as const;
    }

    // 4. If updating name → ensure uniqueness
    if (input.name && input.name !== group.name) {
        const nameCheck = await ensureUniqueGroupName({
            db,
            env,
            organizationId: group.organizationId,
            groupName: input.name,
        });
        if (!nameCheck.ok) return nameCheck;
    }

    // 5. If updating members → validate org membership
    if (input.approvalManagerIds || input.memberIds) {
        const userValidation = await ensureUsersInOrganization({
            db,
            env,
            organizationId: group.organizationId,
            userIds: [
                ...(input.approvalManagerIds || []),
                ...(input.memberIds || []),
            ],
        });
        if (!userValidation.ok) return userValidation;
    }

    // 6. Transaction for atomic update
    await db.transaction(async (tx) => {
        // Update group metadata
        if (input.name || input.description || input.icon) {
            await db
                .update(GroupTable)
                .set({
                    ...(input.name && { name: input.name }),
                    ...(input.description && { description: input.description }),
                    ...(input.icon && { icon: input.icon }),
                    updatedAt: new Date(),
                })
                .where(eq(GroupTable.id, groupId));
        }

        // --- Additive membership update ---
        // --- Sync membership update ---
        if (input.approvalManagerIds || input.memberIds) {
            // 1. Fetch existing memberships from DB
            const existing = await tx
                .select({
                    userId: GroupUserTable.userId,
                    isApprovalManager: GroupUserTable.isApprovalManager,
                })
                .from(GroupUserTable)
                .where(eq(GroupUserTable.groupId, groupId));

            const existingMap = new Map(
                existing.map((m) => [m.userId, m.isApprovalManager])
            );

            // 2. Build desired state from input
            const approvalManagers = new Set(input.approvalManagerIds || []);
            const members = new Set(input.memberIds || []);

            // Ensure no overlaps — approval managers take priority
            for (const managerId of approvalManagers) {
                members.delete(managerId);
            }

            const desiredMap = new Map<string, boolean>();
            for (const uid of approvalManagers) desiredMap.set(uid, true);
            for (const uid of members) desiredMap.set(uid, false);

            // 3. Determine removals, additions, and role changes
            const usersToRemove: string[] = [];
            const usersToAdd: { userId: string; isApprovalManager: boolean }[] = [];
            const usersToRoleChange: { userId: string; isApprovalManager: boolean }[] = [];

            // Check removals and role changes
            for (const [uid, isApprovalManager] of existingMap.entries()) {
                if (!desiredMap.has(uid)) {
                    // User is no longer in the group → remove
                    usersToRemove.push(uid);
                } else if (desiredMap.get(uid) !== isApprovalManager) {
                    // User is in the group but role changed → update
                    usersToRoleChange.push({
                        userId: uid,
                        isApprovalManager: desiredMap.get(uid)!,
                    });
                }
            }

            // Check additions
            for (const [uid, isApprovalManager] of desiredMap.entries()) {
                if (!existingMap.has(uid)) {
                    usersToAdd.push({ userId: uid, isApprovalManager });
                }
            }

            // 4. Apply changes
            if (usersToRemove.length > 0) {
                await db
                    .delete(GroupUserTable)
                    .where(
                        and(
                            eq(GroupUserTable.groupId, groupId),
                            inArray(GroupUserTable.userId, usersToRemove)
                        )
                    );
            }

            if (usersToRoleChange.length > 0) {
                for (const change of usersToRoleChange) {
                    await db
                        .update(GroupUserTable)
                        .set({
                            isApprovalManager: change.isApprovalManager,
                            updatedAt: new Date(),
                        })
                        .where(
                            and(
                                eq(GroupUserTable.groupId, groupId),
                                eq(GroupUserTable.userId, change.userId)
                            )
                        );
                }
            }

            if (usersToAdd.length > 0) {
                await db.insert(GroupUserTable).values(
                    usersToAdd.map((u) => ({
                        groupId,
                        userId: u.userId,
                        isApprovalManager: u.isApprovalManager,
                        addedBy: user.id,
                    }))
                );
            }
        }

    });

    return {
        ok: true,
        data: { groupId },
    } as const;
}




export async function deactivateGroup({
    db,
    env,
    apiKey,
    groupId,
}: WithDbAndEnv<{ apiKey: string; groupId: string }>) {
    // 1. Auth
    const userRes = await getUserFromApiKey({ db, env, apiKey });
    if (!userRes.ok) return { ok: false, ...userRes, status: 401 } as const;
    const user = userRes.user;

    // 2. Find group (must be active)
    const groupRes = await getActiveGroupById({ db, groupId });
    if (!groupRes.ok) return groupRes;
    const group = groupRes.group;


    // 3. Role check
    const { isOwner, isAdmin } = await getUserRole({
        db,
        userId: user.id,
        organizationId: group.organizationId,
    });

    if (!isOwner && !isAdmin) {
        return {
            ok: false,
            errorCode: ErrorCodes.UNAUTHORIZED_USER,
            error: "Only OWNER or ADMIN can deactivate groups",
            status: 403,
        } as const;
    }

    // 4. Update group
    await db
        .update(GroupTable)
        .set({ isActive: false, updatedAt: new Date() })
        .where(eq(GroupTable.id, groupId));

    return {
        ok: true,
        data: { groupId },
    } as const;
}
