// components/teamRequests/mock-leave-requests.ts

import type { LeaveRequest } from "~/routes/admin/team-requests";

export const mockLeaveRequests: LeaveRequest[] = [
  {
    id: 1,
    name: "Alice Johnson",
    initials: "AJ",
    startDate: "2025-08-04",
    endDate: "2025-08-04",
    leaveType: { code: "OOO", label: "Casual Leave" },
    reason: "Attending a family wedding in a different city.",
  },
  {
    id: 2,
    name: "Bob Smith",
    initials: "BS",
    startDate: "2025-08-01",
    endDate: "2025-08-03",
    leaveType: { code: "WFH", label: "Sick Leave" },
    reason: "Not feeling well, need rest for recovery and doctor consultation.",
  },
];
