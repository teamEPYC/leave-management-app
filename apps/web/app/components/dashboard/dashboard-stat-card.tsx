import * as React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";
import { cn } from "~/lib/utils";
import type { LucideIcon } from "lucide-react";

interface DashboardStatCardProps {
  title: string;
  Icon: LucideIcon;
  value: string | number;
  subtext?: string;
  borderColor?: string;
}

export const DashboardStatCard: React.FC<DashboardStatCardProps> = ({
  title,
  Icon,
  value,
  subtext,
  borderColor = "border-l-primary",
}) => {
  return (
    <Card
      className={cn("rounded border-0 border-l-4 gap-0 shadow", borderColor)}
    >
      <CardHeader className="flex flex-row items-center justify-between ">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="rounded-full p-3 bg-muted">
          <Icon className="h-7 w-7 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-4xl font-bold">{value}</div>
        {subtext && <p className="text-xs text-muted-foreground">{subtext}</p>}
      </CardContent>
    </Card>
  );
};
