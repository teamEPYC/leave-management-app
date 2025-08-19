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
        </div>

        {/* Status */}
        <div className="flex flex-col gap-1">
          <span className="font-semibold">Status:</span>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Groups */}
      <div className="flex flex-col gap-1">
        <span className="font-semibold">Groups:</span>
        <div className="flex flex-wrap gap-2">
          {groups.map((group) => (
            <Badge
              key={group}
              variant="secondary"
              className="flex items-center gap-1"
            >
              {group}
              <button
                className="ml-1 hover:text-red-500"
                onClick={() => handleGroupRemove(group)}
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>

        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="mt-2 w-fit">
              + Add Group
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0" align="start">
            <Command>
              <CommandInput placeholder="Search groups..." />
              <CommandList>
                <CommandEmpty>No group found.</CommandEmpty>
                {allGroups.map((group) => (
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
    </div>
  );
};
