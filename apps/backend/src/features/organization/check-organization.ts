import { and, eq } from "drizzle-orm";
import { OrganizationTable } from "../db/schema";
import { ErrorCodes } from "../../utils/error";
import { WithDbAndEnv } from "../../utils/commonTypes";

export async function checkOrganizationIsActive({
    db,
    organizationId,
}: WithDbAndEnv<{ organizationId: string }>) {
    const org = await db
        .select({ id: OrganizationTable.id, isActive: OrganizationTable.isActive })
        .from(OrganizationTable)
        .where(
            and(
                eq(OrganizationTable.id, organizationId),
                eq(OrganizationTable.isActive, true)
            )
        )
        .limit(1);

    if (org.length === 0) {
        return {
            ok: false,
            errorCode: ErrorCodes.INVALID_REQUEST,
            error: "Organization not found or inactive",
            status: 400,
        } as const;
    }

    return { ok: true } as const;
}
