import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Plus } from "lucide-react";
import { DataTable } from "~/components/ui/data-table"; 
import { UserStatusBadge } from "~/components/shared/user-status-badge";

type User = {
  id: number;
  name: string;
  email: string;
  role: string;
  groups: string[];
  status: "Active" | "Inactive";
};

export const columns: ColumnDef<User>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => {
      const name = row.getValue("name") as string;
      return (
        <div className="flex items-center gap-2">
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
  },
  {
    accessorKey: "role",
    header: "Role",
  },
  {
    accessorKey: "groups",
    header: "Groups",
    cell: ({ row }) => {
      const groups = row.getValue("groups") as string[];
      return (
        <div className="flex flex-wrap gap-1">
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
      return <UserStatusBadge status={status} />;
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const user = row.original;
      return (
        <Button variant="ghost" size="sm" onClick={() => console.log(user)}>
          Manage
        </Button>
      );
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
  },
  {
    id: 2,
    name: "Manish",
    email: "kjhg@email",
    role: "Owner",
    groups: ["Engineering", "Leadership"],
    status: "Inactive",
  },
  {
    id: 3,
    name: "Mishra",
    email: "abd@email",
    role: "Owner",
    groups: ["Engineering", "Leadership"],
    status: "Active",
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
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">User Management</h1>
          <p className="text-sm text-muted-foreground">
            Manage organization members, roles, and leave access.
          </p>
        </div>
        <Button size="sm" className="gap-1">
          <Plus className="h-4 w-4" /> Add User
        </Button>
      </div>

      {/* Table */}
      <DataTable columns={columns} data={sampleData} searchKey="name" />
    </div>
  );
}
