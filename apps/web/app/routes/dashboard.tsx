import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { CalendarDays, Clock, Users } from "lucide-react";
import type { LoaderFunctionArgs } from "react-router";
import { requireRole } from "~/lib/auth/route-guards";
import { DashboardSkeleton } from "~/components/shared/dashboard-skeleton";
import { useNavigation } from "react-router-dom";

export async function loader({ request }: LoaderFunctionArgs) {
  // Check if user has access to user routes - optimized for performance
  const roleCheck = await requireRole(request, "/dashboard", ["OWNER", "ADMIN", "EMPLOYEE"]);
  if (roleCheck instanceof Response) {
    return roleCheck; // Redirect response
  }

  // Load dashboard data efficiently - this could be cached by React Router
  const dashboardData = {
    totalLeaveDays: 24,
    pendingRequests: 3,
    teamMembers: 12,
    leaveBalance: 18,
    recentActivity: [
      { type: "Annual Leave Approved", status: "approved", timeAgo: "2 days ago" },
      { type: "Sick Leave Pending", status: "pending", timeAgo: "1 day ago" }
    ]
  };

  return { dashboardData };
}

export default function Dashboard() {
  // const navigation = useNavigation();
  // const location = useLoaderData();

  // // Only show skeleton when loading and staying on current route
  // if (navigation.state === "loading" && 
  //     (!navigation.location || navigation.location.pathname === location.pathname)) {
  //   return <DashboardSkeleton />;
  // }
  const navigation = useNavigation();
  
  // Show skeleton while loading
  if (navigation.state === "loading") {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to your leave management dashboard
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Leave Days</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">
              +2 from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">
              Awaiting approval
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              Active members
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Leave Balance</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18</div>
            <p className="text-xs text-muted-foreground">
              Days remaining
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Your recent leave requests and approvals
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">Annual Leave Approved</p>
                  <p className="text-xs text-muted-foreground">2 days ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">Sick Leave Pending</p>
                  <p className="text-xs text-muted-foreground">1 day ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks and shortcuts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <button className="w-full text-left p-3 rounded-lg border hover:bg-accent">
                Apply for Leave
              </button>
              <button className="w-full text-left p-3 rounded-lg border hover:bg-accent">
                View Team Calendar
              </button>
              <button className="w-full text-left p-3 rounded-lg border hover:bg-accent">
                Check Leave Balance
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
