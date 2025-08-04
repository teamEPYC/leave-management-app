import * as React from "react";
import { Progress } from "../ui/progress";
import { Input } from "../ui/input"; 
import { cn } from "~/lib/utils";

interface EditableProgressIndicatorProps {
  heading: string;
  value: number;
  total: number;
  className?: string;
  Icon?: React.FC<{ className: string }>;
  onChange?: (value: number, total: number) => void;
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
}) => {
  const [value, setValue] = React.useState(initialValue);
  const [total, setTotal] = React.useState(initialTotal);

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
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">Used</label>
          <Input
            type="number"
            value={value}
            onChange={(e) => setValue(Number(e.target.value))}
            className="w-20"
            min={0}
          />
        </div>

        <span className="text-lg font-semibold text-muted-foreground"></span>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">Total</label>
          <Input
            type="number"
            value={total}
            onChange={(e) => setTotal(Number(e.target.value))}
            className="w-20"
            min={0}
          />
        </div>
      </div>

      <Progress value={Math.round(percent)} className="h-3 rounded-full" />
    </div>
  );
};

EditableProgressIndicator.displayName = "EditableProgressIndicator";
