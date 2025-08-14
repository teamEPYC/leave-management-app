import { redirect, type LoaderFunctionArgs, type ActionFunctionArgs } from "react-router-dom";
import { getSession } from "~/lib/session.server";
import { getLeaveTypes as apiGetLeaveTypes, createLeaveType as apiCreateLeaveType } from "~/lib/api/leaveTypes/leave-types";

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

export async function createLeaveTypeFromForm(request: Request, form: FormData) {
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
  const employeeType = (String(form.get("employeeType") || "FULL_TIME") as "FULL_TIME" | "PART_TIME");
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
    const limitType = (limitTypeRaw || undefined) as undefined | "YEAR" | "QUARTER" | "MONTH";
    Object.assign(payload, { limitDays, limitType });
  }

  await apiCreateLeaveType({ apiKey, leaveType: payload });
}


