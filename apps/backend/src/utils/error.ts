import { Context } from "hono";

export async function handleApiErrors(c: Context, err: unknown) {
  if (err instanceof Error) {
    return c.json({ ok: false, error: err.message } as const, 500);
  }

  throw err;
}

export const ErrorCodes = {
  INVALID_EMAIL_OR_PASSWORD: "INVALID_EMAIL_OR_PASSWORD",
  EMAIL_ALREADY_IN_USE: "EMAIL_ALREADY_IN_USE",
  INVALID_API_KEY: "INVALID_API_KEY",
  UNAUTHORIZED_USER: "UNAUTHORIZED_USER",
  INVALID_INVITATION: "INVALID_INVITATION",
  ALREADY_MEMBER: "ALREADY_MEMBER",
  ALREADY_EXISTS: "ALREADY_EXISTS",
  INVALID_USER: "INVALID_USER",
  NOT_FOUND: "NOT_FOUND",
} as const;

export type ErrorCodes = (typeof ErrorCodes)[keyof typeof ErrorCodes];
