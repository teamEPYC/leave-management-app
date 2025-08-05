import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Plus } from "lucide-react";
import { DataTable } from "~/components/ui/data-table";
import { UserStatusBadge } from "~/components/shared/user-status-badge";
import { UserDetailsSheet } from "~/components/userManagement/user-details-sheet";

type User = {
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
const sampleData: User[] = [
  {
    id: 1,
    name: "Utkarsh",
    email: "abd@email",
    role: "Owner",
    groups: ["Engineering"],
    status: "Active",
    leaves: ["1", "2", "3"],
  },
  {
    id: 2,
    name: "Manish",
    email: "kjhg@email",
    role: "Owner",
    groups: ["Engineering", "No-Code"],
    status: "Inactive",
    leaves: ["16", "32", "31"],
  },
  {
    id: 3,
    name: "Mishra",
    email: "abd@email",
    role: "Owner",
    groups: ["Engineering", "Leadership"],
    status: "Active",
    leaves: ["1", "2", "3"],
  },
  {
    id: 4,
    name: "Pizza",
    email: "abd@email",
    role: "Owner",
    groups: ["Engineering", "Leadership"],
    status: "Active",
  },
  {
    id: 5,
    name: "Jane Doe",
    email: "jane@example.com",
    role: "Employee",
    groups: ["Marketing"],
    status: "Inactive",
  },
];

export default function UserManagementPage() {
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
        data={sampleData}
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
