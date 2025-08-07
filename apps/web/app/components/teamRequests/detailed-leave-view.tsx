import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import type { LeaveRequest } from "~/routes/admin/team-requests";

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

  const {
    name,
    initials,
    startDate,
    endDate,
    leaveType,
    reason,
  } = leaveRequest;

  const formattedStart = new Date(startDate).toLocaleDateString();
  const formattedEnd = new Date(endDate).toLocaleDateString();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Leave Request Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 text-sm">
          <div>
            <p className="text-muted-foreground text-xs">Name</p>
            <p>{name}</p>
          </div>

          <div>
            <p className="text-muted-foreground text-xs">Leave Dates</p>
            <p>{formattedStart} to {formattedEnd}</p>
          </div>

          <div>
            <p className="text-muted-foreground text-xs">Leave Type</p>
            <p>{leaveType.label} ({leaveType.code})</p>
          </div>

          <div>
            <p className="text-muted-foreground text-xs">Reason</p>
            <p>{reason}</p>
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button variant="destructive">Reject</Button>
          <Button>Approve</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
