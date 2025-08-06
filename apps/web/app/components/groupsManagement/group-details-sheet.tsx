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
}

export function GroupDetailsSheet({ group, open, onOpenChange }: Props) {
  // foir status badge
  const [status, setStatus] = React.useState<UserStatusType>("Active");

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[1280px] max-w-[100vw] rounded-0 md:rounded-tl-2xl p-0 pb-0 overflow-auto md:overflow-hidden md:max-w-[60vw] gap-0">
        <SheetHeader className="border-b flex flex-col">
          <SheetTitle className="flex flex-row text-2xl text-black font-bold">
            Group Detail
          </SheetTitle>
          <SheetDescription>
            Manage {group?.groupName} Group from here{" "}
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-col p-4 gap-4 overflow-auto">
          {/* Name with favicon of group along with team count*/}
          <div className="flex flex-row gap-4 text-xl font-bold items-center ">
            <Avatar className="size-15">
              {/* replace with group.favicon */}
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <div className="">
              <div>{group?.groupName} Group</div>
              <div className="text-base font-light text-muted-foreground">
                {group?.members?.length} members
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
