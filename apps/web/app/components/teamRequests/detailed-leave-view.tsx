import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import type { LeaveRequest } from "~/routes/admin/team-requests";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";

interface Props {
  leaveRequest: LeaveRequest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function DetailedLeaveView({
  leaveRequest,
  open,
  onOpenChange,
}: Props) {
  if (!leaveRequest) return null;

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  const { name, initials, startDate, endDate, leaveType, reason } =
    leaveRequest;

  const formattedStart = new Date(startDate).toLocaleDateString();
  const formattedEnd = new Date(endDate).toLocaleDateString();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Leave Request Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 text-sm">
          <div className="space-y-0.5">
            <p className="text-muted-foreground text-xs">Name</p>
            <div className="flex gap-2 items-center  ">
              <Avatar className="size-6">
                <AvatarImage
                  src={`https://api.dicebear.com/7.x/initials/svg?seed=${leaveRequest.name}`}
                />
                <AvatarFallback>
                  {getInitials(leaveRequest.name)}
                </AvatarFallback>
              </Avatar>
              <p>{name}</p>
            </div>
          </div>

          <div className="space-y-0.5">
            <p className="text-muted-foreground text-xs">Leave Dates</p>
            <p>
              {formattedStart} to {formattedEnd}
            </p>
          </div>

          <div className="space-y-0.5">
            <p className="text-muted-foreground text-xs">Leave Type</p>
            <p>
              {leaveType.label} ({leaveType.code})
            </p>
          </div>

          <div className="space-y-0.5">
            <p className="text-muted-foreground text-xs">Reason</p>
            <p>{reason}</p>
          </div>
        </div>

        <DialogFooter className="mt-8 border-t pt-4">
          <div className="flex flex-col gap-4 w-full">
            {/* Reason box */}
            <div className="flex flex-col gap-2">
              <Label>Reason</Label>
              <Textarea
                // value={description}
                // onChange={(e) => setDescription(e.target.value)}
                placeholder="Details or instructions"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button variant="destructive">Reject</Button>
              <Button>Approve</Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
