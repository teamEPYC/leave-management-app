import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "../components/ui/button";
import { Eye, Edit, Trash2 } from "lucide-react";
import { StatusBadge } from "~/components/shared/status-badge";

// mock
const leaves = [
  {
    id: 1,
    type: "Annual Leave",
    startDate: "2024-12-20",
    endDate: "2024-12-25",
    days: 6,
    status: "approved",
    reason: "Christmas holidays with family",
    appliedOn: "2024-11-15",
  },
  {
    id: 2,
    type: "Sick Leave",
    startDate: "2024-11-15",
    endDate: "2024-11-15",
    days: 1,
    status: "pending",
    reason: "Fever and flu symptoms",
    appliedOn: "2024-11-14",
  },
  {
    id: 3,
    type: "Personal Leave",
    startDate: "2024-10-05",
    endDate: "2024-10-05",
    days: 1,
    status: "approved",
    reason: "Personal appointment",
    appliedOn: "2024-09-28",
  },
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case "approved":
      return <StatusBadge status="Approved" />;
    case "pending":
      return <StatusBadge status="Pending" />;
    case "rejected":
      return <StatusBadge status="Rejected" />;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

export default function MyLeaves() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Leaves</h1>
          <p className="text-muted-foreground">
            View and manage all your leave applications.
          </p>
        </div>
        <Button>Apply for New Leave</Button>
      </div>

      <div className="grid gap-4">
        {leaves.map((leave) => (
          <Card key={leave.id}>
            <CardContent className="">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-4">
                    <h3 className="text-lg font-semibold">{leave.type}</h3>
                    {getStatusBadge(leave.status)}
                  </div>
                  <div className="flex items-center gap-6 text-sm text-muted-foreground">
                    <span>
                      From: {new Date(leave.startDate).toLocaleDateString()}
                    </span>
                    <span>
                      To: {new Date(leave.endDate).toLocaleDateString()}
                    </span>
                    <span>
                      {leave.days} day{leave.days > 1 ? "s" : ""}
                    </span>
                  </div>
                  <p className="text-sm">{leave.reason}</p>
                  <p className="text-xs text-muted-foreground">
                    Applied on: {new Date(leave.appliedOn).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                  {leave.status === "pending" && (
                    <>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
