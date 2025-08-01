// components/admin/LeaveTypeDialog.tsx

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "~/components/ui/select";

interface LeaveTypeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export function LeaveTypeDialog({
  open,
  onOpenChange,
  children,
}: LeaveTypeDialogProps) {
  const [name, setName] = React.useState("");
  const [type, setType] = React.useState("Limited");
  const [days, setDays] = React.useState("");

  const handleSave = () => {
    // TODO: Replace with actual submit logic or pass up to parent
    console.log({ name, type, days });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {children}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Leave Type</DialogTitle>
          <DialogDescription>
            Create a new leave type and specify its rules.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Leave Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Study Leave"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="type">Leave Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Limited">Limited</SelectItem>
                <SelectItem value="Unlimited">Unlimited</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {type === "Limited" && (
            <div className="grid gap-2">
              <Label htmlFor="days">Days Per Year</Label>
              <Input
                id="days"
                type="number"
                min={1}
                value={days}
                onChange={(e) => setDays(e.target.value)}
                placeholder="e.g. 15"
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Add</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
