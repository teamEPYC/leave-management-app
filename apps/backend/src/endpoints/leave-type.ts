import { getHono } from "../utils/hono";
import { ApiKeyHeaderSchema, getAuthOpenApiResponse, jsonContent } from "../utils/openapi";
import { connectDb } from "../features/db/connect";
import { z } from "zod";
import { createLeaveType } from "../features/leave-types/create";
import { listLeaveTypes } from "../features/leave-types/list";

export const leaveTypeEndpoint = getHono();

leaveTypeEndpoint.openapi(
    {
        method: "post",
        path: "/",
        tags: ["Leave Types"],
        summary: "Create a leave type",
        description: "Only OWNER or ADMIN can create a leave type and assign it to groups.",
        request: {
            headers: ApiKeyHeaderSchema,
            body: jsonContent(
                z.object({
                    organizationId: z.string().uuid(),
                    name: z.string().min(1),
                    shortCode: z.string().min(1),
                    icon: z.string().optional(),
                    description: z.string().optional(),
                    isLimited: z.boolean(),
                    limitType: z.enum(["YEAR", "QUARTER", "MONTH"]).optional(),
                    limitDays: z.number().positive().optional(),
                    appliesToEveryone: z.boolean(),
                    groupIds: z.array(z.string().uuid()).optional(),
                    employeeType: z.enum(["FULL_TIME", "PART_TIME"]),
                })
            ),
        },
        responses: {
            ...getAuthOpenApiResponse(
                z.object({
                    ok: z.literal(true),
                    data: z.object({
                        leaveTypeId: z.string().uuid(),
                    }),
                })
            ),
        },
    },
    async (c) => {
        const db = connectDb({ env: c.env });
        const apiKey = c.req.valid("header")["x-api-key"];
        const body = c.req.valid("json");

        const result = await createLeaveType({
            db,
            env: c.env,
            apiKey,
            input: body,
        });

        return c.json(result, result.ok ? 200 : result.status ?? 400);
    }
);



leaveTypeEndpoint.openapi(
    {
        method: "get",
        path: "/",
        tags: ["Leave Types"],
        summary: "List all leave types for an organization",
        description: "Returns all leave types for the given organization including associated groups.",
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
                            shortCode: z.string(),
                            icon: z.string().nullable(),
                            description: z.string().nullable(),
                            isLimited: z.boolean(),
                            limitType: z.enum(["YEAR", "QUARTER", "MONTH"]).nullable(),
                            limitDays: z.string().nullable(), // numeric is returned as string by pg
                            appliesToEveryone: z.boolean(),
                            employeeType: z.enum(["FULL_TIME", "PART_TIME"]),
                            groups: z.array(
                                z.object({
                                    groupId: z.string().uuid(),
                                    groupName: z.string(),
                                    groupIcon: z.string().nullable(),
                                })
                            ),
                        })
                    ),
                })
            ),
        },
    },
    async (c) => {
        const db = connectDb({ env: c.env });
        const apiKey = c.req.valid("header")["x-api-key"];
        const query = c.req.valid("query");

        const result = await listLeaveTypes({
            db,
            env: c.env,
            apiKey,
            input: { organizationId: query.organizationId },
        });

        return c.json(result, result.ok ? 200 : result.status ?? 400);
    }
);

