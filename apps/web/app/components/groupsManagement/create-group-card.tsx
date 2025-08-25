import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "~/components/ui/dialog";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { PlusCircle } from "lucide-react";
import { GroupForm } from "./group-form";
import type { OrganizationUser } from "~/lib/api/organization/users";

interface Props {
  organizationId: string;
  apiKey: string;
  onGroupCreated?: () => void;
  users: OrganizationUser[];
}

export function CreateGroupCard({
  organizationId,
  apiKey,
  onGroupCreated,
  users,
}: Props) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" size="sm" className="rounded">
          <PlusCircle className="h-4 w-4" />
          <div className="hidden lg:block ml-2">Add Group</div>
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl w-[90vw] max-h-[90vh] overflow-y-auto">
        <GroupForm
          onSuccess={() => {
            setOpen(false);
            onGroupCreated?.();
          }}
          organizationId={organizationId}
          apiKey={apiKey}
          users={users}
        />
      </DialogContent>
    </Dialog>
  );
}
