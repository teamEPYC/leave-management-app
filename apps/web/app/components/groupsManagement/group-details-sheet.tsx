import type { Group } from "~/routes/admin/groups-management";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "~/components/ui/sheet";
import type { UserStatusType } from "../shared/user-status-badge";
import { UserStatusBadge } from "../shared/user-status-badge";
import React from "react";
import GroupMembersCard from "./group-members-card";
import { Badge } from "~/components/ui/badge";
import { Calendar, Users, Shield, Clock } from "lucide-react";

interface Props {
  group: Group | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizationId: string;
  apiKey: string;
  groupDetails?: {
    group: Group;
    members: GroupMember[];
  } | null;
  isLoadingDetails?: boolean;
  error?: string | null;
}

interface GroupMember {
  userId: string;
  name: string;
  email: string;
  image: string | null;
  isApprovalManager: boolean;
  addedAt: string;
}

export function GroupDetailsSheet({
  group,
  open,
  onOpenChange,
  organizationId,
  apiKey,
  groupDetails,
  isLoadingDetails = false,
  error = null,
}: Props) {
  // for status badge - use the group's actual status
  const [status, setStatus] = React.useState<UserStatusType>(
    group?.isActive ? "Active" : "Inactive"
  );

  // Update status when group changes
  React.useEffect(() => {
    setStatus(group?.isActive ? "Active" : "Inactive");
  }, [group?.isActive]);

  if (!group) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-[1280px] max-w-[100vw] rounded-0 md:rounded-tl-2xl p-0 pb-0 overflow-auto md:overflow-hidden md:max-w-[60vw] gap-0">
          <SheetHeader className="border-b flex flex-col p-6">
            <SheetTitle className="flex-row text-2xl text-black font-bold">
              Group Details
            </SheetTitle>
            <SheetDescription>No group selected</SheetDescription>
          </SheetHeader>
          <div className="flex items-center justify-center h-64">
            <div className="text-center text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Select a group to view details</p>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  // Show loading state while fetching group details
  if (isLoadingDetails) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-[1280px] max-w-[100vw] rounded-0 md:rounded-tl-2xl p-0 pb-0 overflow-auto md:overflow-hidden md:max-w-[60vw] gap-0">
          <SheetHeader className="border-b flex flex-col p-6">
            <SheetTitle className="flex-row text-2xl text-black font-bold">
              Group Details
            </SheetTitle>
            <SheetDescription>
              Loading {group.name} Group details...
            </SheetDescription>
          </SheetHeader>
          <div className="flex items-center justify-center h-64">
            <div className="text-center text-muted-foreground">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Loading group details...</p>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  // Show error state if there was an error fetching details
  if (error) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-[1280px] max-w-[100vw] rounded-0 md:rounded-tl-2xl p-0 pb-0 overflow-auto md:overflow-hidden md:max-w-[60vw] gap-0">
          <SheetHeader className="border-b flex flex-col p-6">
            <SheetTitle className="flex-row text-2xl text-black font-bold">
              Group Details
            </SheetTitle>
            <SheetDescription>
              Error loading {group.name} Group details
            </SheetDescription>
          </SheetHeader>
          <div className="flex items-center justify-center h-64">
            <div className="text-center text-red-600">
              <p className="mb-2">Failed to load group details</p>
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[1280px] max-w-[100vw] rounded-0 md:rounded-tl-2xl p-0 pb-0 overflow-auto md:overflow-hidden md:max-w-[60vw] gap-0">
        <SheetHeader className="border-b flex flex-col p-6">
          <SheetTitle className="flex-row text-2xl text-black font-bold">
            Group Details
          </SheetTitle>
          <SheetDescription>
            Manage {group.name} Group from here
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col p-6 gap-6 overflow-auto">
          {/* Header Section - Name, Icon, Description */}
          <div className="flex flex-row gap-4 items-start">
            <Avatar className="size-16">
              <AvatarImage
                src={group.icon || "https://github.com/shadcn.png"}
                alt={`${group.name} icon`}
              />
              <AvatarFallback className="text-lg font-semibold">
                {group.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="text-2xl font-bold mb-2">{group.name}</div>
              <div className="text-base text-muted-foreground mb-3">
                {group.description || "No description provided"}
              </div>
              <div className="flex items-center gap-4">
                <UserStatusBadge
                  status={status}
                  editable
                  onStatusChange={(newStatus) => setStatus(newStatus)}
                />
                <Badge variant="outline" className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  Group
                </Badge>
              </div>
            </div>
          </div>

          {/* Group Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">
                  Created
                </span>
              </div>
              <div className="text-lg font-semibold">
                {new Date(group.createdAt).toLocaleDateString()}
              </div>
            </div>

            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">
                  Last Updated
                </span>
              </div>
              <div className="text-lg font-semibold">
                {new Date(group.updatedAt).toLocaleDateString()}
              </div>
            </div>

            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">
                  Status
                </span>
              </div>
              <div className="text-lg font-semibold">
                {group.isActive ? "Active" : "Inactive"}
              </div>
            </div>
          </div>

          {/* Group Members Section */}
          <GroupMembersCard
            group={group}
            organizationId={organizationId}
            apiKey={apiKey}
            groupDetails={groupDetails}
            isLoading={isLoadingDetails}
            error={error}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
