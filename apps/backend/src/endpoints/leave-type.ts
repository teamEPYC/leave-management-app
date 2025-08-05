import { getHono } from "../utils/hono";
import { ApiKeyHeaderSchema, getAuthOpenApiResponse, jsonContent } from "../utils/openapi";
import { connectDb } from "../features/db/connect";
import { z } from "zod";
import { createLeaveType } from "../features/leave-types/create";

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




