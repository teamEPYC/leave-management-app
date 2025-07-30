import { eq } from "drizzle-orm";
import {
    OrganizationTable,
    RoleTable,
    UserOrganizationTable,
    UserTable,
} from "../db/schema";
import { WithDbAndEnv } from "../../utils/commonTypes";
import { ErrorCodes } from "../../utils/error";
import { getUserFromApiKey } from "../auth/auth";

type Input = {
    apiKey: string;
    input: {
        name: string;
        description: string;
        domain: string;
    };
};

export async function createOrganizationAsOwner({
    db,
    env,
    apiKey,
    input,
}: WithDbAndEnv<Input>) {
    // 1. Find user by API key
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



    // 2. Get OWNER role
    const roleRes = await db
        .select({ id: RoleTable.id })
        .from(RoleTable)
        .where(eq(RoleTable.name, "OWNER"))
        .limit(1);

    if (roleRes.length === 0) {
        return {
            ok: false,
            error: "OWNER role not found",
            status: 500,
        } as const;
    }

    const ownerRoleId = roleRes[0].id;

    // 3. Create organization
    const [org] = await db
        .insert(OrganizationTable)
        .values({
            name: input.name,
            description: input.description,
            domain: input.domain,
            createdBy: user.id,
        })
        .returning();

    // 4. Link user as OWNER
    await db.insert(UserOrganizationTable).values({
        userId: user.id,
        organizationId: org.id,
        roleId: ownerRoleId,
        isOwner: true,
    });

    return {
        ok: true,
        data: {
            organizationId: org.id,
        },
    } as const;
}
