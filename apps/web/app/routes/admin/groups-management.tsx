import { Group, Plus } from "lucide-react";
import React from "react";
import type { LoaderFunctionArgs } from "react-router-dom";
import {
  useNavigation,
  useLoaderData,
  useRevalidator,
  useParams,
} from "react-router-dom";
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
import { getOrganizationUsers } from "~/lib/api/organization/users";
import { getGroupDetails } from "~/lib/api/groups/groups";

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
    return { groups: [], users: [], organizationId: "", apiKey: "" };
  }

  try {
    // Fetch both groups and users in parallel
    const [groupsResponse, usersResponse] = await Promise.all([
      getGroups({ apiKey }),
      getOrganizationUsers(currentOrgId, apiKey),
    ]);

    return {
      groups: groupsResponse,
      users: usersResponse.data,
      organizationId: currentOrgId,
      apiKey,
    };
  } catch (error) {
    console.error("Failed to fetch data:", error);
    return { groups: [], users: [], organizationId: currentOrgId, apiKey };
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
  const { groups, users, organizationId, apiKey } =
    useLoaderData<typeof loader>();
  const revalidator = useRevalidator();

  // for side sheet
  const [open, setOpen] = React.useState(false);
  const [selectedGroup, setSelectedGroup] = React.useState<Group | null>(null);
  const [groupDetails, setGroupDetails] = React.useState<{
    group: Group;
    members: Array<{
      userId: string;
      name: string;
      email: string;
      image: string | null;
      isApprovalManager: boolean;
      addedAt: string;
    }>;
  } | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleRowClick = async (group: Group) => {
    setSelectedGroup(group);
    setOpen(true);

    // Fetch group details when sheet opens
    if (group && apiKey) {
      setIsLoadingDetails(true);
      setError(null);

      try {
        const response = await getGroupDetails(group.id, apiKey);
        if (response.ok && response.data) {
          setGroupDetails(response.data);
        } else {
          setError(response.error || "Failed to fetch group details");
          setGroupDetails(null);
        }
      } catch (err) {
        console.error("Error fetching group details:", err);
        setError("Failed to fetch group details");
        setGroupDetails(null);
      } finally {
        setIsLoadingDetails(false);
      }
    }
  };

  const handleGroupCreated = () => {
    // Refresh the groups list after creating a new group
    revalidator.revalidate();
  };

  if (navigation.state === "loading") {
    return <AdminDashboardSkeleton />;
  }

  // Handle case where no data is available
  if (!groups || !users) {
    return (
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="">
            <h1 className="text-3xl font-bold">Groups Management</h1>
            <p className="text-sm text-muted-foreground">
              Manage organization groups, approval managers, and members.
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center text-muted-foreground">
            <p>
              No data available. Please check your connection and try again.
            </p>
          </div>
        </div>
      </div>
    );
  }

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
        <CreateGroupCard
          organizationId={organizationId}
          apiKey={apiKey}
          onGroupCreated={handleGroupCreated}
          users={users}
        />
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
        groupDetails={groupDetails}
        isLoadingDetails={isLoadingDetails}
        error={error}
      />
    </div>
  );
}
