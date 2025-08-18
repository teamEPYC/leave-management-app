import { eq, and, inArray } from "drizzle-orm";
import {
    OrganizationTable,
    RoleTable,
    UserOrganizationTable,
    UserTable,
} from "../db/schema";
import { ErrorCodes } from "../../utils/error";
import { WithDbAndEnv } from "../../utils/commonTypes";
import { getUserFromApiKey } from "../auth/auth";
import { getUserRole } from "../user";

type Input = {
    apiKey: string;
    organizationId: string;
    input: {
        name?: string;
        description?: string;
        icon?: string;
        domain?: string;
        setting?: Record<string, any>;
    };
};

export async function updateOrganization({
    db,
    env,
    apiKey,
    organizationId,
    input,
}: WithDbAndEnv<Input>) {
    // 1. Get user by API key
    const userResult = await getUserFromApiKey({ apiKey, db, env });

    if (!userResult.ok) {
        return {
            ok: false,
            errorCode: userResult.errorCode,
            error: userResult.error,
            status: 401,
        };
    }

    const user = userResult.user;


    const { isOwner, isAdmin, hasAccess } = await getUserRole({
        db,
        userId: user.id,
        organizationId,
    });

    if (!hasAccess || (!isOwner && !isAdmin)) {
        return {
            ok: false,
            errorCode: ErrorCodes.UNAUTHORIZED_USER,
            error: "You are not authorized to update this organization",
            status: 403,
        } as const;
    }


    // 4. Perform update
    const [updated] = await db
        .update(OrganizationTable)
        .set({
            ...(input.name !== undefined && { name: input.name }),
            ...(input.description !== undefined && { description: input.description }),
            ...(input.icon !== undefined && { icon: input.icon }),
            ...(input.domain !== undefined && { domain: input.domain }),
            ...(input.setting !== undefined && { setting: input.setting }),
            updatedAt: new Date(),
        })
        .where(eq(OrganizationTable.id, organizationId))
        .returning();

    return {
        ok: true,
        data: {
            organizationId: updated.id,
        },
    } as const;
}




export async function deactivateOrganization({
    db,
    env,
    apiKey,
    organizationId,
}: WithDbAndEnv<{ apiKey: string; organizationId: string }>) {
    const userRes = await getUserFromApiKey({ apiKey, db, env });

    if (!userRes.ok) {
        return {
            ok: false,
            errorCode: userRes.errorCode,
            error: userRes.error,
            httpStatus: 401,
        } as const;
    }

    const user = userRes.user;

    const { isOwner } = await getUserRole({
        db,
        userId: user.id,
        organizationId,
    });

    if (!isOwner) {
        return {
            ok: false,
            errorCode: "UNAUTHORIZED_USER",
            error: "Only OWNER can deactivate the organization",
            httpStatus: 403,
        } as const;
    }

    const [updated] = await db
        .update(OrganizationTable)
        .set({
            isActive: false,
            updatedAt: new Date(),
        })
        .where(eq(OrganizationTable.id, organizationId))
        .returning();

    await db
        .update(UserOrganizationTable)
        .set({
            isActive: false,
            updatedAt: new Date(),
        })
        .where(eq(UserOrganizationTable.organizationId, organizationId));


    return {
        ok: true,
        data: {
            organizationId: updated.id,
            deactivatedAt: updated.updatedAt.toISOString(),
        },
    } as const;
}