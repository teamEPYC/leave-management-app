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

interface propGroupMembersCard {
  group: Group | null;
}

export default function GroupMembersCard({ group }: propGroupMembersCard) {
  return (
    <Card className="rounded border-0 ">
      <CardHeader>
        <CardTitle>Group Memebers</CardTitle>
        <CardDescription>Manage Group memebers from here</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-row text-muted-foreground text-md">
          <ApprovalManagerEditor
            managers={group?.managers || []}
            members={group?.members || []}
            onChange={(updated) => {
              // TODO: update state or trigger save mutation
              console.log("Updated managers:", updated);
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
}
