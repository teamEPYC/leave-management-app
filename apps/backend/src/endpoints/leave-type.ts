import { getHono } from "../utils/hono";
import { ApiKeyHeaderSchema, getAuthOpenApiResponse, jsonContent } from "../utils/openapi";
import { connectDb } from "../features/db/connect";
import { z } from "zod";
import { createLeaveType } from "../features/leave-types/create";
import { listLeaveTypes } from "../features/leave-types/list";
import { deactivateLeaveType, updateLeaveType } from "../features/leave-types/update";
import { handleApiErrors } from "../utils/error";

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
        try {
            const db = connectDb({ env: c.env });
            const apiKey = c.req.valid("header")["x-api-key"];
            const body = c.req.valid("json");

            const saveLeaveTypeRes = await createLeaveType({
                db,
                env: c.env,
                apiKey,
                input: body,
            });

            if (!saveLeaveTypeRes.ok) {
                return c.json(saveLeaveTypeRes, 400);
            }

            return c.json(
                { ok: true, data: { leaveTypeId: saveLeaveTypeRes.data?.leaveTypeId } } as const,
                200
            );
        } catch (error) {
            return handleApiErrors(c, error);
        }
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
        try {
            const db = connectDb({ env: c.env });
            const apiKey = c.req.valid("header")["x-api-key"];
            const query = c.req.valid("query");

            const listLeaveTypesRes = await listLeaveTypes({
                db,
                env: c.env,
                apiKey,
                input: { organizationId: query.organizationId },
            });

            if (!listLeaveTypesRes.ok) {
                return c.json(listLeaveTypesRes, 400);
            }

            return c.json(
                { ok: true, data: listLeaveTypesRes.data } as const,
                200
            );
        } catch (error) {
            return handleApiErrors(c, error);
        }
    }
);




leaveTypeEndpoint.openapi(
    {
        method: "put",
        path: "/:leaveTypeId",
        tags: ["Leave Types"],
        summary: "Update an existing leave type",
        description: "OWNER or ADMIN can update any field of a leave type, including switching from everyone to group-based or vice versa.",
        request: {
            headers: ApiKeyHeaderSchema,
            params: z.object({
                leaveTypeId: z.string().uuid(),
            }),
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
                    employeeType: z.enum(["FULL_TIME", "PART_TIME"]),
                    groupIds: z.array(z.string().uuid()).optional(),
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
        try {
            const db = connectDb({ env: c.env });
            const apiKey = c.req.valid("header")["x-api-key"];
            const params = c.req.valid("param");
            const body = c.req.valid("json");

            const updateLeaveTypeRes = await updateLeaveType({
                db,
                env: c.env,
                apiKey,
                input: {
                    leaveTypeId: params.leaveTypeId,
                    ...body,
                },
            });

            if (!updateLeaveTypeRes.ok) {
                return c.json(updateLeaveTypeRes, 400);
            }

            return c.json(
                { ok: true, data: { leaveTypeId: updateLeaveTypeRes.data?.leaveTypeId } } as const,
                200
            );
        } catch (error) {
            return handleApiErrors(c, error);
        }
    }
);



leaveTypeEndpoint.openapi(
    {
        method: "delete",
        path: "/:leaveTypeId",
        tags: ["Leave Types"],
        summary: "Deactivate a leave type",
        description: "Marks the leave type and its associated groups as inactive so they can no longer be used. Only OWNER or ADMIN can perform this.",
        request: {
            headers: ApiKeyHeaderSchema,
            params: z.object({
                leaveTypeId: z.string().uuid(),
            }),
            query: z.object({
                organizationId: z.string().uuid(),
            }),
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
        try {
            const db = connectDb({ env: c.env });
            const apiKey = c.req.valid("header")["x-api-key"];
            const params = c.req.valid("param");
            const query = c.req.valid("query");

            const deactivateLeaveTypeRes = await deactivateLeaveType({
                db,
                env: c.env,
                apiKey,
                input: {
                    leaveTypeId: params.leaveTypeId,
                    organizationId: query.organizationId,
                },
            });

            if (!deactivateLeaveTypeRes.ok) {
                return c.json(deactivateLeaveTypeRes, 400);
            }

            return c.json(
                { ok: true, data: { leaveTypeId: deactivateLeaveTypeRes.data?.leaveTypeId } } as const,
                200
            );
        } catch (error) {
            return handleApiErrors(c, error);
        }
    }
);
