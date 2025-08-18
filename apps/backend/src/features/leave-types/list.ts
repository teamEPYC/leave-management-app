import { eq, and } from "drizzle-orm";
import { LeaveTypeTable, LeaveTypeGroupTable, GroupTable } from "../db/schema";
import { getUserFromApiKey } from "../auth/auth";
import { checkOrganizationIsActive } from "../organization/check-organization";
import { ErrorCodes } from "../../utils/error";
import { WithDbAndEnv } from "../../utils/commonTypes";

type ListLeaveTypesInput = {
    organizationId: string;
};

export async function listLeaveTypes({
    db,
    env,
    apiKey,
    input,
}: WithDbAndEnv<{ apiKey: string; input: ListLeaveTypesInput }>) {
    // 1. Auth check
    const userRes = await getUserFromApiKey({ db, env, apiKey });
    if (!userRes.ok) return userRes;

    // 2. Check org is active
    const orgRes = await checkOrganizationIsActive({ db, organizationId: input.organizationId });
    if (!orgRes.ok) return orgRes;

    // 3. Fetch leave types
    const leaveTypes = await db
        .select()
        .from(LeaveTypeTable)
        .where(
            and(
                eq(LeaveTypeTable.organizationId, input.organizationId),
                eq(LeaveTypeTable.isActive, true)
            )
        );

    if (leaveTypes.length === 0) {
        return { ok: true, data: [] as const };
    }

    // 4. Fetch group mappings for all leave types
    const leaveTypeIds = leaveTypes.map((lt) => lt.id);

    const groupMappings = await db
        .select({
            leaveTypeId: LeaveTypeGroupTable.leaveTypeId,
            groupId: GroupTable.id,
            groupName: GroupTable.name,
            groupIcon: GroupTable.icon,
        })
        .from(LeaveTypeGroupTable)
        .innerJoin(GroupTable, eq(LeaveTypeGroupTable.groupId, GroupTable.id))
        .where(eq(GroupTable.isActive, true));

    // 5. Attach groups to each leave type
    const groupedByLeaveType = leaveTypes.map((lt) => {
        const groups = groupMappings.filter((g) => g.leaveTypeId === lt.id);
        return { ...lt, groups };
    });

    return { ok: true, data: groupedByLeaveType };
}
