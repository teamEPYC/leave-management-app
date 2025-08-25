"use client";

import * as React from "react";
import { CheckCircle, ChevronDown } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "../ui/command";
import { cn } from "~/lib/utils";

interface MultiSelectProps {
  label?: string;
  options: string[] | Array<{ value: string; label: string }>;
  selected: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export const MultiSelect: React.FC<MultiSelectProps> = ({
  label,
  options,
  selected,
  onChange,
  placeholder = "Select...",
  className,
  disabled = false,
}) => {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");

  // Helper functions to work with both string and object options
  const getOptionValue = (
    option: string | { value: string; label: string }
  ): string => {
    return typeof option === "string" ? option : option.value;
  };

  const getOptionLabel = (
    option: string | { value: string; label: string }
  ): string => {
    return typeof option === "string" ? option : option.label;
  };

  // Get display labels for selected values
  const getSelectedLabels = (): string[] => {
    return selected.map((selectedValue) => {
      const option = options.find(
        (opt) => getOptionValue(opt) === selectedValue
      );
      return option ? getOptionLabel(option) : selectedValue;
    });
  };

  const toggleOption = (option: string | { value: string; label: string }) => {
    const value = getOptionValue(option);
    if (selected.includes(value)) {
      onChange(selected.filter((item) => item !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  const filteredOptions = options.filter((opt) =>
    getOptionLabel(opt).toLowerCase().includes(search.toLowerCase())
  );

  const selectedLabels = getSelectedLabels();
  const displayText =
    selectedLabels.length > 0 ? selectedLabels.join(", ") : placeholder;

  return (
    <div className={cn("space-y-1", className)}>
      {label && <label className="text-sm font-medium">{label}</label>}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between min-h-[40px]"
            disabled={disabled}
          >
            <span className="truncate text-left flex-1 mr-2">
              {displayText}
            </span>
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0 max-w-[var(--radix-popover-trigger-width)]">
          <Command>
            <CommandInput
              placeholder="Search..."
              value={search}
              onValueChange={setSearch}
              className=""
            />
            <CommandGroup>
              {filteredOptions.length ? (
                filteredOptions.map((option) => (
                  <CommandItem
                    key={getOptionValue(option)}
                    onSelect={() => toggleOption(option)}
                    className="cursor-pointer"
                  >
                    <div
                      className={cn(
                        "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border",
                        selected.includes(getOptionValue(option))
                          ? "bg-background text-primary"
                          : "opacity-50"
                      )}
                    >
                      {selected.includes(getOptionValue(option)) && (
                        <CheckCircle className="h-3 w-3" />
                      )}
                    </div>
                    <span className="truncate">{getOptionLabel(option)}</span>
                  </CommandItem>
                ))
              ) : (
                <div className="p-3 text-sm text-muted-foreground">
                  No results found.
                </div>
              )}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};
