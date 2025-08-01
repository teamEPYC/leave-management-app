import { z } from "zod";
import { getHono } from "../utils/hono";
import { ApiKeyHeaderSchema, getAuthOpenApiResponse, jsonContent } from "../utils/openapi";
import { connectDb } from "../features/db/connect";
import { createOrganizationAsOwner } from "../features/organization/create";
import { handleApiErrors } from "../utils/error";
import { deactivateOrganization, updateOrganization } from "../features/organization/update";
import { getOrganizationList } from "../features/organization/get";
import { inviteUserToOrg } from "../features/organization/invite-user";

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


organizationEndpoint.openapi(
    {
        method: "put",
        path: "/:id",
        tags: ["Organization"],
        request: {
            headers: ApiKeyHeaderSchema,
            params: z.object({
                id: z.string().uuid(),
            }),
            body: jsonContent(
                z.object({
                    name: z.string().optional(),
                    description: z.string().optional(),
                    icon: z.string().optional(),
                    domain: z.string().nullable().optional(),
                    setting: z.record(z.any()).nullable().optional(),
                })
            ),
        },
        responses: {
            ...getAuthOpenApiResponse(
                z.object({
                    ok: z.literal(true),
                    data: z.object({
                        organizationId: z.string().uuid(),
                    }),
                })
            ),
        },
    },
    async (c) => {
        try {
            const db = connectDb({ env: c.env });
            const apiKey = c.req.valid("header")["x-api-key"];
            const orgId = c.req.valid("param").id;
            const body = c.req.valid("json");

            const result = await updateOrganization({
                db,
                env: c.env,
                apiKey,
                organizationId: orgId,
                input: body,
            });

            return c.json(result, result.ok ? 200 : result.status ?? 400);
        } catch (err) {
            return handleApiErrors(c, err);
        }
    }
);


organizationEndpoint.openapi(
    {
        method: "delete",
        path: "/:id",
        tags: ["Organization"],
        request: {
            headers: ApiKeyHeaderSchema,
            params: z.object({
                id: z.string().uuid(),
            }),
        },
        responses: {
            ...getAuthOpenApiResponse(
                z.object({
                    ok: z.literal(true),
                    data: z.object({
                        organizationId: z.string().uuid(),
                        deactivatedAt: z.string(),
                    }),
                })
            ),
        },
    },
    async (c) => {
        try {
            const db = connectDb({ env: c.env });
            const apiKey = c.req.valid("header")["x-api-key"];
            const orgId = c.req.valid("param").id;

            const result = await deactivateOrganization({
                db,
                env: c.env,
                apiKey,
                organizationId: orgId,
            });

            return c.json(result, result.ok ? 200 : result.httpStatus ?? 400);
        } catch (err) {
            return handleApiErrors(c, err);
        }
    }
);



organizationEndpoint.openapi({
    method: "get",
    path: "/list",
    tags: ["Organization"],
    request: {
        query: z.object({
            email: z.string().email(),
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
                        description: z.string(),
                        domain: z.string(),
                        icon: z.string().nullable(),
                    })
                ),
            })
        ),
    },
}, async (c) => {
    try {
        const db = connectDb({ env: c.env });
        const { email } = c.req.valid("query");

        const result = await getOrganizationList({ db, email });

        return c.json({ ok: true, data: result }, 200);
    } catch (err) {
        return handleApiErrors(c, err);
    }
});


organizationEndpoint.openapi(
    {
        method: "post",
        path: "/:orgId/invite",
        tags: ["Organization"],
        request: {
            headers: ApiKeyHeaderSchema,
            params: z.object({
                orgId: z.string().uuid(),
            }),
            body: jsonContent(
                z.object({
                    email: z.string().email(),
                    roleId: z.string().uuid().optional(), // Defaults to EMPLOYEE
                    groups: z.array(z.string().uuid()).optional(), // Optional
                })
            ),
        },
        responses: {
            ...getAuthOpenApiResponse(
                z.object({
                    ok: z.literal(true),
                    data: z.object({
                        invitationId: z.string().uuid(),
                        expiresAt: z.string(), // ISO date
                    }),
                })
            ),
        },
    },
    async (c) => {
        try {
            const db = connectDb({ env: c.env });
            const apiKey = c.req.valid("header")["x-api-key"];
            const { orgId } = c.req.valid("param");
            const body = c.req.valid("json");

            const result = await inviteUserToOrg({
                db,
                env: c.env,
                apiKey,
                organizationId: orgId,
                input: body,
            });

            return c.json(result, result.ok ? 200 : result.status ?? 400);
        } catch (err) {
            return handleApiErrors(c, err);
        }
    }
);
