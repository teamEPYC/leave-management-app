import type React from "react";
import { CardContent } from "../../ui/card";
import { StatusBadge, type StatusType } from "~/components/shared/status-badge";



interface RecentLeaveRequestProps {
  leaveType: string;
  fromdate: string;
  toDate?: string;
  status: string;
}

export const RecentLeaveRequest: React.FC<RecentLeaveRequestProps> = ({
  leaveType,
  fromdate,
  toDate,
  status,
}) => {
  const normalizedStatus =
    status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();

  const isValidStatus = ["Pending", "Approved", "Rejected"].includes(
    normalizedStatus
  );

  return (
    <div className="">
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{leaveType}</p>
              <p className="text-sm text-muted-foreground">
                {toDate ? `${fromdate} to ${toDate}` : fromdate}
              </p>
            </div>
            {isValidStatus ? (
              <StatusBadge status={normalizedStatus as StatusType} />
            ) : (
              <span className="text-sm text-muted-foreground">{status}</span>
            )}
          </div>
        </div>
      </CardContent>
    </div>
  );
};
