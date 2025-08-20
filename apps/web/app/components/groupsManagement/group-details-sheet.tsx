import type { Group } from "~/routes/admin/groups-management";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "~/components/ui/sheet";
import type { UserStatusType } from "../shared/user-status-badge";
import { UserStatusBadge } from "../shared/user-status-badge";
import React from "react";
import GroupMembersCard from "./group-members-card";

interface Props {
  group: Group | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizationId: string;
  apiKey: string;
}

export function GroupDetailsSheet({
  group,
  open,
  onOpenChange,
  organizationId,
  apiKey,
}: Props) {
  // for status badge - use the group's actual status
  const [status, setStatus] = React.useState<UserStatusType>(
    group?.isActive ? "Active" : "Inactive"
  );

  // Update status when group changes
  React.useEffect(() => {
    setStatus(group?.isActive ? "Active" : "Inactive");
  }, [group?.isActive]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[1280px] max-w-[100vw] rounded-0 md:rounded-tl-2xl p-0 pb-0 overflow-auto md:overflow-hidden md:max-w-[60vw] gap-0">
        <SheetHeader className="border-b flex flex-col">
          <SheetTitle className="flex-row text-2xl text-black font-bold">
            Group Details
          </SheetTitle>
          <SheetDescription>
            Manage {group?.name} Group from here
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-col p-4 gap-4 overflow-auto">
          {/* Name with favicon of group along with description */}
          <div className="flex flex-row gap-4 text-xl font-bold items-center ">
            <Avatar className="size-15">
              {/* replace with group.icon when available */}
              <AvatarImage
                src={group?.icon || "https://github.com/shadcn.png"}
              />
              <AvatarFallback>
                {group?.name?.substring(0, 2).toUpperCase() || "GP"}
              </AvatarFallback>
            </Avatar>
            <div className="">
              <div>{group?.name} Group</div>
              <div className="text-base font-light text-muted-foreground">
                {group?.description || "No description"}
              </div>
            </div>
          </div>
          <UserStatusBadge
            status={status}
            editable
            onStatusChange={(newStatus) => setStatus(newStatus)}
          />
          {/* Group Detail card */}
          <GroupMembersCard group={group} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
