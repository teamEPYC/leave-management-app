import * as React from "react";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { Calendar } from "~/components/ui/calendar";
import { format } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { cn } from "~/lib/utils";
import { BellElectric, CalendarIcon } from "lucide-react";
import { MultiSelect } from "~/components/shared/multi-select";

export default function AllHandsOnDeck() {
  const [eventName, setEventName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [startDate, setStartDate] = React.useState<Date | undefined>();
  const [endDate, setEndDate] = React.useState<Date | undefined>();
  const [selectedGroups, setSelectedGroups] = React.useState<string[]>([]);
  const [restrictedLeaves, setRestrictedLeaves] = React.useState<string[]>([]);
  const [allowExceptions, setAllowExceptions] = React.useState<string[]>([]);

  const groupOptions = ["Engineering", "Design", "Product", "HR"];
  const leaveOptions = ["OOO", "WFH", "WOH", "Sick"];
  const userOptions = ["Utkarsh", "Manish", "Jane Doe"];

  const handleSubmit = () => {
    console.log({
      eventName,
      description,
      startDate,
      endDate,
      selectedGroups,
      restrictedLeaves,
      allowExceptions,
    });
  };

  return (
    <DialogContent className="max-w-xl">
      <DialogHeader>
        <DialogTitle>
          <div className="flex gap-2 items-center">
            <BellElectric size={40} /> Schedule All-Hands
          </div>
        </DialogTitle>
        <DialogDescription>
          Once activated, users will not be able to apply for leave during the
          selected period.
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-4 py-4">
        <div className="flex flex-col gap-2">
          <Label>Event Name*</Label>
          <Input
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
            placeholder="Enter title"
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label>Description</Label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Details or instructions"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <Label>Start Date & Time*</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left",
                    !startDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "PPP") : "Pick a start date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex flex-col gap-2">
            <Label>End Date & Time*</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left",
                    !endDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, "PPP") : "Pick an end date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Label>Select Groups*</Label>
          <MultiSelect
            label=""
            options={groupOptions}
            selected={selectedGroups}
            onChange={setSelectedGroups}
            placeholder="Choose groups..."
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label>Restrict Leave Types</Label>
          <MultiSelect
            label=""
            options={leaveOptions}
            selected={restrictedLeaves}
            onChange={setRestrictedLeaves}
            placeholder="Choose leave types to restrict..."
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label>Allow Exceptions</Label>
          <MultiSelect
            label=""
            options={userOptions}
            selected={allowExceptions}
            onChange={setAllowExceptions}
            placeholder="Select users allowed exception..."
          />
        </div>

        <div className="pt-2">
          <Button onClick={handleSubmit} className="w-full">
            Create All-Hands Event
          </Button>
        </div>
      </div>
    </DialogContent>
  );
}
