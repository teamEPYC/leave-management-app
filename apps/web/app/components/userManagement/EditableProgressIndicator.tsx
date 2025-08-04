import * as React from "react";
import { Progress } from "../ui/progress";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { cn } from "~/lib/utils";

interface EditableProgressIndicatorProps {
  heading: string;
  value: number;
  total: number;
  className?: string;
  Icon?: React.FC<{ className: string }>;
  onChange?: (value: number, total: number) => void;
  onSave?: (value: number, total: number) => void;
}

export const EditableProgressIndicator: React.FC<
  EditableProgressIndicatorProps
> = ({
  heading,
  value: initialValue,
  total: initialTotal,
  Icon,
  className,
  onChange,
  onSave,
}) => {
  const [value, setValue] = React.useState(initialValue);
  const [total, setTotal] = React.useState(initialTotal);

  const valueDiff = value - initialValue;
  const totalDiff = total - initialTotal;
  const isChanged = value !== initialValue || total !== initialTotal;

  React.useEffect(() => {
    onChange?.(value, total);
  }, [value, total, onChange]);

  const percent =
    total > 0 ? Math.min(100, Math.max(0, (value / total) * 100)) : 0;

  return (
    <div
      className={cn("space-y-3 p-4 border-0 rounded bg-card shadow", className)}
    >
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-foreground">{heading}</h3>
        {Icon && <Icon className="w-6 h-6" />}
      </div>

      <div className="flex items-baseline justify-between gap-2">
        {/* Used Field */}
        <div className="flex flex-col gap-1 relative">
          <label className="text-xs text-muted-foreground">Used</label>
          <Input
            type="number"
            value={value}
            onChange={(e) => setValue(Number(e.target.value))}
            className="w-24"
            min={0}
          />
          {valueDiff !== 0 && (
            <span
              className={cn(
                "absolute right-[-50px] top-7 text-sm font-medium",
                valueDiff > 0 ? "text-green-600" : "text-red-600"
              )}
            >
              {valueDiff > 0 ? `+${valueDiff}` : valueDiff}
            </span>
          )}
        </div>

        {/* Total Field */}
        <div className="flex flex-col gap-1 relative">
          <label className="text-xs text-muted-foreground">Total</label>
          <Input
            type="number"
            value={total}
            onChange={(e) => setTotal(Number(e.target.value))}
            className="w-24"
            min={0}
          />
          {totalDiff !== 0 && (
            <span
              className={cn(
                "absolute left-[-50px] top-7 text-sm font-medium",
                totalDiff > 0 ? "text-green-600" : "text-red-600"
              )}
            >
              {totalDiff > 0 ? `+${totalDiff}` : totalDiff}
            </span>
          )}
        </div>
      </div>

      <Progress value={Math.round(percent)} className="h-3 rounded-full" />

      <div className="flex justify-end">
        <Button
          size="sm"
          variant={isChanged ? "default" : "outline"}
          onClick={() => onSave?.(value, total)}
        >
          Save Changes
        </Button>
      </div>
    </div>
  );
};

EditableProgressIndicator.displayName = "EditableProgressIndicator";
