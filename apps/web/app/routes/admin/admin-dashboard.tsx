import { ProgressIndicator } from "~/components/shared/progress-indicator";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  ArrowDownFromLineIcon,
  CalendarDays,
  CircleAlert,
  ClipboardPlus,
  Clock10,
  Clock11,
  ExternalLink,
  Filter,
  Hospital,
  Icon,
  Plane,
  Plus,
  User,
  UserPlus,
  Users,
  Users2,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { RecentLeaveRequest } from "~/components/dashboard/recentLeaves/recent-leave-request";
import { LeaveHistoryItem } from "~/components/myLeaves/LeaveHistoryItem";
import { LeaveTypeOverview } from "~/components/leaveTypes/leave-types";
import { DashboardStatCard } from "~/components/dashboard/dashboard-stat-card";

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

const stats = [
  {
    title: "Pending Requests",
    Icon: Clock10,
    value: 2,
    subtext: "+2 since yesterday",
    borderColor: "border-l-yellow-500",
  },
  {
    title: "Upcoming Leaves",
    Icon: Hospital,
    value: 8,
    subtext: "Used 8 of 20",
    borderColor: "border-l-blue-500",
  },
  {
    title: "Total Active Users",
    Icon: Users2,
    value: 4,
    subtext: "+1 today",
    borderColor: "border-l-red-500",
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

      <div className="grid gap-4 gird-cols-2 md:grid-cols-3">
        {stats.map((stat, idx) => (
          <DashboardStatCard
            key={idx}
            title={stat.title}
            Icon={stat.Icon}
            value={stat.value}
            subtext={stat.subtext}
            borderColor={stat.borderColor}
          />
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-12 rounded">
        <Card className="col-span-12 rounded border-0">
          <CardHeader>
            <div className="flex justify-between">
              <div className="flex flex-col gap-2">
                <CardTitle>Pending Team Requests</CardTitle>
                <CardDescription>
                  Approve or reject pending team leaves.
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="default" className="rounded p-2">
                  {" "}
                  <Plus /> Add Request
                </Button>
                <Button variant="outline" className="rounded p-2">
                  {" "}
                  <Filter />
                  Filter
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 ">
            {pendingRequests.slice(0, 5).map((leave) => (
              <LeaveHistoryItem key={leave.id} leave={leave} />
            ))}
          </CardContent>
        </Card>
        <div className="col-span-6">
          <LeaveTypeOverview />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-12 rounded">
        <Card className="col-span-6 rounded border-0">
          <CardHeader className="border-b border-muted">
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
        {/* will move this somewhere else */}
        <Card className="col-span-6 rounded border-0">
          <CardHeader className="border-b border-muted">
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Perform actions related to users and approvals.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 rounded">
            {[
              {
                Icon: <UserPlus size={28} />,
                label: "Add New User",
                desc: "Register a new team member",
              },
              {
                Icon: <Plane size={28} />,
                label: "Create Leave Type",
                desc: "Define new leave categories",
              },
              {
                Icon: <ArrowDownFromLineIcon size={28} />,
                label: "Manage Approval Groups",
                desc: "Set group-level leave policies",
              },
              {
                Icon: <CircleAlert size={28} />,
                label: "Schedule All-Hands",
                desc: "Plan upcoming team meetings",
              },
              {
                Icon: <ClipboardPlus size={28} />,
                label: "Export Reports",
                desc: "Download leave data reports",
              },
            ].map((item, idx) => (
              <button
                key={idx}
                className="w-full text-left p-3 rounded border-0 hover:bg-accent transition-colors"
              >
                <div className="flex justify-start items-center gap-2">
                  <div className="rounded-full p-3 bg-muted">{item.Icon}</div>
                  <div className="flex flex-col">
                    <p className="font-medium">{item.label}</p>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              </button>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
