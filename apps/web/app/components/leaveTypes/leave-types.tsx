// components/admin/LeaveTypeOverview.tsx

import * as React from "react";
import { Form, useActionData, useNavigation, useRevalidator } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "~/components/ui/card";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import {
  PlusCircle,
  CalendarDays,
  TreePalm,
  Hospital,
  EyeClosed,
} from "lucide-react";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Switch } from "../ui/switch";
import { toast } from "sonner";

type LeaveTypeDto = {
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

function LeaveTypeOverview({ leaveTypes }: { leaveTypes: LeaveTypeDto[] }) {
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<null | LeaveTypeDto>(null);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const lastActionRef = React.useRef<"save" | "delete" | null>(null);
  const isSubmitting = useNavigation().state === "submitting";
  const actionData = useActionData() as null | { ok: boolean; message?: string };
  const revalidator = useRevalidator();

  React.useEffect(() => {
    if (actionData && actionData.ok) {
      const wasDelete = lastActionRef.current === "delete";
      toast.success(wasDelete ? "Leave type deleted" : editing ? "Leave type updated" : "Leave type created");
      setOpen(false);
      setEditing(null);
      setDeleteOpen(false);
      lastActionRef.current = null;
      // Refresh list
      revalidator.revalidate();
    } else if (actionData && !actionData.ok && actionData.message) {
      toast.error(actionData.message);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actionData]);

  return (
    <>
    <Dialog open={open} onOpenChange={setOpen}>
      <Card className="col-span-4 border-0 shadow-md rounded">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Leave Type Overview</CardTitle>
            <CardDescription>
              Overview of your configured leave types.
            </CardDescription>
          </div>
          <DialogTrigger asChild>
            <Button
              variant="default"
              size="sm"
              className="rounded"
              onClick={() => {
                setEditing(null);
                setOpen(true);
              }}
            >

              <PlusCircle className="size-4" />{" "}
              <div className="hidden lg:block ml-2">Add Leave Type</div>
            </Button>
          </DialogTrigger>
        </CardHeader>

        <CardContent className="space-y-2 rounded">
          {leaveTypes.length === 0 ? (
            <div className="text-sm text-muted-foreground">No leave types yet.</div>
          ) : (
            leaveTypes.map((type) => (
              <button
                key={type.id}
                type="button"
                onClick={() => { setEditing(type); setOpen(true); }}
                className="w-full text-left px-2 py-2 rounded hover:bg-accent/30 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <span className="w-5 h-5 text-primary">{type.icon ?? "🏷️"}</span>
                  <div className="flex flex-col">
                    <span className="font-medium text-sm">{type.name}</span>
                    <span className="text-xs text-muted-foreground">{type.shortCode}</span>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  {type.isLimited && type.limitDays
                    ? `${type.limitDays} ${type.limitType?.toLowerCase() ?? "days"}`
                    : "Unlimited"}
                </div>
              </button>
            ))
          )}
        </CardContent>
      </Card>

      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-2xl">{editing ? "Edit Leave Type" : "Add Leave Type"}</DialogTitle>
          <DialogDescription>
            {editing ? "Update or delete this leave type." : "Configure and create a new leave type in your organization."}
          </DialogDescription>
        </DialogHeader>

        <Form method="post" className="space-y-4 py-2 grid gap-4 grid-cols-2" key={editing?.id ?? "new"}>
          <input type="hidden" name="leaveTypeId" value={editing?.id ?? ""} />
          <div className="space-y-2 col-span-2 md:col-span-1">
            <Label htmlFor="name">Leave Name</Label>
            <input name="name" id="name" type="text" placeholder="Leave Type Name" defaultValue={editing?.name || ""} className="p-2 border rounded-md col-span-1" required />
          </div>
          <div className="space-y-2 col-span-1">
            <Label htmlFor="shortCode">Short code</Label>
            <input name="shortCode" id="shortCode" type="text" placeholder="Short Code" defaultValue={editing?.shortCode || ""} className="w-full p-2 border rounded-md col-span-1" required />
          </div>
          <div className="space-y-2 col-span-2">
            <Label htmlFor="description">Description</Label>
            <Textarea name="description" id="description" placeholder="Describe this leave type..." defaultValue={editing?.description || ""} className="min-h-[100px]" />
          </div>
          <div className="flex flex-col gap-3 my-auto">
            <Label>Set Limit</Label>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2"><input type="radio" name="isLimited" value="yes" defaultChecked={editing ? editing.isLimited : true} /> Limited</label>
              <label className="flex items-center gap-2"><input type="radio" name="isLimited" value="no" defaultChecked={editing ? !editing.isLimited : false} /> Unlimited</label>
            </div>
          </div>
          <div className="flex flex-col gap-3 my-auto">
            <Label>Value</Label>
            <div className="flex gap 4 h-9">
              <input name="limitDays" type="number" placeholder="Days" defaultValue={editing?.limitDays ?? ""} className="w-full p-2 border rounded-md" />
              <div className="text-3xl px-2 ">/</div>
              <select name="limitType" className="border rounded h-9 px-2" defaultValue={editing?.limitType ?? "YEAR"}>
                <option value="YEAR">Yearly</option>
                <option value="QUARTER">Quarterly</option>
                <option value="MONTH">Monthly</option>
              </select>
            </div>
          </div>
          <div className="mt-3 col-span-1 flex flex-col gap-3">
            <Label htmlFor="employeeType">Employee Type</Label>
            <select name="employeeType" id="employeeType" className="border rounded h-9 px-2" defaultValue={editing?.employeeType ?? "FULL_TIME"}>
              <option value="FULL_TIME">Full-time</option>
              <option value="PART_TIME">Part-time</option>
            </select>
          </div>
          {actionData && !actionData.ok && actionData.message ? (
            <div className="col-span-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">
              {actionData.message}

            </div>
          ) : null}
          <div className="col-span-2 flex justify-end gap-2">
            {editing ? (
              <Button
                type="button"
                variant="outline"
                className="rounded border-red-300 text-red-600 hover:bg-red-50"
                disabled={isSubmitting}
                onClick={() => setDeleteOpen(true)}
              >
                Delete
              </Button>
            ) : null}
            <DialogClose asChild>
              <Button variant="outline" size="sm" className="rounded" disabled={isSubmitting}>
                <EyeClosed className="h-4 w-4 mr-1" /> Cancel
              </Button>
            </DialogClose>
            <Button
              type="submit"
              name="_action"
              value={editing ? "updateLeaveType" : "createLeaveType"}
              variant="default"
              size="sm"
              className="rounded"
              disabled={isSubmitting}
              onClick={() => { lastActionRef.current = "save"; }}
            >
              {isSubmitting ? "Saving..." : "Save"}
            </Button>
          </div>
        </Form>

        
      </DialogContent>
    </Dialog>

    {/* Delete confirmation dialog */}
    <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-2xl">Delete leave type?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete the leave type.
          </DialogDescription>
        </DialogHeader>
        <Form method="post" className="flex items-center justify-end gap-2 mt-4">
          <input type="hidden" name="leaveTypeId" value={editing?.id ?? ""} />
          <Button type="button" variant="outline" onClick={() => setDeleteOpen(false)} disabled={isSubmitting}>Cancel</Button>
          <Button
            type="submit"
            name="_action"
            value="deleteLeaveType"
            variant="outline"
            className="rounded border-red-300 text-red-600 hover:bg-red-50"
            disabled={isSubmitting}
            onClick={() => { lastActionRef.current = "delete"; }}
          >
            Confirm Delete
          </Button>
        </Form>
      </DialogContent>
    </Dialog>
    </>
  );
}

export default LeaveTypeOverview;
export { LeaveTypeOverview };
