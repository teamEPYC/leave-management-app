import { client } from "../client";

// get groups
export async function getGroups({ apiKey }: { apiKey: string }) {
  const res = await client.GET("/api/v1/group/list", {
    params: {
      header: {
        "x-api-key": apiKey,
      },
    },
  });

  if (res.error) throw new Error(JSON.stringify(res.error));
  return res.data.data;
}

// Create a group in an organization.
export async function createGroup({
  apiKey,
  organizationId,
  name,
  description,
  icon,
  approvalManagerIds,
  memberIds,
}: {
  apiKey: string;
  organizationId: string;
  name: string;
  description?: string;
  icon?: string;
  approvalManagerIds?: string[];
  memberIds?: string[];
}) {
  const res = await client.POST("/api/v1/group", {
    params: {
      header: {
        "x-api-key": apiKey,
      },
    },
    body: {
      organizationId,
      name,
      description,
      icon,
      approvalManagerIds,
      memberIds,
    },
  });

  if (res.error) throw new Error(JSON.stringify(res.error));
  return res.data.data;
}

// Edit group by ID
export async function updateGroup({
  apiKey,
  groupId,
  name,
  description,
  icon,
  approvalManagerIds,
  memberIds,
}: {
  apiKey: string;
  groupId: string;
  name?: string;
  description?: string;
  icon?: string;
  approvalManagerIds?: string[];
  memberIds?: string[];
}) {
  const res = await client.PUT("/api/v1/group/:groupId", {
    params: {
      header: {
        "x-api-key": apiKey,
      },
      path: {
        groupId,
      },
    },
    body: {
      name,
      description,
      icon,
      approvalManagerIds,
      memberIds,
    },
  });

  if (res.error) throw new Error(JSON.stringify(res.error));
  return res.data.data;
}

// deactivate group
export async function deleteGroup({
  apiKey,
  groupId,
}: {
  apiKey: string;
  groupId: string;
}) {
  const res = await client.DELETE("/api/v1/group/:groupId", {
    params: {
      header: {
        "x-api-key": apiKey,
      },
      path: {
        groupId,
      },
    },
  });

  if (res.error) throw new Error(JSON.stringify(res.error));
  return res.data.data;
}

export async function getGroupDetails(
  groupId: string,
  apiKey: string
): Promise<{
  ok: boolean;
  data?: {
    group: Group;
    members: Array<{
      userId: string;
      name: string;
      email: string;
      image: string | null;
      isApprovalManager: boolean;
      addedAt: string;
    }>;
  };
  error?: string;
}> {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_BASE_URL}/api/v1/group/${groupId}`,
      {
        method: "GET",
        headers: {
          "x-api-key": apiKey,
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return {
        ok: false,
        error: data.error || "Failed to fetch group details",
      };
    }

    return {
      ok: true,
      data: data.data,
    };
  } catch (error) {
    console.error("Error fetching group details:", error);
    return {
      ok: false,
      error: "Failed to fetch group details",
    };
  }
}
