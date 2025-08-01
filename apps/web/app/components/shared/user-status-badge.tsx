import { Badge } from "~/components/ui/badge";
import { cn } from "~/lib/utils";

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

interface UserStatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: UserStatusType;
}

export function UserStatusBadge({
  status,
  className,
  ...props
}: UserStatusBadgeProps) {
  const style = userStatusStyles[status];
  return (
    <Badge
      className={cn("gap-2 rounded-full", style.color, className)}
      {...props}
    >
      <span className={cn("h-2 w-2 rounded-full", style.dotColor)} />
      {style.label}
    </Badge>
  );
}
