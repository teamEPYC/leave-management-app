import { ProgressIndicator } from "~/components/shared/progress-indicator";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  CalendarDays,
  Clock10,
  ExternalLink,
  Hospital,
  Users,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { RecentLeaveRequest } from "~/components/dashboard/recentLeaves/recent-leave-request";
import { LeaveHistoryItem } from "~/components/myLeaves/LeaveHistoryItem";
import { LeaveTypeOverview } from "~/components/leaveTypes/leave-types";

// mock data
const recentLeaves = [
  {
    leaveType: "Sick Leave",
    fromdate: "July 28, 2025",
    toDate: "July 30, 2025",
    status: "pending",
  },
  {
    leaveType: "Annual Leave",
    fromdate: "August 15, 2025",
    status: "approved",
  },
];

const pendingRequests = [
  {
    id: 1,
    type: "Sick Leave",
    startDate: "2025-07-28",
    endDate: "2025-07-30",
    days: 3,
    status: "pending",
    reason: "Fever",
    appliedOn: "2025-07-25",
  },
  {
    id: 2,
    type: "Casual Leave",
    startDate: "2025-08-02",
    endDate: "2025-08-03",
    days: 2,
    status: "pending",
    reason: "Family trip",
    appliedOn: "2025-07-26",
  },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Manage team-wide leave requests and user data.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Requests
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">+2 since yesterday</p>
          </CardContent>
        </Card>
        <Card className="rounded-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">42</div>
            <p className="text-xs text-muted-foreground">Team members</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-12">
        <Card className="col-span-6">
          <CardHeader>
            <CardTitle>Pending Team Requests</CardTitle>
            <CardDescription>
              Approve or reject pending team leaves.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            {pendingRequests.slice(0, 5).map((leave) => (
              <LeaveHistoryItem key={leave.id} leave={leave} />
            ))}
          </CardContent>
        </Card>
        <div className="col-span-6">
          <LeaveTypeOverview />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-12">
        <Card className="col-span-6">
          <CardHeader>
            <CardTitle>My Leaves</CardTitle>
            <CardDescription>
              Your leave requests and their current status.
            </CardDescription>
          </CardHeader>
          {recentLeaves.map((leave, index) => (
            <RecentLeaveRequest
              key={index}
              leaveType={leave.leaveType}
              fromdate={leave.fromdate}
              toDate={leave.toDate}
              status={leave.status}
            />
          ))}
        </Card>

        <Card className="col-span-6">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Perform actions related to users and approvals.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: "Add New User", desc: "Register a new team member" },
              {
                label: "Create Leave Type",
                desc: "Define new leave categories",
              },
              {
                label: "Manage Approval Groups",
                desc: "Set group-level leave policies",
              },
              {
                label: "Schedule All-Hands",
                desc: "Plan upcoming team meetings",
              },
              { label: "Export Reports", desc: "Download leave data reports" },
            ].map((item, idx) => (
              <button
                key={idx}
                className="w-full text-left p-3 rounded-lg border hover:bg-accent transition-colors"
              >
                <p className="font-medium">{item.label}</p>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </button>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
