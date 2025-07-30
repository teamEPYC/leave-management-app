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
  Clock,
  ExternalLink,
  Hospital,
  TrendingUp,
  Users,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Link } from "react-router";

export default function Dashboard() {
  console.log("Dashboard component");
  return (
    <div className="space-y-6">
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
          value={8}
          total={20}
          bottomText="Used: 6 of 20 days"
        />

        {/* <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Available Leave Days
            </CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23</div>
            <p className="text-xs text-muted-foreground">+2 from last month</p>
          </CardContent>
        </Card> */}

        <ProgressIndicator
          heading="Pending Requests"
          value={1}
          total={2}
          bottomText={`Used: ${1} of ${2} days`}
        />
        <Card className="rounded-md">
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
        <Card className="col-span-6">
          <CardHeader className="border-b-1 w-full">
            <CardTitle>Recent Leave Requests</CardTitle>
            <CardDescription className="mb-2">
              Your latest leave applications and their status.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Annual Leave</p>
                  <p className="text-sm text-muted-foreground">
                    Dec 20 to Dec 25, 2025
                  </p>
                </div>
                <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                  Approved
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Sick Leave</p>
                  <p className="text-sm text-muted-foreground">Nov 15, 2025</p>
                </div>
                <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800">
                  Pending
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-6">
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
