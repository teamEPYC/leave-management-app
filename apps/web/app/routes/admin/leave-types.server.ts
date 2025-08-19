import {
  redirect,
  type LoaderFunctionArgs,
  type ActionFunctionArgs,
} from "react-router-dom";
import { getSession } from "~/lib/session.server";
import {
  getLeaveTypes as apiGetLeaveTypes,
  createLeaveType as apiCreateLeaveType,
  updateLeaveType as apiUpdateLeaveType,
  deleteLeaveType as apiDeleteLeaveType,
} from "~/lib/api/leaveTypes/leave-types";

export type LeaveTypeDto = {
  id: string;
  name: string;
  shortCode: string;
  icon: string | null;
  description: string | null;
  isLimited: boolean;
  limitType: "YEAR" | "QUARTER" | "MONTH" | null;
  limitDays: string | null;
  employeeType: "FULL_TIME" | "PART_TIME";
};

export async function loadLeaveTypes(request: Request) {
  const cookie = request.headers.get("Cookie");
  const session = await getSession(cookie);
  const apiKey = session.get("apiKey") as string | undefined;
  const orgId = session.get("currentOrgId") as string | undefined;
  if (!apiKey) return redirect("/");
  if (!orgId) return redirect("/onboarding");
  const list = await apiGetLeaveTypes({ organizationId: orgId, apiKey });
  return list as LeaveTypeDto[];
}

export async function createLeaveTypeFromForm(
  request: Request,
  form: FormData
) {
  const cookie = request.headers.get("Cookie");
  const session = await getSession(cookie);
  const apiKey = session.get("apiKey") as string | undefined;
  const orgId = session.get("currentOrgId") as string | undefined;
  if (!apiKey) return redirect("/");
  if (!orgId) return redirect("/onboarding");

  const name = String(form.get("name") || "").trim();
  const shortCode = String(form.get("shortCode") || "").trim();
  const description = String(form.get("description") || "").trim() || undefined;
  const icon = String(form.get("icon") || "").trim() || undefined;
  const employeeType = String(form.get("employeeType") || "FULL_TIME") as
    | "FULL_TIME"
    | "PART_TIME";
  const isLimited = String(form.get("isLimited") || "no") === "yes";
  const limitTypeRaw = String(form.get("limitType") || "").trim();
  const limitDaysRaw = String(form.get("limitDays") || "").trim();

  if (!name || !shortCode) {
    throw redirect("/dashboard?error=missing_fields");
  }

  const payload: Parameters<typeof apiCreateLeaveType>[0]["leaveType"] = {
    organizationId: orgId,
    name,
    shortCode,
    icon,
    description,
    isLimited,
    employeeType,
  };
  if (isLimited) {
    const limitDays = limitDaysRaw ? Number(limitDaysRaw) : undefined;
    const limitType = (limitTypeRaw || undefined) as
      | undefined
      | "YEAR"
      | "QUARTER"
      | "MONTH";
    Object.assign(payload, { limitDays, limitType });
  }

  try {
    const res = await apiCreateLeaveType({ apiKey, leaveType: payload });
    return { ok: true, data: res } as const;
  } catch (e) {
    let message: unknown = "Failed to create leave type";
    let errorCode: string | undefined = undefined;
    try {
      const parsed = typeof (e as any).message === "string" ? JSON.parse((e as any).message) : (e as any);
      errorCode = parsed?.errorCode || parsed?.data?.errorCode;
      message = parsed?.error || parsed?.issues?.[0]?.message || message;
    } catch {}
    const msg =
      typeof message === "string"
        ? message
        : (message && typeof message === "object" && "message" in (message as Record<string, unknown>)
            ? String((message as Record<string, unknown>).message)
            : JSON.stringify(message));
    return { ok: false, errorCode, message: msg } as const;
  }
}

export async function updateLeaveTypeFromForm(
  request: Request,
  form: FormData
) {
  const cookie = request.headers.get("Cookie");
  const session = await getSession(cookie);
  const apiKey = session.get("apiKey") as string | undefined;
  const orgId = session.get("currentOrgId") as string | undefined;
  if (!apiKey) return redirect("/");
  if (!orgId) return redirect("/onboarding");

  const leaveTypeId = String(form.get("leaveTypeId") || "").trim();
  // Debug once (comment out if noisy):
  // console.log("update leaveTypeId:", leaveTypeId);
  const name = String(form.get("name") || "").trim();
  const shortCode = String(form.get("shortCode") || "").trim();
  const description = String(form.get("description") || "").trim() || undefined;
  const icon = String(form.get("icon") || "").trim() || undefined;
  const employeeType = String(form.get("employeeType") || "FULL_TIME") as
    | "FULL_TIME"
    | "PART_TIME";
  const isLimited = String(form.get("isLimited") || "no") === "yes";
  const limitTypeRaw = String(form.get("limitType") || "").trim();
  const limitDaysRaw = String(form.get("limitDays") || "").trim();

  if (!leaveTypeId || !name || !shortCode) {
    return { ok: false, message: "Missing required fields" } as const;
  }
  const uuidRe = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRe.test(leaveTypeId)) {
    return { ok: false, message: "Invalid leave type id. Please refresh and try again." } as const;
  }

  const body: Parameters<typeof apiUpdateLeaveType>[0]["body"] = {
    organizationId: orgId,
    name,
    shortCode,
    icon,
    description,
    isLimited,
    employeeType,
  };
  if (isLimited) {
    const limitDays = limitDaysRaw ? Number(limitDaysRaw) : undefined;
    const limitType = (limitTypeRaw || undefined) as
      | undefined
      | "YEAR"
      | "QUARTER"
      | "MONTH";
    Object.assign(body, { limitDays, limitType });
  }

  try {
    const res = await apiUpdateLeaveType({ apiKey, leaveTypeId, body });
    return { ok: true, data: res } as const;
  } catch (e) {
    let message: unknown = "Failed to update leave type";
    try {
      const parsed = typeof (e as any).message === "string" ? JSON.parse((e as any).message) : (e as any);
      message = parsed?.error || parsed?.issues?.[0]?.message || message;
    } catch {}
    const msg =
      typeof message === "string"
        ? message
        : (message && typeof message === "object" && "message" in (message as Record<string, unknown>)
            ? String((message as Record<string, unknown>).message)
            : JSON.stringify(message));
    return { ok: false, message: msg } as const;
  }
}

export async function deleteLeaveTypeFromForm(
  request: Request,
  form: FormData
) {
  const cookie = request.headers.get("Cookie");
  const session = await getSession(cookie);
  const apiKey = session.get("apiKey") as string | undefined;
  const orgId = session.get("currentOrgId") as string | undefined;
  if (!apiKey) return redirect("/");
  if (!orgId) return redirect("/onboarding");

  const leaveTypeId = String(form.get("leaveTypeId") || "").trim();
  // Debug once (comment out if noisy):
  // console.log("delete leaveTypeId:", leaveTypeId);
  if (!leaveTypeId) return { ok: false, message: "Missing leaveTypeId" } as const;
  const uuidRe = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRe.test(leaveTypeId)) {
    return { ok: false, message: "Invalid leave type id. Please refresh and try again." } as const;
  }
  try {
    const res = await apiDeleteLeaveType({ apiKey, leaveTypeId, organizationId: orgId });
    return { ok: true, data: res } as const;
  } catch (e) {
    let message: unknown = "Failed to delete leave type";
    try {
      const parsed = typeof (e as any).message === "string" ? JSON.parse((e as any).message) : (e as any);
      message = parsed?.error || parsed?.issues?.[0]?.message || message;
    } catch {}
    const msg =
      typeof message === "string"
        ? message
        : (message && typeof message === "object" && "message" in (message as Record<string, unknown>)
            ? String((message as Record<string, unknown>).message)
            : JSON.stringify(message));
    return { ok: false, message: msg } as const;
  }
}
