import type { Group } from "~/routes/admin/groups-management";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Badge } from "~/components/ui/badge";
import { Users, Shield, UserCheck, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";

interface GroupMember {
  userId: string;
  name: string;
  email: string;
  image: string | null;
  isApprovalManager: boolean;
  addedAt: string;
}

interface propGroupMembersCard {
  group: Group | null;
  organizationId: string;
  apiKey: string;
  groupDetails?: {
    group: Group;
    members: GroupMember[];
  } | null;
  isLoading?: boolean;
  error?: string | null;
}

export default function GroupMembersCard({
  group,
  organizationId,
  apiKey,
  groupDetails,
  isLoading = false,
  error = null,
}: propGroupMembersCard) {
  if (!group) return null;

  // Use real data if available, otherwise show placeholder
  const members = groupDetails?.members || [];
  const approvalManagers = members.filter((m) => m.isApprovalManager);
  const regularMembers = members.filter((m) => !m.isApprovalManager);

  return (
    <div className="space-y-4">
      {/* Group Overview Card */}
      <Card className="rounded-lg border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Group Overview
          </CardTitle>
          <CardDescription>
            Basic information about the {group.name} group
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">
                Group ID
              </div>
              <div className="text-sm font-mono bg-muted px-2 py-1 rounded">
                {group.id}
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">
                Organization ID
              </div>
              <div className="text-sm font-mono bg-muted px-2 py-1 rounded">
                {group.organizationId}
              </div>
            </div>
          </div>

          {group.description && (
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">
                Description
              </div>
              <div className="text-sm bg-muted px-3 py-2 rounded">
                {group.description}
              </div>
            </div>
          )}

          {group.icon && (
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">
                Icon URL
              </div>
              <div className="text-sm font-mono bg-muted px-2 py-1 rounded break-all">
                {group.icon}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Members Management Card */}
      <Card className="rounded-lg border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Group Members
          </CardTitle>
          <CardDescription>
            Manage group members and approval managers
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">
                Loading group details...
              </span>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-8 text-red-600">
              <span>Error: {error}</span>
            </div>
          ) : (
            <>
              {/* Approval Managers */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <UserCheck className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Approval Managers</span>
                  </div>
                  <Badge variant="secondary">
                    {approvalManagers.length} manager
                    {approvalManagers.length !== 1 ? "s" : ""}
                  </Badge>
                </div>

                {approvalManagers.length > 0 ? (
                  <div className="space-y-2">
                    {approvalManagers.map((manager) => (
                      <div
                        key={manager.userId}
                        className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg"
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={manager.image || undefined} />
                          <AvatarFallback className="text-xs">
                            {manager.name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">
                            {manager.name}
                          </div>
                          <div className="text-xs text-muted-foreground truncate">
                            {manager.email}
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          Manager
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-muted/50 rounded-lg p-3 min-h-[60px] flex items-center">
                    <div className="text-sm text-muted-foreground italic">
                      No approval managers assigned yet
                    </div>
                  </div>
                )}
              </div>

              {/* Group Members */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Group Members</span>
                  </div>
                  <Badge variant="secondary">
                    {regularMembers.length} member
                    {regularMembers.length !== 1 ? "s" : ""}
                  </Badge>
                </div>

                {regularMembers.length > 0 ? (
                  <div className="space-y-2">
                    {regularMembers.map((member) => (
                      <div
                        key={member.userId}
                        className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg"
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={member.image || undefined} />
                          <AvatarFallback className="text-xs">
                            {member.name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">
                            {member.name}
                          </div>
                          <div className="text-xs text-muted-foreground truncate">
                            {member.email}
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Added {new Date(member.addedAt).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-muted/50 rounded-lg p-3 min-h-[60px] flex items-center">
                    <div className="text-sm text-muted-foreground italic">
                      No members assigned yet
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* TODO: Add edit functionality when backend endpoints are ready */}
          <div className="pt-2 border-t">
            <div className="text-xs text-muted-foreground text-center">
              Member management functionality will be available when backend
              endpoints are implemented
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
