import type { Group } from "~/routes/admin/groups-management";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Item } from "@radix-ui/react-select";
import ApprovalManagerEditor from "./approval-manager-editor";
import GroupMembersViewer from "./group-members-viewer";

interface propGroupMembersCard {
  group: Group | null;
}

export default function GroupMembersCard({ group }: propGroupMembersCard) {
  // TODO: Fetch managers and members from backend when endpoints are available
  const placeholderManagers: string[] = [];
  const placeholderMembers: string[] = [];

  return (
    <div className="">
      <Card className="rounded border-0">
        <CardHeader>
          <CardTitle>Group Members</CardTitle>
          <CardDescription>Manage Group members from here</CardDescription>
        </CardHeader>
        <CardContent className=" space-y-5">
          {/* Approval Managers */}
          <div className="flex flex-row text-muted-foreground text-md">
            <ApprovalManagerEditor
              managers={placeholderManagers}
              members={placeholderMembers}
              onChange={(updated) => {
                // todo -  update state or trigger save
                console.log("Updated managers:", updated);
              }}
            />
          </div>
          {/* Team members */}
          <div className="flex flex-row text-muted-foreground text-md">
            <GroupMembersViewer
              members={placeholderMembers}
              allUsers={placeholderMembers}
              onUpdate={(updated) => {
                // update the group.members or sync with backend
                console.log("Updated members:", updated);
              }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
