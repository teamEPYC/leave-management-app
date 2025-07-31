import * as React from "react";
import { Badge } from "~/components/ui/badge"; // adjust path to your badge
import { cn } from "~/lib/utils";

// 1. Define status config
const statusStyles = {
  Pending: {
    label: "Pending for review",
    color: "bg-primary border-1",
    dotColor: "bg-white",
  },
  Approved: {
    label: "Approved",
    color: "bg-accent border-1",
    dotColor: "bg-white",
  },
  Rejected: {
    label: "Rejected",
    color: "bg-destructive border-1",
    dotColor: "bg-white",
  },
} as const;

export type StatusType = keyof typeof statusStyles;

interface StatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: StatusType;
}

export function StatusBadge({ status, className, ...props }: StatusBadgeProps) {
  const style = statusStyles[status];

  return (
    <Badge className={cn("gap-2", style.color, className)} {...props}>
      <span className={cn("h-2 w-2 rounded-full", style.dotColor)} />
      {style.label}
    </Badge>
  );
}
