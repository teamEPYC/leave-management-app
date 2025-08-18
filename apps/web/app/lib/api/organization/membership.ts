import { client } from "../client";

export async function getUserMembership({
  apiKey,
  organizationId,
}: {
  apiKey: string;
  organizationId: string;
}) {
  const res = await client.GET(`/api/v1/auth/me/${organizationId}` as any, {
    params: {
      header: {
        "x-api-key": apiKey,
      },
    },
  });

  if (res.error) {
    console.error("Failed to fetch user membership:", res.error);
    throw new Error(JSON.stringify(res.error));
  }

  return res.data.data;
}


