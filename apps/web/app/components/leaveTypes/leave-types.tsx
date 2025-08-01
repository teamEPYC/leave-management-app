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
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";

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
              <PlusCircle className="mr-2 h-4 w-4" /> Add Leave Type
            </Button>
          </DialogTrigger>
        </CardHeader>

        <CardContent className="space-y-4 rounded">
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

        <div className="space-y-4 py-2 grid gap-4 grid-cols-2">
          {/* Placeholder for the form inputs */}

          <div className="space-y-2 col-span-1">
            <Label>Leave Name</Label>
            <input
              type="text"
              placeholder="Leave Type Name"
              className="p-2 border rounded-md col-span-1"
            />
          </div>
          <div className="space-y-2 col-span-1">
            <Label>Short code</Label>
            <input
              type="text"
              placeholder="Short Code"
              className="w-full p-2 border rounded-md col-span-1"
            />
          </div>
          <div className="space-y-2 col-span-2">
            <Label>Description</Label>
            <Textarea
              id="Leave Description"
              placeholder="Describe this leave type..."
              className="min-h-[100px]"
            />
          </div>
          <RadioGroup defaultValue="option-one" className="col-span-1 my-auto">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="option-one" id="option-one" />
              <Label htmlFor="option-one">Limited</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="option-two" id="option-two" />
              <Label htmlFor="option-two">Unlimited</Label>
            </div>
          </RadioGroup>
          {/* <select className="w-full p-2 border rounded-md">
            <option value="limited">Limited</option>
            <option value="unlimited">Unlimited</option>
          </select> */}
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
