import { and, eq, sql } from "drizzle-orm";
import { LeaveTypeTable, LeaveTypeGroupTable } from "../db/schema";
import { ErrorCodes } from "../../utils/error";
import { WithDbAndEnv } from "../../utils/commonTypes";
import { getUserFromApiKey } from "../auth/auth";
import { getUserRole } from "../user";
import { checkOrganizationIsActive } from "../organization/check-organization";

type CreateLeaveTypeInput = {
    organizationId: string;
    name: string;
    shortCode: string;
    icon?: string;
    description?: string;
    isLimited: boolean;
    limitType?: "YEAR" | "QUARTER" | "MONTH";
    limitDays?: number;
    appliesToEveryone: boolean;
    employeeType: "FULL_TIME" | "PART_TIME";
    groupIds?: string[];
};

export async function createLeaveType({
    db,
    env,
    apiKey,
    input,
}: WithDbAndEnv<{ apiKey: string; input: CreateLeaveTypeInput }>) {
    // 1. Auth + role check
    const userRes = await getUserFromApiKey({ db, env, apiKey });
    if (!userRes.ok) {
        return userRes;
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
            error: "Only OWNER or ADMIN can create leave types",
            status: 403,
        } as const;
    }

    const orgRes = await checkOrganizationIsActive({ db, organizationId: input.organizationId, env });
    if (!orgRes.ok) {
        return {
            ok: false,
            errorCode: ErrorCodes.INVALID_REQUEST,
            error: "Organization not found or inactive",
            status: 400,
        } as const;
    }


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
        input.limitType = undefined;
        input.limitDays = undefined;
    }

    // 3. Uniqueness checks — name
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
            status: 400,
        } as const;
    }

    // 4. Insert leave type + groups in transaction
    const [leaveType] = await db
        .insert(LeaveTypeTable)
        .values({
            organizationId: input.organizationId,
            name: input.name,
            shortCode: input.shortCode,
            icon: input.icon,
            description: input.description,
            isLimited: input.isLimited,
            limitType: input.limitType !== undefined && input.limitType !== null
                ? input.limitType
                : null,
            limitDays: input.limitDays !== undefined && input.limitDays !== null
                ? String(input.limitDays)
                : null,
            appliesToEveryone: input.appliesToEveryone,
            employeeType: input.employeeType,
        })
        .returning();


    if (!input.appliesToEveryone && input.groupIds && input.groupIds.length > 0) {
        const groupRows = input.groupIds.map((gid) => ({
            leaveTypeId: leaveType.id,
            groupId: gid,
        }));
        await db.insert(LeaveTypeGroupTable).values(groupRows);
    }

    return { ok: true, data: { leaveTypeId: leaveType.id } } as const;
}
