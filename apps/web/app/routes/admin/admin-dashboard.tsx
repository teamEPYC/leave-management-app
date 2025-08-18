import { ProgressIndicator } from "~/components/shared/progress-indicator";
import { redirect, type LoaderFunctionArgs, type ActionFunctionArgs, useLoaderData, useNavigation, useLocation } from "react-router-dom";
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
import { QuickActionsCard } from "~/components/dashboard/adminDashboard/QuickActionsCard";
import { loadLeaveTypes, createLeaveTypeFromForm, updateLeaveTypeFromForm, deleteLeaveTypeFromForm, type LeaveTypeDto } from "./leave-types.server";
import { requireRole } from "~/lib/auth/route-guards";
import { AdminDashboardSkeleton } from "~/components/shared/dashboard-skeleton";

export async function loader({ request }: LoaderFunctionArgs) {
  // Check if user has access to admin routes - optimized for performance
  const roleCheck = await requireRole(request, "/admin-dashboard", ["OWNER", "ADMIN"]);
  if (roleCheck instanceof Response) {
    return roleCheck; // Redirect response
  }

  const list = await loadLeaveTypes(request);
  if (list instanceof Response) return list; // redirected
  return { leaveTypes: list as LeaveTypeDto[] };
}

export async function action({ request }: ActionFunctionArgs) {
  const form = await request.formData();
  const intent = String(form.get("_action") || "");
  if (intent === "createLeaveType") {
    const res = await createLeaveTypeFromForm(request, form);
    if (res instanceof Response) return res;
    if (!res?.ok) {
      return new Response(JSON.stringify(res), { status: 400, headers: { "Content-Type": "application/json" } });
    }
    return new Response(JSON.stringify(res), { status: 200, headers: { "Content-Type": "application/json" } });
  }
  if (intent === "updateLeaveType") {
    const res = await updateLeaveTypeFromForm(request, form);
    if (res instanceof Response) return res;
    if (!res?.ok) {
      return new Response(JSON.stringify(res), { status: 400, headers: { "Content-Type": "application/json" } });
    }
    return new Response(JSON.stringify(res), { status: 200, headers: { "Content-Type": "application/json" } });
  }
  if (intent === "deleteLeaveType") {
    const res = await deleteLeaveTypeFromForm(request, form);
    if (res instanceof Response) return res;
    if (!res?.ok) {
      return new Response(JSON.stringify(res), { status: 400, headers: { "Content-Type": "application/json" } });
    }
    return new Response(JSON.stringify(res), { status: 200, headers: { "Content-Type": "application/json" } });
  }
  return redirect("/dashboard");
}


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
  const data = useLoaderData() as { leaveTypes: LeaveTypeDto[] };
  const navigation = useNavigation();
  const location = useLocation();

  // Only show skeleton when loading and staying on current route
  if (navigation.state === "loading" && 
      (!navigation.location || navigation.location.pathname === location.pathname)) {
    return <AdminDashboardSkeleton />;
  }

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
          <LeaveTypeOverview leaveTypes={data.leaveTypes} />
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
        <QuickActionsCard />
      </div>
    </div>
  );
}
