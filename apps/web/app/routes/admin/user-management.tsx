import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import type { LoaderFunctionArgs } from "react-router";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Plus } from "lucide-react";
import { DataTable } from "~/components/ui/data-table";
import { UserStatusBadge } from "~/components/shared/user-status-badge";
import { UserDetailsSheet } from "~/components/userManagement/user-details-sheet";
import { AddUserDialog } from "~/components/userManagement/add-user-dialog";
import { requireRole } from "~/lib/auth/route-guards";
import { useNavigation, useLoaderData, useRevalidator } from "react-router-dom";
import { AdminDashboardSkeleton } from "~/components/shared/dashboard-skeleton";
import {
  getOrganizationUsers,
  type OrganizationUser,
} from "~/lib/api/organization/users";
import { getSession } from "~/lib/session.server";

export async function loader({ request }: LoaderFunctionArgs) {
  // Check if user has access to admin routes - optimized for performance
  const roleCheck = await requireRole(request, "/user-management", [
    "OWNER",
    "ADMIN",
  ]);
  if (roleCheck instanceof Response) {
    return roleCheck; // Redirect response
  }

  // Get organization users
  const session = await getSession(request.headers.get("Cookie"));
  const apiKey = session.get("apiKey") as string | undefined;
  const currentOrgId = session.get("currentOrgId") as string | undefined;

  if (!apiKey || !currentOrgId) {
    return { users: [], organizationId: "", apiKey: "" };
  }

  try {
    const response = await getOrganizationUsers(currentOrgId, apiKey);
    return {
      users: response.data,
      organizationId: currentOrgId,
      apiKey,
    };
  } catch (error) {
    console.error("Failed to fetch organization users:", error);
    return {
      users: [],
      organizationId: currentOrgId,
      apiKey,
    };
  }
}

export type User = OrganizationUser;

export const columns: ColumnDef<User>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => {
      const name = row.getValue("name") as string;
      const image = row.original.image;
      return (
        <div className="flex items-center gap-2 px-2">
          {image ? (
            <img src={image} alt={name} className="w-8 h-8 rounded-full" />
          ) : (
            <img
              src={`https://api.dicebear.com/6.x/initials/svg?seed=${encodeURIComponent(
                name
              )}`}
              alt={name}
              className="w-8 h-8 rounded-full"
            />
          )}
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
    accessorKey: "roleName",
    header: "Role",
    cell: ({ row }) => {
      const roleName = row.getValue("roleName") as string;
      const isOwner = row.original.isOwner;
      return (
        <div className="flex items-center gap-2 px-2">
          <Badge variant={isOwner ? "default" : "secondary"}>{roleName}</Badge>
        </div>
      );
    },
  },
  {
    accessorKey: "employeeType",
    header: "Type",
    cell: ({ row }) => {
      const employeeType = row.getValue("employeeType") as
        | "FULL_TIME"
        | "PART_TIME";
      return (
        <div className="flex items-center gap-2 px-2">
          <Badge variant="outline">
            {employeeType === "FULL_TIME" ? "Full Time" : "Part Time"}
          </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: "joinedAt",
    header: "Joined",
    cell: ({ row }) => {
      const joinedAt = row.getValue("joinedAt") as string;
      return (
        <div className="flex items-center gap-2 px-2">
          {new Date(joinedAt).toLocaleDateString()}
        </div>
      );
    },
  },
];

export default function UserManagementPage() {
  const navigation = useNavigation();
  const { users, organizationId, apiKey } = useLoaderData<typeof loader>();
  const revalidator = useRevalidator();

  if (navigation.state === "loading") {
    return <AdminDashboardSkeleton />;
  }

  // for side sheet
  const [open, setOpen] = React.useState(false);
  const [selectedUser, setSelectedUser] = React.useState<User | null>(null);

  // for add user dialog
  const [addUserOpen, setAddUserOpen] = React.useState(false);

  const handleRowClick = (user: User) => {
    setSelectedUser(user);
    setOpen(true);
  };

  const handleAddUserSuccess = () => {
    // Refresh the users list
    revalidator.revalidate();
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
        <Button
          size="sm"
          className="gap-1"
          onClick={() => setAddUserOpen(true)}
        >
          <Plus className="h-4 w-4" /> Add User
        </Button>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={users}
        searchKey="name"
        onRowClick={handleRowClick}
      />

      {/* User Details Sheet */}
      <UserDetailsSheet
        user={selectedUser}
        open={open}
        onOpenChange={setOpen}
      />

      {/* Add User Dialog */}
      <AddUserDialog
        open={addUserOpen}
        onOpenChange={setAddUserOpen}
        onSuccess={handleAddUserSuccess}
        organizationId={organizationId}
        apiKey={apiKey}
      />
    </div>
  );
}
