// components/user/UserAccessEditor.tsx
import * as React from "react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../ui/select";
import { Popover, PopoverTrigger, PopoverContent } from "../ui/popover";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandItem,
} from "../ui/command";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { X } from "lucide-react";
import { cn } from "~/lib/utils";

interface UserAccessEditorProps {
  defaultRole: string;
  defaultStatus: string;
  defaultGroups: string[];
  allGroups?: string[]; // optional predefined group list
  onChange?: (data: { role: string; status: string; groups: string[] }) => void;
  readOnly?: boolean; // Add read-only mode for display purposes
}

const defaultGroupOptions = [
  "Engineering",
  "Marketing",
  "Leadership",
  "Design",
];

export const UserAccessEditor: React.FC<UserAccessEditorProps> = ({
  defaultRole,
  defaultStatus,
  defaultGroups,
  allGroups = defaultGroupOptions,
  onChange,
  readOnly = false,
}) => {
  const [role, setRole] = React.useState(defaultRole);
  const [status, setStatus] = React.useState(defaultStatus);
  const [groups, setGroups] = React.useState<string[]>(defaultGroups);
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    onChange?.({ role, status, groups });
  }, [role, status, groups, onChange]);

  const handleGroupSelect = (group: string) => {
    if (!groups.includes(group)) {
      setGroups([...groups, group]);
    }
    setOpen(false);
  };

  const handleGroupRemove = (group: string) => {
    setGroups(groups.filter((g) => g !== group));
  };

  return (
    <div className="space-y-4 mt-4 text-sm">
      <div className="flex flex-row gap-3">
        {/* Role */}
        <div className="flex flex-col gap-1">
          <span className="font-semibold">Role:</span>
          {readOnly ? (
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="w-[200px] justify-center">
                {defaultRole}
              </Badge>
            </div>
          ) : (
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Owner">Owner</SelectItem>
                <SelectItem value="Employee">Employee</SelectItem>
                <SelectItem value="Manager">Manager</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Status */}
        <div className="flex flex-col gap-1">
          <span className="font-semibold">Status:</span>
          {readOnly ? (
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="w-[200px] justify-center">
                {defaultStatus}
              </Badge>
            </div>
          ) : (
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      {/* Groups */}
      <div className="flex flex-col gap-1">
        <span className="font-semibold">Groups:</span>
        {readOnly ? (
          <div className="flex flex-wrap gap-2">
            {defaultGroups.length > 0 ? (
              defaultGroups.map((group) => (
                <Badge key={group} variant="outline">
                  {group}
                </Badge>
              ))
            ) : (
              <span className="text-muted-foreground">No groups assigned</span>
            )}
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {groups.map((group) => (
              <Badge key={group} variant="outline">
                {group}
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-2 h-auto p-0 hover:bg-transparent"
                  onClick={() => handleGroupRemove(group)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  + Add Group
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[200px] p-0">
                <Command>
                  <CommandInput placeholder="Search groups..." />
                  <CommandList>
                    <CommandEmpty>No groups found.</CommandEmpty>
                    {allGroups
                      .filter((group) => !groups.includes(group))
                      .map((group) => (
                        <CommandItem
                          key={group}
                          onSelect={() => handleGroupSelect(group)}
                        >
                          {group}
                        </CommandItem>
                      ))}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        )}
      </div>
    </div>
  );
};
