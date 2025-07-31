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

    // 2. Get roleId(s) for OWNER + ADMIN
    const roleRes = await db
        .select()
        .from(RoleTable)
        .where(inArray(RoleTable.name, ["OWNER", "ADMIN"]));

    const allowedRoleIds = roleRes.map((r) => r.id);

    // 3. Check if user is OWNER or ADMIN of this org
    const membership = await db
        .select()
        .from(UserOrganizationTable)
        .where(
            and(
                eq(UserOrganizationTable.userId, user.id),
                eq(UserOrganizationTable.organizationId, organizationId),
                inArray(UserOrganizationTable.roleId, allowedRoleIds)
            )
        );

    if (membership.length === 0) {
        return {
            ok: false,
            errorCode: ErrorCodes.UNAUTHORIZED,
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
