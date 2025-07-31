// components/admin/LeaveTypeOverview.tsx

import * as React from "react";
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

const leaveTypes = [
  {
    icon: TreePalm,
    name: "Annual Leave",
    type: "Limited",
    days: 20,
  },
  {
    icon: Hospital,
    name: "Sick Leave",
    type: "Limited",
    days: 20,
  },
  {
    icon: CalendarDays,
    name: "Casual Leave",
    type: "Limited",
    days: 10,
  },
];

export function LeaveTypeOverview() {
  const [open, setOpen] = React.useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Card className="col-span-4">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Leave Type Overview</CardTitle>
            <CardDescription>
              Overview of your configured leave types.
            </CardDescription>
          </div>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <PlusCircle className="mr-2 h-4 w-4" /> Add Leave Type
            </Button>
          </DialogTrigger>
        </CardHeader>

        <CardContent className="space-y-4">
          {leaveTypes.map((type, idx) => (
            <div key={idx} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <type.icon className="w-5 h-5 text-primary" />
                <span className="font-medium text-sm">{type.name}</span>
              </div>
              <div className="text-sm text-muted-foreground">
                {type.type === "Limited"
                  ? `${type.days} days/year`
                  : "Unlimited"}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-2xl">Add Leave Type</DialogTitle>
          <DialogDescription>
            Configure and create a new leave type in your organization.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Placeholder for the form inputs */}
          <input
            type="text"
            placeholder="Leave Type Name"
            className="w-full p-2 border rounded-md"
          />
          <select className="w-full p-2 border rounded-md">
            <option value="limited">Limited</option>
            <option value="unlimited">Unlimited</option>
          </select>
          <input
            type="number"
            placeholder="Number of Days (if limited)"
            className="w-full p-2 border rounded-md"
          />
        </div>

        <div className="flex justify-end gap-2">
          <DialogClose asChild>
            <Button variant="outline" size="sm">
              <EyeClosed className="h-4 w-4 mr-1" /> Cancel
            </Button>
          </DialogClose>
          <Button variant="default" size="sm">
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
