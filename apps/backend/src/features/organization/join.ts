import { eq } from "drizzle-orm";
import { GroupUserTable, InvitationTable, UserOrganizationTable, UserTable } from "../db/schema";
import { getUserFromApiKey } from "../auth/auth";
import { ErrorCodes } from "../../utils/error";
import { WithDbAndEnv } from "../../utils/commonTypes";
import { addUserToOrganization, getRoleIdByName, getUserRole, getValidInvitation } from "../user";

export async function joinOrganization({
    db,
    env,
    apiKey,
    organizationId,
    invitationId,
}: WithDbAndEnv<{ apiKey: string; organizationId: string; invitationId?: string }>) {
    // 1. Authenticate user
    const userRes = await getUserFromApiKey({ db, env, apiKey });
    if (!userRes.ok) {
        return { ok: false, error: userRes.error, status: 401 } as const;
    }
    const user = userRes.user;

    // 2. Check if already a member of this organization
    const { hasAccess } = await getUserRole({
        db,
        userId: user.id,
        organizationId,
    });
    if (hasAccess) {
        return {
            ok: true,
            data: {
                organizationId,
                joinedAt: new Date().toISOString(),
                alreadyMember: true,
                joinType: invitationId ? "invite" : "domain",
            },
        } as const;
    }

    // 3. Explicit Invitation Join
    if (invitationId) {
        const invite = await getValidInvitation({
            db,
            organizationId,
            email: user.email,
            invitationId,
        });

        if (!invite) {
            return {
                ok: false,
                errorCode: ErrorCodes.INVALID_INVITATION,
                error: "Invalid or expired invitation for this organization",
                status: 400,
            } as const;
        }

        // Add user to organization with role from invite
        await addUserToOrganization({
            db,
            userId: user.id,
            organizationId,
            roleId: invite.roleId,
            isOwner: false,
        });

        // Set employeeType in users table
        await db
            .update(UserTable)
            .set({
                employeeType: invite.employeeType,
                updatedAt: new Date(),
            })
            .where(eq(UserTable.id, user.id));

        // Add to groups if invite has them
        if (invite.groups && Array.isArray(invite.groups) && invite.groups.length > 0) {
            const groupRows = invite.groups.map((gid: string) => ({
                groupId: gid,
                userId: user.id,
                isApprovalManager: false,
                addedBy: user.id, // or inviter's id
            }));
            await db.insert(GroupUserTable).values(groupRows);
        }

        // Mark invitation as accepted
        await db
            .update(InvitationTable)
            .set({ status: "ACCEPT", updatedAt: new Date() })
            .where(eq(InvitationTable.id, invite.id));

        return {
            ok: true,
            data: {
                organizationId,
                joinedAt: new Date().toISOString(),
                alreadyMember: false,
                joinType: "invite",
            },
        } as const;
    }

    // 4. Domain Join (with auto-invite detection)
    let finalRoleId: string;
    const autoInvite = await getValidInvitation({
        db,
        organizationId,
        email: user.email,
    });

    if (autoInvite) {
        // Use invite role and mark as accepted
        finalRoleId = autoInvite.roleId;
        await db
            .update(InvitationTable)
            .set({ status: "ACCEPT", updatedAt: new Date() })
            .where(eq(InvitationTable.id, autoInvite.id));
    } else {
        // No invite found → default to EMPLOYEE role
        finalRoleId = await getRoleIdByName({ db, roleName: "EMPLOYEE" });
    }

    // Add user to organization
    await addUserToOrganization({
        db,
        userId: user.id,
        organizationId,
        roleId: finalRoleId,
        isOwner: false,
    });

    return {
        ok: true,
        data: {
            organizationId,
            joinedAt: new Date().toISOString(),
            alreadyMember: false,
            joinType: autoInvite ? "invite-auto" : "domain",
        },
    } as const;
}