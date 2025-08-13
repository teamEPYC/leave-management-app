import { redirect, type ActionFunctionArgs, type LoaderFunctionArgs, useActionData } from "react-router-dom";
import { Form, useNavigation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { createLeaveType } from "~/lib/api/leaveTypes/leave-types";

export async function loader(_args: LoaderFunctionArgs) {
  return null;
}

export async function action({ request }: ActionFunctionArgs) {
  const url = new URL(request.url);
  // Dev note: hardcoded API key fallback for local development while auth is pending.
  const HARDCODED_API_KEY = url.searchParams.get("apiKey") || "REPLACE_WITH_DEV_API_KEY";

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

  if (!organizationId || !name || !shortCode) {
    return { ok: false, message: "organizationId, name and shortCode are required" } as const;
  }

  try {
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

    const res = await createLeaveType({ apiKey: HARDCODED_API_KEY, leaveType: payload });
    if (!res || !res.leaveTypeId) {
      return { ok: false, message: "Failed to create leave type" } as const;
    }
    return redirect("/dashboard");
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return { ok: false, message } as const;
  }
}

export default function NewLeaveTypeRoute() {
  const actionData = useActionData() as null | { ok: false; message: string };
  const nav = useNavigation();
  const isSubmitting = nav.state === "submitting" || nav.state === "loading";

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
              <Input id="organizationId" name="organizationId" placeholder="UUID" required />
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
                <Select name="employeeType" defaultValue="FULL_TIME">
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FULL_TIME">Full-time</SelectItem>
                    <SelectItem value="PART_TIME">Part-time</SelectItem>
                  </SelectContent>
                </Select>
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


