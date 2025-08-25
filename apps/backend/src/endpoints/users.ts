import { getHono } from "../utils/hono";
import {
  ApiKeyHeaderSchema,
  getAuthOpenApiResponse,
  jsonContent,
} from "../utils/openapi";
import { connectDb } from "../features/db/connect";
import { z } from "zod";
import {
  getOrganizationUsers,
  createUserInOrganization,
  getOrganizationRoles,
} from "../features/user";
import { handleApiErrors } from "../utils/error";
import { requireAuth } from "../features/auth/auth";

export const userEndpoint = getHono();

// Get available roles for organization
userEndpoint.openapi(
  {
    method: "get",
    path: "/roles",
    tags: ["Users"],
    summary: "Get available roles for organization",
    description: "Returns all available roles that can be assigned to users.",
    request: {
      headers: ApiKeyHeaderSchema,
      query: z.object({
        organizationId: z.string().uuid(),
      }),
    },
    responses: {
      ...getAuthOpenApiResponse(
        z.object({
          ok: z.literal(true),
          data: z.array(
            z.object({
              id: z.string().uuid(),
              name: z.string(),
            })
          ),
        })
      ),
    },
  },
  async (c) => {
    try {
      const db = connectDb({ env: c.env });
      const apiKey = c.req.valid("header")["x-api-key"];
      const query = c.req.valid("query");

      // Get authenticated user from API key
      const authResult = await requireAuth({ env: c.env, apiKey, db });
      if (!authResult.ok) {
        return c.json(authResult, 401);
      }

      const roles = await getOrganizationRoles({
        db,
        organizationId: query.organizationId,
      });

      return c.json(
        {
          ok: true,
          data: roles,
        } as const,
        200
      );
    } catch (error) {
      return handleApiErrors(c, error);
    }
  }
);

// Create new user in organization
userEndpoint.openapi(
  {
    method: "post",
    path: "/create",
    tags: ["Users"],
    summary: "Create new user in organization",
    description:
      "Create a new user account and add them to the organization. Only OWNER or ADMIN can create users.",
    request: {
      headers: ApiKeyHeaderSchema,
      body: jsonContent(
        z.object({
          organizationId: z.string().uuid(),
          email: z.string().email(),
          name: z.string().min(1),
          roleId: z.string().uuid(),
          employeeType: z.enum(["FULL_TIME", "PART_TIME"]),
        })
      ),
    },
    responses: {
      ...getAuthOpenApiResponse(
        z.object({
          ok: z.literal(true),
          data: z.object({
            userId: z.string().uuid(),
            email: z.string().email(),
            name: z.string(),
            roleName: z.string(),
            employeeType: z.enum(["FULL_TIME", "PART_TIME"]),
            message: z.string(),
          }),
        })
      ),
    },
  },
  async (c) => {
    try {
      const db = connectDb({ env: c.env });
      const apiKey = c.req.valid("header")["x-api-key"];
      const body = c.req.valid("json");

      // Get authenticated user from API key
      const authResult = await requireAuth({ env: c.env, apiKey, db });
      if (!authResult.ok) {
        return c.json(authResult, 401);
      }

      const createUserRes = await createUserInOrganization({
        db,
        userData: {
          email: body.email,
          name: body.name,
          roleId: body.roleId,
          employeeType: body.employeeType,
        },
        organizationId: body.organizationId,
        createdBy: authResult.user.id,
      });

      if (!createUserRes.ok) {
        return c.json(createUserRes, 400);
      }

      return c.json(
        {
          ok: true,
          data: createUserRes.data,
        } as const,
        200
      );
    } catch (error) {
      return handleApiErrors(c, error);
    }
  }
);

// List all users in an organization
userEndpoint.openapi(
  {
    method: "get",
    path: "/",
    tags: ["Users"],
    summary: "List all users in an organization",
    description:
      "Returns all active users in the organization with their roles and basic information. Any authenticated user in the org can view team members.",
    request: {
      headers: ApiKeyHeaderSchema,
      query: z.object({
        organizationId: z.string().uuid(),
      }),
    },
    responses: {
      ...getAuthOpenApiResponse(
        z.object({
          ok: z.literal(true),
          data: z.array(
            z.object({
              id: z.string().uuid(),
              email: z.string().email(),
              name: z.string(),
              image: z.string().nullable(),
              phone: z.string().nullable(),
              employeeType: z.enum(["FULL_TIME", "PART_TIME"]),
              roleId: z.string().uuid(),
              isOwner: z.boolean(),
              roleName: z.string(),
              joinedAt: z.string().datetime(),
            })
          ),
        })
      ),
    },
  },
  async (c) => {
    try {
      const db = connectDb({ env: c.env });
      const apiKey = c.req.valid("header")["x-api-key"];
      const query = c.req.valid("query");

      // Get authenticated user from API key
      const authResult = await requireAuth({ env: c.env, apiKey, db });
      if (!authResult.ok) {
        return c.json(authResult, 401);
      }

      const organizationUsersRes = await getOrganizationUsers({
        db,
        organizationId: query.organizationId,
      });

      return c.json(
        {
          ok: true,
          data: organizationUsersRes.map((user) => ({
            ...user,
            joinedAt: user.joinedAt.toISOString(),
          })),
        } as const,
        200
      );
    } catch (error) {
      return handleApiErrors(c, error);
    }
  }
);
