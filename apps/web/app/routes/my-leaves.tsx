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
import { Link } from "react-router";
import { LeaveHistoryItem } from "~/components/myLeaves/LeaveHistoryItem";

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

export default function MyLeaves() {
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Leaves</h1>
          <p className="text-muted-foreground">
            View and manage all your leave applications.
          </p>
        </div>{" "}
        <Link to={"/apply-leave"}>
          <Button>Apply for New Leave</Button>
        </Link>
      </div>

      <div className="grid gap-4">
        {/* reusable comp */}
        {leaves.map((leave) => (
          <LeaveHistoryItem key={leave.id} leave={leave} />
        ))}
      </div>
    </div>
  );
}
