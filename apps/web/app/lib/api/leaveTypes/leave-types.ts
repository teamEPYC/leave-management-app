// api/leave-types.ts
import { client } from "../client";

export async function getLeaveTypes({
  apikey,
  organizationId,
}: {
  apikey: string;
  organizationId: string;
}) {
  const res = await client.GET("/api/v1/leave-type", {
    params: {
      header: {
        "x-api-key": apikey,
      },
      query: {
        organizationId,
      },
    },
  });

  if (res.error) {
    console.error("Leave Types API Error", res.error);
    throw new Error(JSON.stringify(res.error));
  }

  return res.data.data;
}
