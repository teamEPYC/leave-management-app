import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { CalendarIcon } from "lucide-react";
import React from "react";
import { DatePicker } from "~/components/shared/date-picker";

export default function ApplyLeave() {
  const [durationType, setDurationType] = React.useState<
    "full" | "half" | "multiple"
  >("full");
  const [selectedDate, setSelectedDate] = React.useState<
    Date | { from: Date; to?: Date } | undefined
  >(undefined);
  const [leaveType, setLeaveType] = React.useState("full");

  return (
    // will need to add employee name if admin or manager is making for someone else
    <div className="mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Apply for Leave</h1>
        <p className="text-muted-foreground">
          Submit a new leave application for approval.
        </p>
      </div>

      <Card className="rounded">
        <CardHeader>
          <CardTitle>Leave Application Form</CardTitle>
          <CardDescription>
            Please fill out all required fields to submit your leave request.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="leave-type">Leave Type *</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select leave type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="annual">Annual Leave</SelectItem>
                  <SelectItem value="sick">Sick Leave</SelectItem>
                  <SelectItem value="personal">Personal Leave</SelectItem>
                  <SelectItem value="maternity">Maternity Leave</SelectItem>
                  <SelectItem value="emergency">Emergency Leave</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duration</Label>
              <Select
                value={durationType}
                onValueChange={(value) =>
                  setDurationType(value as "full" | "half" | "multiple")
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full">Full Day</SelectItem>
                  <SelectItem value="half">Half Day</SelectItem>
                  <SelectItem value="multiple">Multiple Days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="start-date">Start Date *</Label>
              <div className="relative">
                {/* <FlexibleDatePicker /> */}
                <DatePicker
                  durationType={durationType}
                  value={selectedDate}
                  onChange={(value) => {
                    setSelectedDate(
                      value as Date | { from: Date; to?: Date } | undefined
                    );
                  }}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Reason for Leave *</Label>
            <Textarea
              id="reason"
              placeholder="Please provide a brief reason for your leave request..."
              className="min-h-[100px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="handover">Work Handover Notes</Label>
            <Textarea
              id="handover"
              placeholder="Describe any work that needs to be handed over or covered during your absence..."
              className="min-h-[100px]"
            />
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <Button type="submit" className="flex-1 max-w-sm">
              Submit Leave Request
            </Button>
            <Button type="button" variant="outline">
              Save as Draft
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
