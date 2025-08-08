import * as React from "react";
import { Badge } from "~/components/ui/badge";
import { cn } from "~/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

const userStatusStyles = {
  Active: {
    label: "Active",
    color: "bg-green-100 text-green-900",
    dotColor: "bg-green-900",
  },
  Inactive: {
    label: "Inactive",
    color: "bg-gray-200 text-gray-800",
    dotColor: "bg-gray-600",
  },
} as const;

export type UserStatusType = keyof typeof userStatusStyles;

interface UserStatusBadgeProps {
  status: UserStatusType;
  editable?: boolean; // default false
  onStatusChange?: (newStatus: UserStatusType) => void;
  className?: string;
}

export function UserStatusBadge({
  status,
  editable = false,
  onStatusChange,
  className,
}: UserStatusBadgeProps) {
  const style = userStatusStyles[status];

  if (editable) {
    return (
      <Select
        value={status}
        onValueChange={(val) => onStatusChange?.(val as UserStatusType)}
      >
        <SelectTrigger
          className={cn(
            "gap-2 rounded-full border-0 shadow-sm ring-2 font-semibold ring-background focus:ring-2 focus:ring-ring h-auto py- px- hover:cursor-pointer",
            style.color,
            className
          )}
        >
          <span className={cn("h-2 w-2 rounded-full", style.dotColor)} />
          <SelectValue placeholder="Select status" />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(userStatusStyles).map(([key, val]) => (
            <SelectItem key={key} value={key} className="hover:cursor-pointer">
              <div className="flex items-center gap-2 ">{val.label}</div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  return (
    <Badge className={cn("gap-2 rounded-full", style.color, className)}>
      <span className={cn("h-2 w-2 rounded-full", style.dotColor)} />
      {style.label}
    </Badge>
  );
}
