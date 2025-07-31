import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "../ui/dialog";
import * as React from "react";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Eye, Edit, Trash2, CalendarDays, EyeClosed } from "lucide-react";
import { StatusBadge } from "../shared/status-badge";
import { Badge } from "../ui/badge";

interface Leave {
  id: number;
  type: string;
  status: string;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  appliedOn: string;
}

interface LeaveHistoryItemProps {
  leave: Leave;
}

export const LeaveHistoryItem: React.FC<LeaveHistoryItemProps> = ({
  leave,
}) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <StatusBadge status="Approved" />;
      case "pending":
        return <StatusBadge status="Pending" />;
      case "rejected":
        return <StatusBadge status="Rejected" />;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };
  return (
    <Dialog>
      <DialogTrigger asChild>
        {/* the card is now a dialogue trigger */}
        <Card className="cursor-pointer hover:shadow-md transition overflow-auto">
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-4">
                  <h3 className="text-lg font-semibold">{leave.type}</h3>
                  {getStatusBadge(leave.status)}
                </div>
                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  <span>
                    From: {new Date(leave.startDate).toLocaleDateString()}
                  </span>
                  <span>
                    To: {new Date(leave.endDate).toLocaleDateString()}
                  </span>
                  <span>
                    {leave.days} day{leave.days > 1 ? "s" : ""}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6 ">
              {leave.status === "pending" && (
                <>
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4" />
                    <div className="hidden lg:block ml-1"> Edit</div>
                  </Button>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="h-4 w-4" />
                    <div className="hidden lg:block ml-1"> Delete</div>
                  </Button>
                </>
              )}
              <Button variant="default" size="sm">
                <Eye className="h-4 w-4" />
                <div className="hidden lg:block ml-1"> View</div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </DialogTrigger>

      {/* Main Dialogue  */}
      <DialogContent className="grid">
        <DialogHeader className="gap-1">
          <DialogTitle className="text-2xl flex items-center gap-4">
            <div className="flex flex-row items-center justify-center gap-1">
              <CalendarDays className="w-6 h-6 text-primary" />
              {leave.type}
            </div>
            {getStatusBadge(leave.status)}
          </DialogTitle>

          <DialogDescription className="text-muted-foreground mt-1">
            Applied on:{" "}
            <strong>{new Date(leave.appliedOn).toLocaleDateString()}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-4 text-sm text-muted-foreground">
          <div className="grid grid-cols-2 gap-y-2 gap-x-4">
            <div>
              <span className="font-medium text-foreground">From:</span>
              <br />
              {new Date(leave.startDate).toLocaleDateString()}
            </div>
            <div>
              <span className="font-medium text-foreground">To:</span>
              <br />
              {new Date(leave.endDate).toLocaleDateString()}
            </div>
            <div>
              <span className="font-medium text-foreground">Total Days:</span>
              <br />
              {leave.days} day{leave.days > 1 ? "s" : ""}
            </div>
            <div>
              <span className="font-medium text-foreground">Reason:</span>
              <br />
              {leave.reason || (
                <span className="italic text-xs">No reason provided</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          {leave.status === "pending" && (
            <>
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-1" /> Edit
              </Button>
              <Button variant="destructive" size="sm">
                <Trash2 className="h-4 w-4 mr-1" /> Delete
              </Button>
            </>
          )}
          <DialogClose asChild>
            <Button variant="default" size="sm">
              <EyeClosed className="h-4 w-4 mr-1" /> Close
            </Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
};
