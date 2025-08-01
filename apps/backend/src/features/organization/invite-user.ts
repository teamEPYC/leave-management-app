import { InvitationTable } from "../db/schema";
import { getUserFromApiKey } from "../auth/auth";
import { getRoleIdByName, getUserRole } from "../user";
import { ErrorCodes } from "../../utils/error";
import { WithDbAndEnv } from "../../utils/commonTypes";
import { eq, and, gt } from "drizzle-orm";

export async function inviteUserToOrg({
    db,
    env,
    apiKey,
    organizationId,
    input,
}: WithDbAndEnv<{
    apiKey: string;
    organizationId: string;
    input: { email: string; roleId?: string; groups?: string[] };
}>) {
    // 1. Auth check
    const userRes = await getUserFromApiKey({ db, env, apiKey });
    if (!userRes.ok) {
        return { ok: false, error: userRes.error, status: 401 } as const;
    }

    const { isOwner, isAdmin } = await getUserRole({
        db,
        userId: userRes.user.id,
        organizationId,
    });

    if (!isOwner && !isAdmin) {
        return {
            ok: false,
            errorCode: ErrorCodes.UNAUTHORIZED_USER,
            error: "You are not authorized to invite users to this organization",
            status: 403,
        } as const;
    }

    // 2. Check for existing active invite
    const now = new Date();
    // 1. Check for existing active invite in the SAME org
    const existingInvite = await db
        .select()
        .from(InvitationTable)
        .where(
            and(
                eq(InvitationTable.organizationId, organizationId),
                eq(InvitationTable.email, input.email.toLowerCase()),
                gt(InvitationTable.expiresAt, now)
            )
        )
        .limit(1);

    if (existingInvite.length > 0) {
        const invite = existingInvite[0];
        return {
            ok: true,
            data: {
                invitationId: invite.id,
                expiresAt: invite.expiresAt.toISOString(),
                alreadyExists: true
            }
        } as const;
    }

    let roleId = input.roleId;
    if (!roleId) {
        roleId = await getRoleIdByName({
            db,
            roleName: "EMPLOYEE",
        });
    }

    // 2. Otherwise → always create a new invite
    const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const [invitation] = await db
        .insert(InvitationTable)
        .values({
            organizationId,
            email: input.email.toLowerCase(),
            status: "SENT",
            expiresAt,
            roleId,
        })
        .returning();

    return {
        ok: true,
        data: {
            invitationId: invitation.id,
            expiresAt: expiresAt.toISOString(),
            alreadyExists: false
        }
    } as const;
}