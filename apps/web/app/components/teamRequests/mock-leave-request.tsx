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
  {
    id: 3,
    name: "Carla Davis",
    initials: "CD",
    startDate: "2025-08-10",
    endDate: "2025-08-14",
    leaveType: { code: "EL", label: "Earned Leave" },
    reason: "Taking a family vacation.",
  },
  {
    id: 4,
    name: "David Lee",
    initials: "DL",
    startDate: "2025-08-05",
    endDate: "2025-08-05",
    leaveType: { code: "WFH", label: "Work from Home" },
    reason: "Waiting for a furniture delivery at home.",
  },
  {
    id: 5,
    name: "Ella Thompson",
    initials: "ET",
    startDate: "2025-08-07",
    endDate: "2025-08-08",
    leaveType: { code: "SPL", label: "Special Leave" },
    reason: "Attending a professional development workshop.",
  },
  {
    id: 6,
    name: "Farhan Ahmed",
    initials: "FA",
    startDate: "2025-08-12",
    endDate: "2025-08-12",
    leaveType: { code: "CL", label: "Casual Leave" },
    reason: "Personal errands and paperwork.",
  },
  {
    id: 7,
    name: "Grace Miller",
    initials: "GM",
    startDate: "2025-08-09",
    endDate: "2025-08-09",
    leaveType: { code: "MAT", label: "Maternity Leave" },
    reason: "Prenatal medical checkup.",
  },
];
