import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import type { LoaderFunctionArgs } from "react-router";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Plus } from "lucide-react";
import { DataTable } from "~/components/ui/data-table";
import { UserStatusBadge } from "~/components/shared/user-status-badge";
import { UserDetailsSheet } from "~/components/userManagement/user-details-sheet";
import { mockUsers } from "~/components/userManagement/mock-users";
import { requireRole } from "~/lib/auth/route-guards";
import { useLocation, useNavigate, useNavigation } from "react-router-dom";
import { AdminDashboardSkeleton, TableSkeleton } from "~/components/shared/dashboard-skeleton";

export async function loader({ request }: LoaderFunctionArgs) {
  // Check if user has access to admin routes - optimized for performance
  const roleCheck = await requireRole(request, "/user-management", ["OWNER", "ADMIN"]);
  if (roleCheck instanceof Response) {
    return roleCheck; // Redirect response
  }

  return { users: mockUsers };
}

export type User = {
  id: number;
  name: string;
  email: string;
  role: string;
  groups: string[];
  status: "Active" | "Inactive";
  leaves?: string[];
};

export const columns: ColumnDef<User>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => {
      const name = row.getValue("name") as string;
      return (
        <div className="flex items-center gap-2 px-2">
          <img
            src={`https://api.dicebear.com/6.x/initials/svg?seed=${encodeURIComponent(
              name
            )}`}
            alt={name}
            className="w-8 h-8 rounded-full"
          />
          <span>{name}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => {
      const email = row.getValue("email") as string;
      return <div className="flex items-center gap-2 px-2">{email}</div>;
    },
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => {
      const role = row.getValue("role") as string;
      return <div className="flex items-center gap-2 px-2">{role}</div>;
    },
  },
  {
    accessorKey: "groups",
    header: "Groups",
    cell: ({ row }) => {
      const groups = row.getValue("groups") as string[];
      return (
        <div className="flex flex-wrap gap-1 p-1">
          {groups.map((group) => (
            <Badge key={group} variant="secondary">
              {group}
            </Badge>
          ))}
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as "Active" | "Inactive";
      return <UserStatusBadge className="" status={status} />;
    },
  },
];

export default function UserManagementPage() {
  // Loading state
  const navigation = useNavigation();
  const location = useLocation();

  // Only show skeleton when loading and staying on current route
  if (navigation.state === "loading" && 
      (!navigation.location || navigation.location.pathname === location.pathname)) {
    return <TableSkeleton />;
  }
  // for side sheet
  const [open, setOpen] = React.useState(false);
  const [selectedUser, setSelectedUser] = React.useState<User | null>(null);

  const handleRowClick = (user: User) => {
    setSelectedUser(user);
    setOpen(true);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-sm text-muted-foreground">
            Manage organization members, roles, and leave access.
          </p>
        </div>
        <Button size="sm" className="gap-1">
          <Plus className="h-4 w-4" /> Add User
        </Button>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={mockUsers}
        searchKey="name"
        onRowClick={handleRowClick}
      />

      {/* Sheet */}
      <UserDetailsSheet
        user={selectedUser}
        open={open}
        onOpenChange={setOpen}
      />
    </div>
  );
}
