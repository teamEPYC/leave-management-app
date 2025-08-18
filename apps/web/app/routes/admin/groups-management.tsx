import { Group, Plus } from "lucide-react";
import React from "react";
import type { LoaderFunctionArgs } from "react-router-dom";
import { CreateGroupCard } from "~/components/groupsManagement/create-group-card";
import { Button } from "~/components/ui/button";
import { mockGroups } from "~/components/groupsManagement/mock-groups";
import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "~/components/ui/badge";
import { UserStatusBadge } from "~/components/shared/user-status-badge";
import { DataTable } from "~/components/ui/data-table";
import { GroupDetailsSheet } from "~/components/groupsManagement/group-details-sheet";
import { se } from "date-fns/locale";
import { requireRole } from "~/lib/auth/route-guards";
import { TableSkeleton } from "~/components/shared/dashboard-skeleton";

export async function loader({ request }: LoaderFunctionArgs) {
  // Check if user has access to admin routes - optimized for performance
  const roleCheck = await requireRole(request, "/admin/groups-management", ["OWNER", "ADMIN"]);
  if (roleCheck instanceof Response) {
    return roleCheck; // Redirect response
  }

  return { groups: mockGroups };
}

export type Group = {
  id: number;
  groupName: string;
  managers: string[];
  members: string[];
  status: "Active" | "Inactive";
};

function renderLimitedList(items: string[]) {
  if (!items?.length) return null;

  const COLORS = [
    "#EF4444",
    "#F59E0B",
    "#10B981",
    "#3B82F6",
    "#8B5CF6",
    "#14B8A6",
    "#EC4899",
    "#6366F1",
  ];

  const randomColor = () => COLORS[Math.floor(Math.random() * COLORS.length)];

  const displayItems = items.slice(0, 2);
  const extraCount = items.length - displayItems.length;

  return (    
    <div className="flex items-center">
      {displayItems.map((item, index) => {
        const [color, setColor] = React.useState<string | null>(null);

        React.useEffect(() => {
          setColor(randomColor());
        }, []);

        return (
          <div
            key={item}
            className={`flex rounded-full size-8 font-semibold text-white shadow-sm ring-2 ring-background ${
              index > 0 ? "-ml-2" : ""
            }`}
            style={{ backgroundColor: color || "transparent" }}
          >
            <span className="m-auto text-xs">
              {item[0]?.toUpperCase() + (item[1] || "").toUpperCase()}
            </span>
          </div>
        );
      })}
      {extraCount > 0 && (
        <div className="-ml-2 flex items-center justify-center rounded-full size-8 bg-muted text-muted-foreground text-xs font-medium ring-2 ring-background">
          +{extraCount}
        </div>
      )}
    </div>
  );
}

//Will move it to new page once I get types from backend - as it will not be edited often
export const groupColumns: ColumnDef<Group>[] = [
  {
    accessorKey: "groupName",
    header: "Group Name",
    cell: ({ row }) => {
      const name = row.getValue("groupName") as string;
      return <div className="px-2 font-semibold ">{name}</div>;
    },
  },
  {
    accessorKey: "managers",
    header: "Managers",
    cell: ({ row }) => {
      const managers = row.getValue("managers") as string[];
      return <div className="px-2">{renderLimitedList(managers)}</div>;
    },
  },
  {
    accessorKey: "members",
    header: "Members",
    cell: ({ row }) => {
      const members = row.getValue("members") as string[];
      return <div className="px-2">{renderLimitedList(members)}</div>;
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
];

export default function GroupsManagementPage() {  
  // for side sheet
  const [open, setOpen] = React.useState(false);
  const [selectedGroup, setSelectedGroup] = React.useState<Group | null>(null);

  const handleRowClick = (group: Group) => {
    setSelectedGroup(group);
    setOpen(true);
  };

  return (
    <div className="space-y-4">
      {/* <TableSkeleton/> */}
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="">
          <h1 className="text-3xl font-bold">Approval Groups Management </h1>
          <p className="text-sm text-muted-foreground">
            Manage organization Groups, and Approval managers.
          </p>
        </div>
        <CreateGroupCard />
      </div>
      {/* Table for grp detail */}
      <DataTable
        columns={groupColumns}
        data={mockGroups}
        searchKey="groupName"
        onRowClick={handleRowClick}
      />
      <GroupDetailsSheet
        group={selectedGroup}
        open={open}
        onOpenChange={setOpen}
      />
    </div>
  );
}
