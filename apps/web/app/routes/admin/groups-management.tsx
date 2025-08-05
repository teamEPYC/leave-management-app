import { Plus } from "lucide-react";
import { CreateGroupCard } from "~/components/groupsManagement/create-group-card";
import { Button } from "~/components/ui/button";

export default function GroupsManagementPage() {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="">
          <h1 className="text-3xl font-bold">Approval Groups Management </h1>
          <p className="text-sm text-muted-foreground">
            Manage organization Groups, and Approval managers.
          </p>
        </div>
        <CreateGroupCard />
        {/* <Button size="sm" className="gap-1 mt-2">
          <Plus className="h-4 w-4" />{" "}
          <div className="hidden md:block">Create Groups</div>
        </Button> */}
      </div>
    </div>
  );
}
