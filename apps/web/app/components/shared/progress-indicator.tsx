import * as React from "react";
import { Progress } from "../ui/progress";
import { cn } from "~/lib/utils";

interface ProgressIndicatorProps {
  heading: string;
  value: number;
  total: number;
  bottomText?: string;
  className?: string;
  Icon?: React.FC<{ className: string }>;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  Icon,
  heading,
  value,
  total,
  bottomText,
  className,
}) => {
  const percent =
    total > 0 ? Math.min(100, Math.max(0, (value / total) * 100)) : 0;

  return (
    <div className={cn("space-y-2 p-4 border-0 rounded bg-card", className)}>
      <div className="flex flex-row gap-3 justify-between">
        <h3 className="text-lg font-semibold text-foreground">{heading}</h3>
        {Icon && <Icon className={cn("w-6 h-6")} />}
      </div>
      <div className="flex items-baseline justify-between">
        <span className="text-3xl font-bold">{value}</span>
        <span className="text-sm text-muted-foreground">/ {total}</span>
      </div>
      <Progress value={Math.round(percent)} className="h-3 rounded-full" />
      {bottomText && (
        <p className="text-sm text-muted-foreground">{bottomText}</p>
      )}
    </div>
  );
};

ProgressIndicator.displayName = "ProgressIndicator";
