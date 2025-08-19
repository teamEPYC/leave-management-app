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
  options: string[];
  selected: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  className?: string;
}

export const MultiSelect: React.FC<MultiSelectProps> = ({
  label,
  options,
  selected,
  onChange,
  placeholder = "Select...",
  className,
}) => {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");

  const toggleOption = (option: string) => {
    if (selected.includes(option)) {
      onChange(selected.filter((item) => item !== option));
    } else {
      onChange([...selected, option]);
    }
  };

  const filteredOptions = options.filter((opt) =>
    opt.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={cn("space-y-1", className)}>
      {label && <label className="text-sm font-medium">{label}</label>}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {selected.length > 0 ? selected.join(", ") : placeholder}
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
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
                    key={option}
                    onSelect={() => toggleOption(option)}
                    className="cursor-pointer"
                  >
                    <div
                      className={cn(
                        "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border",
                        selected.includes(option)
                          ? "bg-background text-primary"
                          : "opacity-50"
                      )}
                    >
                      {selected.includes(option) && (
                        <CheckCircle className="h-3 w-3" />
                      )}
                    </div>
                    <span>{option}</span>
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
