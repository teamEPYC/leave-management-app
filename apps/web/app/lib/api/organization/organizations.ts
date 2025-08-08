// api/organizations.ts
import { client } from "../client";

// list of organizations
export async function getOrganizationsByEmail(email: string) {
  const res = await client.GET("/api/v1/organization/list", {
    params: {
      query: { email },
    },
  });

  if (res.error) throw new Error(JSON.stringify(res.error));
  return res.data.data;
}

// Create orgn
export async function createOrganization({
  name,
  description,
  domain,
  apiKey,
}: {
  name: string;
  description: string;
  domain: string;
  apiKey: string;
}) {
  const res = await client.POST("/api/v1/organization", {
    params: {
      header: {
        "x-api-key": apiKey,
      },
    },
    body: {
      name,
      description,
      domain,
    },
  });

  if (res.error) throw new Error(JSON.stringify(res.error));
  return res.data.data;
}

// Update an organization by ID
export async function updateOrganization({
  id,
  apiKey,
  updates,
}: {
  id: string;
  apiKey: string;
  updates: {
    name?: string;
    description?: string;
    icon?: string;
    domain?: string | null;
    setting?: Record<string, unknown> | null;
  };
}) {
  const res = await client.PUT("/api/v1/organization/:id", {
    params: {
      header: {
        "x-api-key": apiKey,
      },
      path: {
        id,
      },
    },
    body: updates,
  });

  if (res.error) throw new Error(JSON.stringify(res.error));
  return res.data.data;
}

// Delete an org
export async function deleteOrganization({
  id,
  apiKey,
}: {
  id: string;
  apiKey: string;
}) {
  const res = await client.DELETE("/api/v1/organization/:id", {
    params: {
      header: {
        "x-api-key": apiKey,
      },
      path: {
        id,
      },
    },
  });

  if (res.error) throw new Error(JSON.stringify(res.error));
  return res.data.data;
}

// Invite to organization
export async function inviteToOrganization({
  orgId,
  apiKey,
  email,
  roleId,
  groups,
}: {
  orgId: string;
  apiKey: string;
  email: string;
  roleId?: string;
  groups?: string[];
}) {
  const res = await client.POST("/api/v1/organization/:orgId/invite", {
    params: {
      header: {
        "x-api-key": apiKey,
      },
      path: {
        orgId,
      },
    },
    body: {
      email,
      roleId,
      groups,
    },
  });

  if (res.error) throw new Error(JSON.stringify(res.error));
  return res.data.data;
}

// Join an organization via domain or invitation ID
export async function joinOrganization({
  orgId,
  apiKey,
  invitationId,
}: {
  orgId: string;
  apiKey: string;
  invitationId?: string;
}) {
  const res = await client.POST("/api/v1/organization/:orgId/join", {
    params: {
      header: {
        "x-api-key": apiKey,
      },
      path: {
        orgId,
      },
    },
    body: {
      invitationId,
    },
  });

  if (res.error) throw new Error(JSON.stringify(res.error));
  return res.data.data;
}
