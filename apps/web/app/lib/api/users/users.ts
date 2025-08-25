import { client } from "../client";

export interface OrganizationUser {
  id: string;
  email: string;
  name: string;
  image: string | null;
  phone: string | null;
  employeeType: "FULL_TIME" | "PART_TIME";
  roleId: string;
  isOwner: boolean;
  roleName: string;
  joinedAt: string;
}

export interface OrganizationRole {
  id: string;
  name: string;
}

export interface CreateUserRequest {
  organizationId: string;
  email: string;
  name: string;
  roleId: string;
  employeeType: "FULL_TIME" | "PART_TIME";
}

export interface CreateUserResponse {
  userId: string;
  email: string;
  name: string;
  roleName: string;
  employeeType: "FULL_TIME" | "PART_TIME";
  message: string;
}

// Get all users in an organization
export async function getOrganizationUsers(
  organizationId: string,
  apiKey: string
): Promise<{ ok: boolean; data: OrganizationUser[] }> {
  const res = await client.GET("/api/v1/users/" as any, {
    headers: {
      "x-api-key": apiKey,
    },
    params: {
      query: { organizationId },
    },
  });

  if (res.error) {
    throw new Error(res.error.error || "Failed to fetch organization users");
  }

  return res.data;
}

// Get available roles for organization
export async function getOrganizationRoles(
  organizationId: string,
  apiKey: string
): Promise<{ ok: boolean; data: OrganizationRole[] }> {
  const res = await client.GET("/api/v1/users/roles" as any, {
    headers: {
      "x-api-key": apiKey,
    },
    params: {
      query: { organizationId },
    },
  });

  if (res.error) {
    throw new Error(res.error.error || "Failed to fetch organization roles");
  }

  return res.data;
}

// Create new user in organization
export async function createUser(
  request: CreateUserRequest,
  apiKey: string
): Promise<{ ok: boolean; data: CreateUserResponse }> {
  const res = await client.POST("/api/v1/users/create" as any, {
    headers: {
      "x-api-key": apiKey,
    },
    body: request,
  });

  if (res.error) {
    throw new Error(res.error.error || "Failed to create user");
  }

  return res.data;
}
