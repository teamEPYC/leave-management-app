"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandItem,
} from "../ui/command";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Edit, Edit2, X } from "lucide-react";
import { cn } from "~/lib/utils";
import { CardDescription } from "../ui/card";

interface ApprovalManagerEditorProps {
  managers: string[];
  members: string[];
  onChange: (updatedManagers: string[]) => void;
}

export default function ApprovalManagerEditor({
  managers,
  members,
  onChange,
}: ApprovalManagerEditorProps) {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editableManagers, setEditableManagers] = React.useState<string[]>([]);

  const eligibleUsers = Array.from(
    new Set(members.filter((user) => !editableManagers.includes(user)))
  );

  const handleAdd = (user: string) => {
    if (!editableManagers.includes(user)) {
      setEditableManagers([...editableManagers, user]);
    }
  };

  const handleRemove = (user: string) => {
    setEditableManagers(editableManagers.filter((m) => m !== user));
  };

  const handleSave = () => {
    onChange(editableManagers);
    setDialogOpen(false);
  };

  React.useEffect(() => {
    if (dialogOpen) {
      setEditableManagers(managers); // preload current state
    }
  }, [dialogOpen, managers]);

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <div
          className="flex flex-wrap gap-2 border-0 p-3 pl-1 rounded cursor-pointer hover:bg-muted transition-colors"
          title="Click to manage approval managers"
        >
          <div className="flex flex-col gap-6">
            <div className="flex flex-row gap-2 justify-center items-center pl-2">
              <Edit size={16} />
              <CardDescription className="">Approval Managers:</CardDescription>
            </div>
            <div className="flex flex-row gap-2 pl-1">
              {managers.length > 0 ? (
                managers.map((manager) => (
                  <Badge key={manager} variant="secondary">
                    {manager}
                  </Badge>
                ))
              ) : (
                <span className="text-sm text-muted-foreground">
                  No approval managers
                </span>
              )}
            </div>
          </div>
        </div>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Manage Approval Managers</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {editableManagers.map((manager) => (
              <Badge key={manager} variant="secondary" className="pr-1 pl-3">
                {manager}
                <button
                  className="ml-1 hover:text-destructive"
                  onClick={() => handleRemove(manager)}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>

          <Command>
            <CommandInput placeholder="Search members..." />
            <CommandList>
              <CommandEmpty>No users found.</CommandEmpty>
              {eligibleUsers.map((user) => (
                <CommandItem
                  key={user}
                  value={user}
                  onSelect={() => handleAdd(user)}
                >
                  {user}
                </CommandItem>
              ))}
            </CommandList>
          </Command>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="ghost" onClick={() => setDialogOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
