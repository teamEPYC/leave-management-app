import { and, eq, sql } from "drizzle-orm";
import { LeaveTypeTable, LeaveTypeGroupTable } from "../db/schema";
import { ErrorCodes } from "../../utils/error";
import { WithDbAndEnv } from "../../utils/commonTypes";
import { getUserFromApiKey } from "../auth/auth";
import { getUserRole } from "../user";
import { checkOrganizationIsActive } from "../organization/check-organization";

type UpdateLeaveTypeInput = {
    leaveTypeId: string;
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

type DeactivateLeaveTypeInput = {
    leaveTypeId: string;
    organizationId: string;
};


async function validateLeaveTypeActive({ db, leaveTypeId, organizationId }: { db: any; leaveTypeId: string; organizationId: string }) {
    const leaveType = await db
        .select()
        .from(LeaveTypeTable)
        .where(
            and(
                eq(LeaveTypeTable.id, leaveTypeId),
                eq(LeaveTypeTable.organizationId, organizationId),
                eq(LeaveTypeTable.isActive, true)
            )
        )
        .limit(1);

    if (leaveType.length === 0) {
        return {
            ok: false,
            errorCode: ErrorCodes.INVALID_REQUEST,
            error: "Leave type is not active or not found",
            status: 400,
        } as const;
    }

    return { ok: true, record: leaveType[0] } as const;
}

async function isNameUnique({ db, name, organizationId, leaveTypeId }: { db: any; name: string; organizationId: string; leaveTypeId: string }) {
    const nameConflict = await db
        .select()
        .from(LeaveTypeTable)
        .where(
            and(
                eq(LeaveTypeTable.organizationId, organizationId),
                sql`lower(${LeaveTypeTable.name}) = lower(${name})`,
                sql`${LeaveTypeTable.id} != ${leaveTypeId}`
            )
        )
        .limit(1);

    if (nameConflict.length > 0) {
        return {
            ok: false,
            errorCode: ErrorCodes.ALREADY_EXISTS,
            error: `Leave type '${name}' already exists in this organization`,
            status: 409,
        } as const;
    }

    return { ok: true } as const;
}


export async function updateLeaveType({
    db,
    env,
    apiKey,
    input,
}: WithDbAndEnv<{ apiKey: string; input: UpdateLeaveTypeInput }>) {
    const userRes = await getUserFromApiKey({ db, env, apiKey });
    if (!userRes.ok) return userRes;

    const { isOwner, isAdmin } = await getUserRole({
        db,
        userId: userRes.user.id,
        organizationId: input.organizationId,
    });
    if (!isOwner && !isAdmin) {
        return {
            ok: false,
            errorCode: ErrorCodes.UNAUTHORIZED_USER,
            error: "Only OWNER or ADMIN can update leave types",
            status: 403,
        } as const;
    }

    const orgRes = await checkOrganizationIsActive({ db, organizationId: input.organizationId });
    if (!orgRes.ok) return orgRes;

    const activeCheck = await validateLeaveTypeActive({ db, leaveTypeId: input.leaveTypeId, organizationId: input.organizationId });
    if (!activeCheck.ok) return activeCheck;
    const currentRecord = activeCheck.record;

    if (currentRecord.organizationId !== input.organizationId) {
        return {
            ok: false,
            errorCode: ErrorCodes.INVALID_REQUEST,
            error: "Cannot change organization for an existing leave type",
            status: 400,
        } as const;
    }

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

    const nameCheck = await isNameUnique({
        db,
        name: input.name,
        organizationId: input.organizationId,
        leaveTypeId: input.leaveTypeId,
    });
    if (!nameCheck.ok) return nameCheck;

    await db
        .update(LeaveTypeTable)
        .set({
            name: input.name,
            shortCode: input.shortCode,
            icon: input.icon,
            description: input.description,
            isLimited: input.isLimited,
            limitType: input.limitType ? input.limitType : null,
            limitDays: input.limitDays ? String(input.limitDays) : null,
            appliesToEveryone: input.appliesToEveryone,
            employeeType: input.employeeType,
            updatedAt: new Date(),
        })
        .where(eq(LeaveTypeTable.id, input.leaveTypeId));

    if (input.appliesToEveryone) {
        await db.delete(LeaveTypeGroupTable).where(eq(LeaveTypeGroupTable.leaveTypeId, input.leaveTypeId));
    } else {
        const newGroupIds = [...new Set(input.groupIds || [])];

        const existingGroups = await db
            .select({ groupId: LeaveTypeGroupTable.groupId })
            .from(LeaveTypeGroupTable)
            .where(eq(LeaveTypeGroupTable.leaveTypeId, input.leaveTypeId));

        const existingIds = new Set(existingGroups.map((g) => g.groupId));
        const newIdsSet = new Set(newGroupIds);

        const isDifferent =
            existingIds.size !== newIdsSet.size ||
            [...existingIds].some((id) => !newIdsSet.has(id));

        if (isDifferent) {
            await db.delete(LeaveTypeGroupTable).where(eq(LeaveTypeGroupTable.leaveTypeId, input.leaveTypeId));
            if (newGroupIds.length > 0) {
                await db.insert(LeaveTypeGroupTable).values(
                    newGroupIds.map((gid) => ({
                        leaveTypeId: input.leaveTypeId,
                        groupId: gid,
                    }))
                );
            }
        }
    }
    return { ok: true, data: { leaveTypeId: input.leaveTypeId } } as const;
}





export async function deactivateLeaveType({
    db,
    env,
    apiKey,
    input,
}: WithDbAndEnv<{ apiKey: string; input: DeactivateLeaveTypeInput }>) {
    const userRes = await getUserFromApiKey({ db, env, apiKey });
    if (!userRes.ok) return userRes;

    const { isOwner, isAdmin } = await getUserRole({
        db,
        userId: userRes.user.id,
        organizationId: input.organizationId,
    });
    if (!isOwner && !isAdmin) {
        return {
            ok: false,
            errorCode: ErrorCodes.UNAUTHORIZED_USER,
            error: "Only OWNER or ADMIN can deactivate leave types",
            status: 403,
        } as const;
    }

    const orgRes = await checkOrganizationIsActive({ db, organizationId: input.organizationId });
    if (!orgRes.ok) return orgRes;

    const [leaveType] = await db
        .select()
        .from(LeaveTypeTable)
        .where(
            and(
                eq(LeaveTypeTable.id, input.leaveTypeId),
                eq(LeaveTypeTable.organizationId, input.organizationId)
            )
        )
        .limit(1);

    if (!leaveType) {
        return {
            ok: false,
            errorCode: ErrorCodes.NOT_FOUND,
            error: "Leave type not found for this organization",
            status: 404,
        } as const;
    }

    if (!leaveType.isActive) {
        return {
            ok: false,
            errorCode: ErrorCodes.INVALID_REQUEST,
            error: "Leave type is already inactive",
            status: 400,
        } as const;
    }

    await db
        .update(LeaveTypeTable)
        .set({ isActive: false, updatedAt: new Date() })
        .where(eq(LeaveTypeTable.id, input.leaveTypeId));

    await db
        .update(LeaveTypeGroupTable)
        .set({ isActive: false, updatedAt: new Date() })
        .where(eq(LeaveTypeGroupTable.leaveTypeId, input.leaveTypeId));

    return { ok: true, data: { leaveTypeId: input.leaveTypeId } } as const;
}
