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

export interface GetOrganizationUsersResponse {
  ok: boolean;
  data: OrganizationUser[];
}

export async function getOrganizationUsers(organizationId: string, apiKey: string): Promise<GetOrganizationUsersResponse> {
  const res = await client.GET(`/api/v1/organization/${organizationId}/users` as any, {
    headers: {
      "x-api-key": apiKey,
    },
  });

  if (res.error) {
    throw new Error(res.error.error || "Failed to fetch organization users");
  }

  return res.data;
}
