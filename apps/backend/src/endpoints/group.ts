import { getHono } from "../utils/hono";
import { ApiKeyHeaderSchema, getAuthOpenApiResponse, jsonContent } from "../utils/openapi";
import { connectDb } from "../features/db/connect";
import { z } from "zod";
import { createGroup } from "../features/groups/create";

export const groupEndpoint = getHono();

groupEndpoint.openapi(
    {
        method: "post",
        path: "/",
        tags: ["Groups"],
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
        const db = connectDb({ env: c.env });
        const apiKey = c.req.valid("header")["x-api-key"];
        const body = c.req.valid("json");

        const result = await createGroup({
            db,
            env: c.env,
            apiKey,
            input: body,
        });

        return c.json(result, result.ok ? 200 : result.status ?? 400);
    }
);
