import { z } from "zod";
import { getHono } from "../utils/hono";
import { ApiKeyHeaderSchema, getAuthOpenApiResponse, jsonContent } from "../utils/openapi";
import { connectDb } from "../features/db/connect";
import { createOrganizationAsOwner } from "../features/organization/create";
import { handleApiErrors } from "../utils/error";

export const organizationEndpoint = getHono();


organizationEndpoint.openapi(
    {
        method: "post",
        path: "/",
        tags: ["Organization"],
        request: {
            headers: ApiKeyHeaderSchema,
            body: jsonContent(
                z.object({
                    name: z.string(),
                    description: z.string(),
                    domain: z.string(),
                })
            ),
        },
        responses: {
            ...getAuthOpenApiResponse(
                z.object({
                    ok: z.literal(true),
                    data: z.object({
                        organizationId: z.string(),
                    }),
                })
            ),
        },
    },
    async (c) => {
        try {
            const env = c.env;
            const db = connectDb({ env });
            const apiKey = c.req.valid("header")["x-api-key"];
            const body = c.req.valid("json");

            const result = await createOrganizationAsOwner({
                db,
                env,
                apiKey,
                input: body,
            });

            if (!result.ok) {
                return c.json(result, result.status ?? 400);
            }

            return c.json(result, 200);
        } catch (err) {
            return handleApiErrors(c, err);
        }
    }
);
