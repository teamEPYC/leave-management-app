import { and, eq, sql, inArray } from "drizzle-orm";
import { GroupUserTable, LeaveBalanceAdjustmentTable, LeaveBalanceTable, LeaveTypeGroupTable, LeaveTypeTable, UserTable } from "../db/schema";
import { WithDbAndEnv } from "../../utils/commonTypes";
import { connectDb } from "../db/connect";

// Define proper types for the schema
type LeaveType = typeof LeaveTypeTable.$inferSelect;
type User = typeof UserTable.$inferSelect;

// Helper function to calculate allocated leave days based on the leave type
const calculateAllocatedDays = (leaveType: LeaveType): number | null => {
    if (leaveType.isLimited === false) {
        return null; // Unlimited leave
    }

    const limitDays = Number(leaveType.limitDays) || 0;
    let allocatedDays = 0;

    if (leaveType.limitType === "YEAR") {
        allocatedDays = limitDays; // Yearly leave
    } else if (leaveType.limitType === "QUARTER") {
        allocatedDays = limitDays / 4; // Quarterly leave
    } else if (leaveType.limitType === "MONTH") {
        allocatedDays = limitDays / 12; // Monthly leave
    }

    return allocatedDays;
};

// Helper function to get users in groups for the given leave type
const handleGroupBasedLeave = async (db: ReturnType<typeof connectDb>, leaveTypeId: string): Promise<string[]> => {
    // First get the group IDs for this leave type
    const leaveTypeGroups = await db
        .select({ groupId: LeaveTypeGroupTable.groupId })
        .from(LeaveTypeGroupTable)
        .where(eq(LeaveTypeGroupTable.leaveTypeId, leaveTypeId));

    if (leaveTypeGroups.length === 0) {
        return [];
    }

    const groupIds = leaveTypeGroups.map(ltg => ltg.groupId);

    // Then get users in those groups
    const groupUsers = await db
        .select({ userId: GroupUserTable.userId })
        .from(GroupUserTable)
        .where(
            and(
                inArray(GroupUserTable.groupId, groupIds),
                eq(GroupUserTable.isActive, true)
            )
        );

    return groupUsers.map((gu) => gu.userId);
};

// Helper function to apply leave for a user
const applyLeaveForUser = async (
    db: ReturnType<typeof connectDb>,
    userId: string,
    organizationId: string,
    leaveTypeId: string,
    periodStart: Date,
    periodEnd: Date,
    allocatedDays: number | null
) => {
    const existingBalance = await db
        .select()
        .from(LeaveBalanceTable)
        .where(
            and(
                eq(LeaveBalanceTable.userId, userId),
                eq(LeaveBalanceTable.leaveTypeId, leaveTypeId),
                eq(LeaveBalanceTable.periodStart, periodStart),
                eq(LeaveBalanceTable.periodEnd, periodEnd)
            )
        )
        .limit(1);

    if (existingBalance.length > 0) {
        await db
            .update(LeaveBalanceTable)
            .set({
                allocatedDays: allocatedDays?.toString() || "0",
                updatedAt: new Date()
            })
            .where(eq(LeaveBalanceTable.id, existingBalance[0].id));
    } else {
        const insertData = {
            userId,
            organizationId,
            leaveTypeId,
            periodStart,
            periodEnd,
            allocatedDays: allocatedDays?.toString() || "0",
            usedDays: "0",
            adjustedDays: "0",
            carriedForwardDays: "0",
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        await db.insert(LeaveBalanceTable).values(insertData);
    }
};

// Helper function to apply any admin-added extra leave days
const applyExtraLeave = async (db: ReturnType<typeof connectDb>, userId: string, leaveTypeId: string): Promise<number> => {
    // First get the leave balance ID for this user and leave type
    const leaveBalance = await db
        .select({ id: LeaveBalanceTable.id })
        .from(LeaveBalanceTable)
        .where(
            and(
                eq(LeaveBalanceTable.userId, userId),
                eq(LeaveBalanceTable.leaveTypeId, leaveTypeId)
            )
        )
        .limit(1);

    if (leaveBalance.length === 0) {
        return 0;
    }

    const extraLeave = await db
        .select({ addedDays: LeaveBalanceAdjustmentTable.addedDays })
        .from(LeaveBalanceAdjustmentTable)
        .where(
            and(
                eq(LeaveBalanceAdjustmentTable.leaveBalanceId, leaveBalance[0].id),
                eq(LeaveBalanceAdjustmentTable.isActive, true)
            )
        );

    return extraLeave.reduce((acc: number, curr) => acc + Number(curr.addedDays), 0);
};

// Helper function to get users for an organization
const getOrganizationUsers = async (db: ReturnType<typeof connectDb>, organizationId: string): Promise<User[]> => {
    return await db
        .select()
        .from(UserTable)
        .where(eq(UserTable.isActive, true));
};

// Main function to calculate and apply leave balances
export const calculateLeave = async ({
    db,
    input,
}: WithDbAndEnv<{ apiKey: string; input: { organizationId: string; leaveTypeId: string; periodStart: Date; periodEnd: Date } }>) => {
    try {
        const { organizationId, leaveTypeId, periodStart, periodEnd } = input;

        // Fetch all active users for the organization
        const allUsers = await getOrganizationUsers(db, organizationId);

        // Fetch leave type details
        const leaveTypeResult = await db
            .select()
            .from(LeaveTypeTable)
            .where(
                and(
                    eq(LeaveTypeTable.id, leaveTypeId),
                    eq(LeaveTypeTable.organizationId, organizationId)
                )
            )
            .limit(1);

        if (leaveTypeResult.length === 0) {
            return { ok: false, message: "Leave type not found." };
        }

        const leaveType = leaveTypeResult[0];

        // Check if the leave type is active
        if (!leaveType.isActive) {
            return { ok: false, message: "This leave type is inactive." };
        }

        // For each employee, calculate leave
        for (const user of allUsers) {
            // Get the leave type for the user
            let userLeaveTypeId = leaveTypeId; // Assume all users get the same leave type for simplicity

            // If the leave type is based on groups, use the group-based leave type logic
            const groupUsers = await handleGroupBasedLeave(db, userLeaveTypeId);
            if (groupUsers.includes(user.id)) {
                userLeaveTypeId = leaveTypeId;
            }

            const allocatedDays = calculateAllocatedDays(leaveType); // Calculate leave based on leave type
            const extraLeave = await applyExtraLeave(db, user.id, leaveTypeId); // Apply any extra leave days
            const finalAllocatedDays = allocatedDays === null ? null : allocatedDays + extraLeave;

            // Apply the leave for the user
            await applyLeaveForUser(db, user.id, organizationId, leaveTypeId, periodStart, periodEnd, finalAllocatedDays);
        }

        return { ok: true, message: "Leave calculation completed successfully." };
    } catch (error) {
        console.error("Error calculating leave:", error);
        return { ok: false, message: "Error calculating leave." };
    }
};