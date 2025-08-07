// pages/admin/team-requests.tsx

import * as React from "react";
import { DataTable } from "~/components/ui/data-table";
// import { LeaveRequest } from "~/types/leave";
import type { ColumnDef } from "@tanstack/react-table";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "~/components/ui/tooltip";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import { mockLeaveRequests } from "~/components/teamRequests/mock-leave-request";
import DetailedLeaveView from "~/components/teamRequests/detailed-leave-view";

export type LeaveRequest = {
  id: number;
  name: string;
  initials: string;
  startDate: string;
  endDate: string;
  leaveType: {
    code: string;
    label: string;
  };
  reason: string;
};

export const columns: ColumnDef<LeaveRequest>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => {
      const name = row.getValue("name") as string;
      const initials = row.original.initials;
      return (
        <div className="flex items-center gap-2 px-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <span>{name}</span>
        </div>
      );
    },
  },
  {
    header: "Date",
    accessorKey: "startDate",
    cell: ({ row }) => {
      const { startDate, endDate } = row.original;
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diff = Math.max(
        1,
        Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
      );

      return (
        <div className="px-2">
          {start.toLocaleDateString()} {diff > 1 && `– ${diff} days`}
        </div>
      );
    },
  },
  {
    header: "Leave Type",
    accessorKey: "leaveType",
    cell: ({ row }) => {
      const { code, label } = row.original.leaveType;
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="text-sm font-medium p-2">{code}</span>
          </TooltipTrigger>
          <TooltipContent>
            <p>{label}</p>
          </TooltipContent>
        </Tooltip>
      );
    },
  },
  {
    header: "Reason",
    accessorKey: "reason",
    cell: ({ row }) => {
      const reason = row.getValue("reason") as string;
      return (
        <div className="line-clamp-2 max-w-xs text-muted-foreground">
          {reason}
        </div>
      );
    },
  },
];

export default function TeamRequestsPage() {
  const handleRowClick = (leaveRequest: LeaveRequest) => {
    setSelectedLeaveRequest(leaveRequest);
    setOpen(true);
  };
  // for Detailed Leave
  const [open, setOpen] = React.useState(false);
  const [selectedLeaveRequest, setSelectedLeaveRequest] =
    React.useState<LeaveRequest | null>(null);
  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">Team Leave Requests</h1>
          <p className="text-sm text-muted-foreground">
            View and manage all team leave applications.
          </p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={mockLeaveRequests}
        searchKey="name"
        onRowClick={handleRowClick}
      />
      {/*Detailed View */}
      <DetailedLeaveView
        leaveRequest={selectedLeaveRequest}
        open={open}
        onOpenChange={(o) => setOpen(o)}
      />  
    </div>
  );
}
