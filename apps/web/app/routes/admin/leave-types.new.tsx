import { redirect, type ActionFunctionArgs, type LoaderFunctionArgs, useActionData, useLoaderData } from "react-router-dom";
import { Form, useNavigation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { createLeaveType } from "~/lib/api/leaveTypes/leave-types";
import { getSession } from "~/lib/session.server";
import { listOrganizations } from "~/lib/api/organization/organizations";

export async function loader(args: LoaderFunctionArgs) {
  const cookie = args.request.headers.get("Cookie");
  const session = await getSession(cookie);
  const orgId = (session.get("currentOrgId") as string | undefined) || null;
  return { orgId };
}

export async function action({ request }: ActionFunctionArgs) {
  const cookie = request.headers.get("Cookie");
  const session = await getSession(cookie);
  const apiKey = session.get("apiKey") as string | undefined;

  const form = await request.formData();
  const organizationId = String(form.get("organizationId") || "").trim();
  const name = String(form.get("name") || "").trim();
  const shortCode = String(form.get("shortCode") || "").trim();
  const icon = String(form.get("icon") || "").trim();
  const description = String(form.get("description") || "").trim();
  const employeeType = (String(form.get("employeeType") || "FULL_TIME").trim() as "FULL_TIME" | "PART_TIME");
  const isLimited = String(form.get("isLimited") || "no") === "yes";
  const limitTypeRaw = String(form.get("limitType") || "").trim();
  const limitDaysRaw = String(form.get("limitDays") || "").trim();

  // Basic validations
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!organizationId || !name || !shortCode) {
    return { ok: false, message: "organizationId, name and shortCode are required" } as const;
  }
  if (!uuidRegex.test(organizationId)) {
    return { ok: false, message: "Organization ID must be a valid UUID" } as const;
  }

  try {
    if (!apiKey) {
      return { ok: false, message: "Missing API key in session. Please login again." } as const;
    }
    const payload: Parameters<typeof createLeaveType>[0]["leaveType"] = {
      organizationId,
      name,
      shortCode,
      icon: icon || undefined,
      description: description || undefined,
      isLimited,
      employeeType,
    };

    if (isLimited) {
      const limitDays = limitDaysRaw ? Number(limitDaysRaw) : undefined;
      const limitType = (limitTypeRaw || undefined) as undefined | "YEAR" | "QUARTER" | "MONTH";
      Object.assign(payload, { limitDays, limitType });
    }

    const res = await createLeaveType({ apiKey, leaveType: payload });
    if (!res || !res.leaveTypeId) {
      return { ok: false, message: "Failed to create leave type" } as const;
    }
    return redirect("/dashboard");
  } catch (e) {
    let message = e instanceof Error ? e.message : "Unknown error";
    try {
      const parsed = typeof message === "string" ? JSON.parse(message) : null;
      const zodMsg = parsed?.error || parsed?.message || null;
      if (zodMsg) {
        if (String(zodMsg).toLowerCase().includes("invalid uuid") || String(zodMsg).toLowerCase().includes("uuid")) {
          message = "Organization ID must be a valid UUID";
        } else {
          message = String(zodMsg);
        }
      }
    } catch {}
    return { ok: false, message } as const;
  }
}

export default function NewLeaveTypeRoute() {
  const actionData = useActionData() as null | { ok: false; message: string };
  const nav = useNavigation();
  const isSubmitting = nav.state === "submitting" || nav.state === "loading";
  const loader = useLoaderData() as null | { orgId: string | null };

  useEffect(() => {
    // no-op placeholder for side-effects if needed later
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Create Leave Type</CardTitle>
          <CardDescription>Define a new leave type for your organization</CardDescription>
        </CardHeader>
        <CardContent>
          {actionData?.message && (
            <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md mb-4">{actionData.message}</div>
          )}
          <Form method="post" className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="organizationId">Organization ID</Label>
              <Input id="organizationId" name="organizationId" placeholder="UUID" required defaultValue={loader?.orgId ?? ""} />
            </div>
            <div className="grid gap-2 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" placeholder="Annual Leave" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="shortCode">Short Code</Label>
                <Input id="shortCode" name="shortCode" placeholder="AL" required />
              </div>
            </div>
            <div className="grid gap-2 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="icon">Icon</Label>
                <Input id="icon" name="icon" placeholder=":palm_tree:" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="employeeType">Employee Type</Label>
                <select name="employeeType" defaultValue="FULL_TIME" className="border rounded h-9 px-2">
                  <option value="FULL_TIME">Full-time</option>
                  <option value="PART_TIME">Part-time</option>
                </select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" name="description" placeholder="Describe this leave type..." rows={3} />
            </div>
            <div className="grid gap-2 md:grid-cols-3">
              <div className="grid gap-2">
                <Label>Is Limited?</Label>
                <select name="isLimited" defaultValue="yes" className="border rounded h-9 px-2">
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>
              <div className="grid gap-2">
                <Label>Limit Type</Label>
                <select name="limitType" defaultValue="YEAR" className="border rounded h-9 px-2">
                  <option value="YEAR">Year</option>
                  <option value="QUARTER">Quarter</option>
                  <option value="MONTH">Month</option>
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="limitDays">Limit Days</Label>
                <Input id="limitDays" name="limitDays" type="number" min={1} placeholder="e.g. 20" />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Saving..." : "Create"}</Button>
            </div>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}


