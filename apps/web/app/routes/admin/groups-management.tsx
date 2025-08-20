import { Group, Plus } from "lucide-react";
import React from "react";
import type { LoaderFunctionArgs } from "react-router-dom";
import { useNavigation, useLoaderData, useRevalidator } from "react-router-dom";
import { CreateGroupCard } from "~/components/groupsManagement/create-group-card";
import { Button } from "~/components/ui/button";
import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "~/components/ui/badge";
import { UserStatusBadge } from "~/components/shared/user-status-badge";
import { DataTable } from "~/components/ui/data-table";
import { GroupDetailsSheet } from "~/components/groupsManagement/group-details-sheet";
import { requireRole } from "~/lib/auth/route-guards";
import { AdminDashboardSkeleton } from "~/components/shared/dashboard-skeleton";
import { getSession } from "~/lib/session.server";
import { getGroups } from "~/lib/api/groups/groups";

export async function loader({ request }: LoaderFunctionArgs) {
  // Check if user has access to admin routes - optimized for performance
  const roleCheck = await requireRole(request, "/admin/groups-management", [
    "OWNER",
    "ADMIN",
  ]);
  if (roleCheck instanceof Response) {
    return roleCheck; // Redirect response
  }

  // Get session data for API calls
  const session = await getSession(request.headers.get("Cookie"));
  const apiKey = session.get("apiKey") as string | undefined;
  const currentOrgId = session.get("currentOrgId") as string | undefined;

  if (!apiKey || !currentOrgId) {
    return { groups: [], organizationId: "", apiKey: "" };
  }

  try {
    console.log(
      "🔍 Fetching groups with apiKey:",
      apiKey ? "✅ Present" : "❌ Missing"
    );
    console.log("🔍 Organization ID:", currentOrgId);

    // Fetch real groups from backend
    const groupsResponse = await getGroups({ apiKey });
    console.log("📡 Backend response:", groupsResponse);
    console.log(
      "📊 Groups count:",
      Array.isArray(groupsResponse) ? groupsResponse.length : "Not an array"
    );
    console.log("📋 Groups data:", groupsResponse);

    return {
      groups: groupsResponse,
      organizationId: currentOrgId,
      apiKey,
    };
  } catch (error) {
    console.error("❌ Failed to fetch groups:", error);
    return { groups: [], organizationId: currentOrgId, apiKey };
  }
}

export type Group = {
  id: string; // Changed from number to string (UUID)
  organizationId: string;
  name: string; // Changed from groupName to name
  description: string | null;
  icon: string | null;
  isActive: boolean; // Changed from status to isActive
  createdAt: string;
  updatedAt: string;
  // Note: managers and members will need to be fetched separately or added to the backend response
};

export const groupColumns: ColumnDef<Group>[] = [
  {
    accessorKey: "name",
    header: "Group Name",
    cell: ({ row }) => {
      const name = row.getValue("name") as string;
      return <div className="px-2 font-semibold ">{name}</div>;
    },
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => {
      const description = row.getValue("description") as string | null;
      return (
        <div className="px-2 text-sm text-muted-foreground">
          {description || "No description"}
        </div>
      );
    },
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => {
      const isActive = row.getValue("isActive") as boolean;
      return <UserStatusBadge status={isActive ? "Active" : "Inactive"} />;
    },
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ row }) => {
      const createdAt = row.getValue("createdAt") as string;
      return (
        <div className="px-2 text-sm text-muted-foreground">
          {new Date(createdAt).toLocaleDateString()}
        </div>
      );
    },
  },
];

export default function GroupsManagementPage() {
  const navigation = useNavigation();
  const { groups, organizationId, apiKey } = useLoaderData<typeof loader>();
  const revalidator = useRevalidator();

  // Debug logging
  console.log("🎯 Component received data:");
  console.log("  - groups:", groups);
  console.log("  - groups type:", typeof groups);
  console.log(
    "  - groups length:",
    Array.isArray(groups) ? groups.length : "Not an array"
  );
  console.log("  - organizationId:", organizationId);
  console.log("  - apiKey:", apiKey ? "✅ Present" : "❌ Missing");

  if (navigation.state === "loading") {
    return <AdminDashboardSkeleton />;
  }

  // for side sheet
  const [open, setOpen] = React.useState(false);
  const [selectedGroup, setSelectedGroup] = React.useState<Group | null>(null);

  const handleRowClick = (group: Group) => {
    setSelectedGroup(group);
    setOpen(true);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="">
          <h1 className="text-3xl font-bold">Groups Management</h1>
          <p className="text-sm text-muted-foreground">
            Manage organization groups, approval managers, and members.
          </p>
        </div>
        <CreateGroupCard />
      </div>

      {/* Table for group details */}
      <DataTable
        columns={groupColumns}
        data={groups}
        searchKey="name"
        onRowClick={handleRowClick}
      />

      <GroupDetailsSheet
        group={selectedGroup}
        open={open}
        onOpenChange={setOpen}
        organizationId={organizationId}
        apiKey={apiKey}
      />
    </div>
  );
}
