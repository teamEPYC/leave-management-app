import { ProgressIndicator } from "~/components/shared/progress-indicator";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  CalendarDays,
  Clock10,
  ExternalLink,
  Hospital,
  Users,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Link } from "react-router";
import { RecentLeaveRequest } from "~/components/dashboard/recentLeaves/recent-leave-request";
import { index } from "@react-router/dev/routes";

const leaves = [
  {
    leaveType: "Sick Leave",
    fromdate: "July 28, 2025",
    toDate: "July 30, 2025",
    status: "pending",
  },
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
  {
    leaveType: "Emergency Leave",
    fromdate: "July 20, 2025",
    toDate: "July 21, 2025",
    status: "rejected",
  },
];

export default function Dashboard() {
  return (
    <div className="space-y-6 bg-muted">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's an overview of your leave management.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <ProgressIndicator
          Icon={CalendarDays}
          heading="Annual Leave Balance"
          value={14}
          total={20}
          bottomText="Used: 6 of 20 days"
        />
        <ProgressIndicator
          Icon={Hospital}
          heading="Sick Leave Balance"
          value={-8}
          total={20}
          bottomText="Used: 6 of 20 days"
        />
        <ProgressIndicator
          Icon={Clock10}
          heading="Pending Requests"
          value={1}
          total={2}
          bottomText={`Used: ${1} of ${2} days`}
        />
        <Card className="rounded border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Status</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">
              Team members on leave
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-12">
        <Card className="col-span-6 rounded border-0">
          <CardHeader className="border-b-1 w-full">
            <CardTitle>Recent Leave Requests</CardTitle>
            <CardDescription className="mb-2">
              Your latest leave applications and their status.
            </CardDescription>
          </CardHeader>
          {leaves.slice(0, 5).map((leave, index) => (
            <RecentLeaveRequest
              key={index}
              leaveType={leave.leaveType}
              fromdate={leave.fromdate}
              toDate={leave.toDate}
              status={leave.status}
            />
          ))}
        </Card>

        <Card className="col-span-6 rounded border-0">
          <CardHeader className="border-b-1">
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription className="mb-2">
              Common tasks you might want to perform.
            </CardDescription>
          </CardHeader>
          {/* Will be mapped with data from backend */}
          <CardContent className="space-y-3">
            <button className="w-full text-left p-3 rounded-lg border hover:bg-accent transition-colors">
              <p className="font-medium">Apply for Leave</p>
              <p className="text-sm text-muted-foreground">
                Submit a new leave request
              </p>
            </button>
            <button className="w-full text-left p-3 rounded-lg border hover:bg-accent transition-colors">
              <p className="font-medium">View Team Calendar</p>
              <p className="text-sm text-muted-foreground">
                Check who's on leave
              </p>
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
