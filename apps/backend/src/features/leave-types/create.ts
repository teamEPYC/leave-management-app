import { and, eq, sql } from "drizzle-orm";
import { ErrorCodes } from "../../utils/error";
import { LeaveTypeGroupTable, LeaveTypeTable } from "../db/schema";
import { checkOrganizationIsActive } from "../organization/check-organization";
import { getUserRole } from "../user";
import { getUserFromApiKey } from "../auth/auth";
import { WithDbAndEnv } from "../../utils/commonTypes";

export type CreateLeaveTypeInput = {
    organizationId: string;
    name: string;
    shortCode: string;
    icon: string | null;
    description: string | null;
    isLimited: boolean;
    limitType: "YEAR" | "QUARTER" | "MONTH" | null;
    limitDays: number | null;
    appliesToEveryone: boolean;
    employeeType: "FULL_TIME" | "PART_TIME";
    groupIds: string[] | null;
}

export async function createLeaveType({
    db,
    env,
    apiKey,
    input,
}: WithDbAndEnv<{ apiKey: string; input: CreateLeaveTypeInput }>) {
    // 1. Auth + role check
    const userRes = await getUserFromApiKey({ db, env, apiKey });
    if (!userRes.ok) return userRes;
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
            error: "Only OWNER or ADMIN can create leave types",
            status: 403,
        } as const;
    }

    const orgRes = await checkOrganizationIsActive({ db, organizationId: input.organizationId });
    if (!orgRes.ok) return orgRes;

    // 2. Limited/Unlimited validation
    if (input.isLimited) {
        if (!input.limitType || !input.limitDays || input.limitDays <= 0) {
            return {
                ok: false,
                errorCode: ErrorCodes.INVALID_REQUEST,
                error: "For limited leave types, limitType and positive limitDays are required",
                status: 400,
            } as const;
        }
    } else {
        input.limitType = null;
        input.limitDays = null;
    }

    // 3. Name uniqueness check (case-insensitive)
    const existingName = await db
        .select()
        .from(LeaveTypeTable)
        .where(
            and(
                eq(LeaveTypeTable.organizationId, input.organizationId),
                sql`lower(${LeaveTypeTable.name}) = lower(${input.name})`
            )
        )
        .limit(1);

    if (existingName.length > 0) {
        return {
            ok: false,
            errorCode: ErrorCodes.ALREADY_EXISTS,
            error: `Leave type '${input.name}' already exists in this organization`,
            status: 409, // conflict
        } as const;
    }

    // 4. Insert + optional group assignments
    try {
        const [leaveType] = await db
            .insert(LeaveTypeTable)
            .values({
                organizationId: input.organizationId,
                name: input.name,
                shortCode: input.shortCode, // can be duplicate
                icon: input.icon,
                description: input.description,
                isLimited: input.isLimited,
                limitType: input.limitType ? input.limitType : null,
                limitDays: input.limitDays ? String(input.limitDays) : null,
                appliesToEveryone: input.appliesToEveryone,
                employeeType: input.employeeType,
            })
            .returning();

        if (!input.appliesToEveryone && input.groupIds?.length) {
            const groupRows = input.groupIds.map((gid) => ({
                leaveTypeId: leaveType.id,
                groupId: gid,
            }));
            await db.insert(LeaveTypeGroupTable).values(groupRows);
        }

        return { ok: true, data: { leaveTypeId: leaveType.id } } as const;

    } catch (err: any) {
        console.error("Create leave type error:", err);
        return {
            ok: false,
            errorCode: ErrorCodes.DB_ERROR,
            error: "Failed to create leave type — possibly duplicate name or invalid data",
            status: 400,
        } as const;
    }
}
