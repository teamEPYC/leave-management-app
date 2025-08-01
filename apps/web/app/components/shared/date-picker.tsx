import * as React from "react";
import { ChevronDownIcon } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { type DateRange } from "react-day-picker";

type DurationType = "full" | "half" | "multiple";

interface DatePickerProps {
  durationType: DurationType;
  value: Date | DateRange | undefined;
  onChange: (value: Date | DateRange | undefined) => void;
}

export function DatePicker({ durationType, value, onChange }: DatePickerProps) {
  const [open, setOpen] = React.useState(false);

  const isRange = durationType === "multiple";

  const formattedValue = isRange
    ? value && typeof value === "object" && "from" in value && value.from
      ? `${value.from.toLocaleDateString()}${
          value.to ? ` - ${value.to.toLocaleDateString()}` : ""
        }`
      : "Select date range"
    : value instanceof Date
    ? value.toLocaleDateString()
    : "Select date";

  return (
    <div className="flex flex-col gap-3">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-64 justify-between font-normal"
          >
            {formattedValue}
            <ChevronDownIcon className="ml-2 h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto overflow-hidden p-0" align="start">
          {isRange ? (
            <Calendar
              mode="range"
              required
              captionLayout="dropdown"
              selected={value as DateRange}
              onSelect={(v) => onChange(v)}
            />
          ) : (
            <Calendar
              mode="single"
              captionLayout="dropdown"
              selected={value as Date}
              onSelect={(v) => {
                onChange(v);
                setOpen(false);
              }}
            />
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}
  