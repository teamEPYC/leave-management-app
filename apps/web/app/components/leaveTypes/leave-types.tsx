// components/admin/LeaveTypeOverview.tsx

import * as React from "react";
import { Form, useNavigation } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "~/components/ui/card";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "~/components/ui/dialog";
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
  const isSubmitting = useNavigation().state === "submitting";

  return (
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
            <Button variant="default" size="sm" className="rounded">
              <PlusCircle className="size-4" />{" "}
              <div className="hidden lg:block ml-2">Add Leave Type</div>
            </Button>
          </DialogTrigger>
        </CardHeader>

        <CardContent className="space-y-4 rounded">
          {leaveTypes.length === 0 ? (
            <div className="text-sm text-muted-foreground">No leave types yet.</div>
          ) : (
            leaveTypes.map((type) => (
              <div key={type.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-5 h-5 text-primary">{type.icon ?? "🏷️"}</span>
                  <span className="font-medium text-sm">{type.name}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {type.isLimited && type.limitDays
                    ? `${type.limitDays} ${type.limitType?.toLowerCase() ?? "days"}`
                    : "Unlimited"}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-2xl">Add Leave Type</DialogTitle>
          <DialogDescription>
            Configure and create a new leave type in your organization.
          </DialogDescription>
        </DialogHeader>

        <Form method="post" className="space-y-4 py-2 grid gap-4 grid-cols-2">
          <input type="hidden" name="_action" value="createLeaveType" />
          <div className="space-y-2 col-span-2 md:col-span-1">
            <Label htmlFor="name">Leave Name</Label>
            <input name="name" id="name" type="text" placeholder="Leave Type Name" className="p-2 border rounded-md col-span-1" required />
          </div>
          <div className="space-y-2 col-span-1">
            <Label htmlFor="shortCode">Short code</Label>
            <input name="shortCode" id="shortCode" type="text" placeholder="Short Code" className="w-full p-2 border rounded-md col-span-1" required />
          </div>
          <div className="space-y-2 col-span-2">
            <Label htmlFor="description">Description</Label>
            <Textarea name="description" id="description" placeholder="Describe this leave type..." className="min-h-[100px]" />
          </div>
          <div className="flex flex-col gap-3 my-auto">
            <Label>Set Limit</Label>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2"><input type="radio" name="isLimited" value="yes" defaultChecked /> Limited</label>
              <label className="flex items-center gap-2"><input type="radio" name="isLimited" value="no" /> Unlimited</label>
            </div>
          </div>
          <div className="flex flex-col gap-3 my-auto">
            <Label>Value</Label>
            <div className="flex gap 4 h-9">
              <input name="limitDays" type="number" placeholder="Days" className="w-full p-2 border rounded-md" />
              <div className="text-3xl px-2 ">/</div>
              <select name="limitType" className="border rounded h-9 px-2">
                <option value="YEAR">Yearly</option>
                <option value="QUARTER">Quarterly</option>
                <option value="MONTH">Monthly</option>
              </select>
            </div>
          </div>
          <div className="mt-3 col-span-1 flex flex-col gap-3">
            <Label htmlFor="employeeType">Employee Type</Label>
            <select name="employeeType" id="employeeType" className="border rounded h-9 px-2">
              <option value="FULL_TIME">Full-time</option>
              <option value="PART_TIME">Part-time</option>
            </select>
          </div>
          <div className="col-span-2 flex justify-end gap-2">
            <DialogClose asChild>
              <Button variant="outline" size="sm" className="rounded" disabled={isSubmitting}>
                <EyeClosed className="h-4 w-4 mr-1" /> Cancel
              </Button>
            </DialogClose>
            <Button type="submit" variant="default" size="sm" className="rounded" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save"}
            </Button>
          </div>
        </Form>

        
      </DialogContent>
    </Dialog>
  );
}

export default LeaveTypeOverview;
export { LeaveTypeOverview };
