// api/leave-types.ts
import { client } from "../client";

// Get all leave types for an organization.
export async function getLeaveTypes({
  organizationId,
  apiKey,
}: {
  organizationId: string;
  apiKey: string;
}) {
  const res = await client.GET("/api/v1/leave-type", {
    params: {
      header: {
        "x-api-key": apiKey,
      },
      query: {
        organizationId,
      },
    },
  });

  if (res.error) {
    console.error("Failed to fetch leave types:", res.error);
    throw new Error(JSON.stringify(res.error));
  }

  return res.data.data;
}

// Create a new leave type.
export async function createLeaveType({
  apiKey,
  leaveType,
}: {
  apiKey: string;
  leaveType: {
    organizationId: string;
    name: string;
    shortCode: string;
    icon?: string;
    description?: string;
    isLimited: boolean;
    limitType?: "YEAR" | "QUARTER" | "MONTH";
    limitDays?: number;
    groupIds?: string[];
    employeeType: "FULL_TIME" | "PART_TIME";
  };
}) {
  const res = await client.POST("/api/v1/leave-type", {
    params: {
      header: {
        "x-api-key": apiKey,
      },
    },
    body: leaveType,
  });

  if (res.error) {
    console.error("Failed to create leave type:", res.error);
    throw new Error(JSON.stringify(res.error));
  }

  return res.data.data;
}

// Update an existing leave type.
export async function updateLeaveType({
  apiKey,
  leaveTypeId,
  body,
}: {
  apiKey: string;
  leaveTypeId: string;
  body: {
    organizationId: string;
    name: string;
    shortCode: string;
    icon?: string;
    description?: string;
    isLimited: boolean;
    limitType?: "YEAR" | "QUARTER" | "MONTH";
    limitDays?: number;
    groupIds?: string[];
    employeeType: "FULL_TIME" | "PART_TIME";
  };
}) {
  const res = await client.PUT(`/api/v1/leave-type/${leaveTypeId}` as any, {
    params: {
      header: { "x-api-key": apiKey },
    },
    body,
  });

  if (res.error) {
    console.error("Failed to update leave type:", res.error);
    throw new Error(JSON.stringify(res.error));
  }

  return res.data.data;
}

// Delete a leave type.
export async function deleteLeaveType({
  apiKey,
  leaveTypeId,
  organizationId,
}: {
  apiKey: string;
  leaveTypeId: string;
  organizationId: string;
}) {
  const res = await client.DELETE(`/api/v1/leave-type/${leaveTypeId}` as any, {
    params: {
      header: { "x-api-key": apiKey },
      query: { organizationId },
    },
  });

  if (res.error) {
    console.error("Failed to delete leave type:", res.error);
    throw new Error(JSON.stringify(res.error));
  }

  return res.data.data;
}
