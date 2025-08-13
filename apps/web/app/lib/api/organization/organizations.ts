// orgClient.ts
import { client } from "../client";

export type ApiKey = { apikey: string };

export type CreateOrganizationBody = {
  name: string;
  description: string;
  domain: string;
};

export type UpdateOrganizationBody = {
  name?: string;
  description?: string;
  icon?: string;
  domain?: string | null;
  setting?: Record<string, unknown> | null;
};

export type InviteMemberBody = {
  email: string; // email format
  roleId?: string; // uuid
  groups?: string[];
  employeeType: "FULL_TIME";
};

export type JoinOrganizationBody = {
  invitationId?: string; // uuid
};

// ===== Helpers =====
function ensure<T>(res: { error?: unknown; data?: { data: T } }) {
  if (res.error) throw new Error(JSON.stringify(res.error));
  // @ts-expect-error: data shape follows your generator’s convention
  return res.data.data as T;
}

// ===== Endpoints =====

// POST /api/v1/organization
export async function createOrganization({
  apikey,
  body,
}: ApiKey & { body: CreateOrganizationBody }) {
  const res = await client.POST("/api/v1/organization", {
    params: { header: { "x-api-key": apikey } },
    body,
  });
  return ensure<{ organizationId: string }>(res);
}

// PUT /api/v1/organization/:id
export async function updateOrganization({
  apikey,
  id,
  body,
}: ApiKey & { id: string; body: UpdateOrganizationBody }) {
  const res = await client.PUT("/api/v1/organization/:id", {
    params: {
      header: { "x-api-key": apikey },
      path: { id },
    },
    body,
  });
  return ensure<{ organizationId: string }>(res);
}

// DELETE /api/v1/organization/:id
export async function deleteOrganization({
  apikey,
  id,
}: ApiKey & { id: string }) {
  const res = await client.DELETE("/api/v1/organization/:id", {
    params: {
      header: { "x-api-key": apikey },
      path: { id },
    },
  });
  return ensure<{ organizationId: string; deactivatedAt: string }>(res);
}

// GET /api/v1/organization/list?email=
export async function listOrganizations({ email }: { email: string }) {
  const res = await client.GET("/api/v1/organization/list", {
    params: { query: { email } },
  });
  return ensure<
    {
      id: string;
      name: string;
      description: string;
      domain: string;
      icon: string | null;
    }[]
  >(res);
}

// POST /api/v1/organization/:orgId/invite
export async function inviteMember({
  apikey,
  orgId,
  body,
}: ApiKey & { orgId: string; body: InviteMemberBody }) {
  const res = await client.POST("/api/v1/organization/:orgId/invite", {
    params: {
      header: { "x-api-key": apikey },
      path: { orgId },
    },
    body,
  });
  return ensure<{ invitationId: string; expiresAt: string }>(res);
}

// POST /api/v1/organization/:orgId/join
export async function joinOrganization({
  apikey,
  orgId,
  body,
}: ApiKey & { orgId: string; body?: JoinOrganizationBody }) {
  const res = await client.POST("/api/v1/organization/:orgId/join", {
    params: {
      header: { "x-api-key": apikey },
      path: { orgId },
    },
    body,
  });
  return ensure<{
    organizationId: string;
    joinedAt: string;
    alreadyMember: boolean;
    joinType: "domain" | "invite";
  }>(res);
}
