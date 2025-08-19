import { Hono } from "hono";
import { googleAuthRoutes } from "./auth/google"; // Use original version
import { Variables } from "hono/types";
import { connectDb } from "../features/db/connect";
import { getUserFromApiKey } from "../features/auth/auth";
import { getUserRole } from "../features/user";
import { OrganizationTable } from "../features/db/schema";
import { eq } from "drizzle-orm";

export const authEndpoint = new Hono<{ Bindings: Env; Variables: Variables }>();

authEndpoint.route("/google", googleAuthRoutes);

// GET /api/v1/auth/me/:orgId → membership (org name + role)
authEndpoint.get("/me/:orgId", async (c) => {
  try {
    const db = connectDb({ env: c.env });
    const apiKey = (c.req.header("x-api-key") || "").trim();
    const orgId = (c.req.param("orgId") || "").trim();

    const userRes = await getUserFromApiKey({ db, env: c.env, apiKey });
    if (!userRes.ok) return c.json(userRes, 401);
    const roleRes = await getUserRole({ db, userId: userRes.user.id, organizationId: orgId });
    if (!roleRes.hasAccess) return c.json({ ok: false, error: "Unauthorized" } as const, 403);

    const org = await db
      .select({ name: OrganizationTable.name })
      .from(OrganizationTable)
      .where(eq(OrganizationTable.id, orgId))
      .limit(1);
    const organizationName = org[0]?.name ?? "Organization";
    const role = roleRes.isOwner ? "OWNER" : roleRes.isAdmin ? "ADMIN" : "EMPLOYEE";

    return c.json({ ok: true, data: { organizationId: orgId, organizationName, role } } as const, 200);
  } catch (err) {
    return c.json({ ok: false, error: "Failed to fetch membership" } as const, 500);
  }
});