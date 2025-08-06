"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandItem,
} from "../ui/command";
import { Badge } from "../ui/badge";
import { X } from "lucide-react";

interface Props {
  currentMembers: string[];
  allUsers: string[];
  onSave: (members: string[]) => void;
}

export default function GroupMemberEditor({
  currentMembers,
  allUsers,
  onSave,
}: Props) {
  const [open, setOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<string[]>(currentMembers);

  const handleToggle = (user: string) => {
    setSelected((prev) => {
      const updated = new Set(prev);
      if (updated.has(user)) {
        updated.delete(user);
      } else {
        updated.add(user);
      }
      return Array.from(updated);
    });
  };

  const handleRemove = (user: string) => {
    setSelected((prev) => prev.filter((u) => u !== user));
  };

  const handleSave = () => {
    onSave(selected);
    setOpen(false);
  };

  const eligibleUsers = Array.from(new Set(allUsers)); // remove duplicates

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Edit Members
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Manage Group Members</DialogTitle>
        </DialogHeader>

        <div className="flex flex-wrap gap-2 max-h-[120px] overflow-auto pr-2">
          {selected.map((user) => (
            <Badge key={user} variant="secondary" className="pr-1 pl-3">
              {user}
              <button
                className="ml-1 rounded-sm hover:text-destructive"
                onClick={() => handleRemove(user)}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>

        <Command>
          <CommandInput placeholder="Search members..." />
          <CommandList className="max-h-[200px] overflow-y-auto">
            <CommandEmpty>No users found.</CommandEmpty>
            {eligibleUsers.map((user) => (
              <CommandItem
                key={user}
                onSelect={() => handleToggle(user)}
                className="cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selected.includes(user)}
                    readOnly
                  />
                  <span>{user}</span>
                </div>
              </CommandItem>
            ))}
          </CommandList>
        </Command>

        <DialogFooter className="flex justify-end pt-4">
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
