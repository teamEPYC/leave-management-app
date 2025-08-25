import { getHono } from "../utils/hono";
import {
  ApiKeyHeaderSchema,
  getAuthOpenApiResponse,
  jsonContent,
} from "../utils/openapi";
import { connectDb } from "../features/db/connect";
import { z } from "zod";
import { createGroup } from "../features/groups/create";
import { deactivateGroup, editGroup } from "../features/groups/update";
import { listGroupsForCurrentOrg } from "../features/groups/get";
import { handleApiErrors } from "../utils/error";
import { eq, and, inArray } from "drizzle-orm";
import { GroupTable, GroupUserTable, UserTable } from "../features/db/schema";

export const groupEndpoint = getHono();

groupEndpoint.openapi(
  {
    method: "get",
    path: "/list",
    tags: ["Groups"],
    summary: "List groups for the current organization",
    description:
      "OWNER / ADMIN: Returns all groups in the organization. EMPLOYEE: Returns only groups they are a member of.",
    request: {
      headers: ApiKeyHeaderSchema,
    },
    responses: {
      ...getAuthOpenApiResponse(
        z.object({
          ok: z.literal(true),
          data: z.array(
            z.object({
              id: z.string().uuid(),
              organizationId: z.string().uuid(),
              name: z.string(),
              description: z.string().nullable(),
              icon: z.string().nullable(),
              isActive: z.boolean(),
              createdAt: z.string(),
              updatedAt: z.string(),
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

      const listGroupsForCurrentOrgRes = await listGroupsForCurrentOrg({
        db,
        env: c.env,
        apiKey,
      });

      if (!listGroupsForCurrentOrgRes.ok) {
        return c.json(listGroupsForCurrentOrgRes, 400);
      }

      return c.json(
        { ok: true, data: listGroupsForCurrentOrgRes.data } as const,
        200
      );
    } catch (error) {
      return handleApiErrors(c, error);
    }
  }
);

groupEndpoint.openapi(
  {
    method: "post",
    path: "/",
    tags: ["Groups"],
    summary: "Create a new group",
    description:
      "Create a new group in the organization. Only OWNER or ADMIN can create groups.",
    request: {
      headers: ApiKeyHeaderSchema,
      body: jsonContent(
        z.object({
          organizationId: z.string().uuid(),
          name: z.string().min(1),
          description: z.string().optional(),
          icon: z.string().url().optional(),
          approvalManagerIds: z.array(z.string().uuid()).optional(),
          memberIds: z.array(z.string().uuid()).optional(),
        })
      ),
    },
    responses: {
      ...getAuthOpenApiResponse(
        z.object({
          ok: z.literal(true),
          data: z.object({ groupId: z.string().uuid() }),
        })
      ),
    },
  },
  async (c) => {
    try {
      const db = connectDb({ env: c.env });
      const apiKey = c.req.valid("header")["x-api-key"];
      const body = c.req.valid("json");

      const createGroupRes = await createGroup({
        db,
        env: c.env,
        apiKey,
        input: body,
      });

      if (!createGroupRes.ok) {
        return c.json(createGroupRes, 400);
      }

      return c.json(
        { ok: true, data: { groupId: createGroupRes.data?.groupId } } as const,
        200
      );
    } catch (error) {
      return handleApiErrors(c, error);
    }
  }
);

groupEndpoint.openapi(
  {
    method: "put",
    path: "/:groupId",
    tags: ["Groups"],
    summary: "Edit a group",
    description: "Only OWNER or ADMIN can edit groups",
    request: {
      headers: ApiKeyHeaderSchema,
      params: z.object({
        groupId: z.string().uuid(),
      }),
      body: jsonContent(
        z.object({
          name: z.string().min(1).optional(),
          description: z.string().optional(),
          icon: z.string().url().optional(),
          approvalManagerIds: z.array(z.string().uuid()).optional(),
          memberIds: z.array(z.string().uuid()).optional(),
        })
      ),
    },
    responses: {
      ...getAuthOpenApiResponse(
        z.object({
          ok: z.literal(true),
          data: z.object({ groupId: z.string().uuid() }),
        })
      ),
    },
  },
  async (c) => {
    try {
      const db = connectDb({ env: c.env });
      const apiKey = c.req.valid("header")["x-api-key"];
      const { groupId } = c.req.valid("param");
      const body = c.req.valid("json");

      const editGroupRes = await editGroup({
        db,
        env: c.env,
        apiKey,
        groupId,
        input: body,
      });

      if (!editGroupRes.ok) {
        return c.json(editGroupRes, 400);
      }

      return c.json(
        { ok: true, data: { groupId: editGroupRes.data?.groupId } } as const,
        200
      );
    } catch (error) {
      return handleApiErrors(c, error);
    }
  }
);

groupEndpoint.openapi(
  {
    method: "delete",
    path: "/:groupId",
    tags: ["Groups"],
    summary: "Deactivate a group",
    description: "Only OWNER or ADMIN can deactivate groups.",
    request: {
      headers: ApiKeyHeaderSchema,
      params: z.object({
        groupId: z.string().uuid(),
      }),
    },
    responses: {
      ...getAuthOpenApiResponse(
        z.object({
          ok: z.literal(true),
          data: z.object({ groupId: z.string().uuid() }),
        })
      ),
    },
  },
  async (c) => {
    try {
      const db = connectDb({ env: c.env });
      const apiKey = c.req.valid("header")["x-api-key"];
      const { groupId } = c.req.valid("param");

      const deactivateGroupRes = await deactivateGroup({
        db,
        env: c.env,
        apiKey,
        groupId,
      });

      if (!deactivateGroupRes.ok) {
        return c.json(deactivateGroupRes, 400);
      }

      return c.json(
        {
          ok: true,
          data: { groupId: deactivateGroupRes.data?.groupId },
        } as const,
        200
      );
    } catch (error) {
      return handleApiErrors(c, error);
    }
  }
);

groupEndpoint.openapi(
  {
    method: "get",
    path: "/:groupId",
    tags: ["Groups"],
    summary: "Get group details with members and managers",
    description:
      "Get detailed information about a specific group including its members and approval managers.",
    request: {
      headers: ApiKeyHeaderSchema,
      params: z.object({
        groupId: z.string().uuid(),
      }),
    },
    responses: {
      ...getAuthOpenApiResponse(
        z.object({
          ok: z.literal(true),
          data: z.object({
            group: z.object({
              id: z.string().uuid(),
              organizationId: z.string().uuid(),
              name: z.string(),
              description: z.string().nullable(),
              icon: z.string().nullable(),
              isActive: z.boolean(),
              createdAt: z.string(),
              updatedAt: z.string(),
            }),
            members: z.array(
              z.object({
                userId: z.string().uuid(),
                name: z.string(),
                email: z.string(),
                image: z.string().nullable(),
                isApprovalManager: z.boolean(),
                addedAt: z.string(),
              })
            ),
          }),
        })
      ),
    },
  },
  async (c) => {
    try {
      const db = connectDb({ env: c.env });
      const apiKey = c.req.valid("header")["x-api-key"];
      const { groupId } = c.req.valid("param");

      // First, get the group details
      const group = await db
        .select()
        .from(GroupTable)
        .where(eq(GroupTable.id, groupId))
        .limit(1);

      if (group.length === 0) {
        return c.json({ ok: false, error: "Group not found" }, 404);
      }

      // Get group members and managers
      const groupUsers = await db
        .select({
          userId: GroupUserTable.userId,
          isApprovalManager: GroupUserTable.isApprovalManager,
          addedAt: GroupUserTable.createdAt,
        })
        .from(GroupUserTable)
        .where(eq(GroupUserTable.groupId, groupId));

      if (groupUsers.length === 0) {
        return c.json(
          {
            ok: true,
            data: {
              group: group[0],
              members: [],
            },
          },
          200
        );
      }

      // Get user details for all group members
      const userIds = groupUsers.map((gu) => gu.userId);
      const users = await db
        .select({
          id: UserTable.id,
          name: UserTable.name,
          email: UserTable.email,
          image: UserTable.image,
        })
        .from(UserTable)
        .where(inArray(UserTable.id, userIds));

      // Map the data together
      const members = groupUsers.map((gu) => {
        const user = users.find((u) => u.id === gu.userId);
        return {
          userId: gu.userId,
          name: user?.name || "Unknown User",
          email: user?.email || "unknown@example.com",
          image: user?.image,
          isApprovalManager: gu.isApprovalManager,
          addedAt: gu.addedAt.toISOString(),
        };
      });

      return c.json(
        {
          ok: true,
          data: {
            group: group[0],
            members,
          },
        },
        200
      );
    } catch (error) {
      return handleApiErrors(c, error);
    }
  }
);
