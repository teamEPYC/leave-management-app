import { z } from "zod";
import { getHono } from "../utils/hono";
import { ApiKeyHeaderSchema, getAuthOpenApiResponse, jsonContent } from "../utils/openapi";
import { connectDb } from "../features/db/connect";
import { createOrganizationAsOwner } from "../features/organization/create";
import { handleApiErrors } from "../utils/error";
import { deactivateOrganization, updateOrganization } from "../features/organization/update";
import { getOrganizationList } from "../features/organization/get";
import { inviteUserToOrg } from "../features/organization/invite-user";
import { joinOrganization } from "../features/organization/join";

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

            const createOrganizationRes = await createOrganizationAsOwner({
                db,
                env,
                apiKey,
                input: body,
            });

            if (!createOrganizationRes.ok) {
                return c.json(createOrganizationRes, 400);
            }

            return c.json(
                { ok: true, data: { organizationId: createOrganizationRes.data?.organizationId } } as const,
                200
            );
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

            const updateOrganizationRes = await updateOrganization({
                db,
                env: c.env,
                apiKey,
                organizationId: orgId,
                input: body,
            });

            if (!updateOrganizationRes.ok) {
                return c.json(updateOrganizationRes, 400);
            }

            return c.json(
                { ok: true, data: { organizationId: updateOrganizationRes.data?.organizationId } } as const,
                200
            );
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

            const deactivateOrganizationRes = await deactivateOrganization({
                db,
                env: c.env,
                apiKey,
                organizationId: orgId,
            });

            if (!deactivateOrganizationRes.ok) {
                return c.json(deactivateOrganizationRes, 400);
            }

            return c.json(
                { ok: true, data: { organizationId: deactivateOrganizationRes.data?.organizationId, deactivatedAt: deactivateOrganizationRes.data?.deactivatedAt } } as const,
                200
            );
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

        const getOrganizationListRes = await getOrganizationList({ db, email });

        if (!getOrganizationListRes.ok) {
            return c.json(getOrganizationListRes, 400);
        }

        return c.json(
            { ok: true, data: getOrganizationListRes.data.organizations } as const,
            200
        );

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
                    roleId: z.string().uuid().optional(),
                    groups: z.array(z.string().uuid()).optional(),
                    employeeType: z.enum(["FULL_TIME"]),
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

            const inviteUserToOrgRes = await inviteUserToOrg({
                db,
                env: c.env,
                apiKey,
                organizationId: orgId,
                input: body,
            });

            if (!inviteUserToOrgRes.ok) {
                return c.json(inviteUserToOrgRes, 400);
            }

            return c.json(
                { ok: true, data: { invitationId: inviteUserToOrgRes.data?.invitationId, expiresAt: inviteUserToOrgRes.data?.expiresAt } } as const,
                200
            );
        } catch (err) {
            return handleApiErrors(c, err);
        }
    }
);


organizationEndpoint.openapi(
    {
        method: "post",
        path: "/:orgId/join",
        tags: ["Organization"],
        request: {
            headers: ApiKeyHeaderSchema,
            params: z.object({
                orgId: z.string().uuid(),
            }),
            body: jsonContent(
                z.object({
                    invitationId: z.string().uuid().optional(), // Optional: If provided, join via invitation
                })
            ),
        },
        responses: {
            ...getAuthOpenApiResponse(
                z.object({
                    ok: z.literal(true),
                    data: z.object({
                        organizationId: z.string().uuid(),
                        joinedAt: z.string(),
                        alreadyMember: z.boolean(),
                        joinType: z.enum(["domain", "invite"]),
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
            const { invitationId } = c.req.valid("json");

            const joinOrganizationRes = await joinOrganization({
                db,
                env: c.env,
                apiKey,
                organizationId: orgId,
                invitationId,
            });

            if (!joinOrganizationRes.ok) {
                return c.json(joinOrganizationRes, 400);
            }

            return c.json(
                { ok: true, data: joinOrganizationRes.data } as const,
                200
            );
        } catch (err) {
            return handleApiErrors(c, err);
        }
    }
);
