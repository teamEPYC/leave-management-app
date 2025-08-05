"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "~/components/ui/dialog";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { PlusCircle } from "lucide-react";
import { GroupForm } from "./group-form";

export function CreateGroupCard() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" size="sm" className="rounded">
          <PlusCircle className="h-4 w-4" />
          <div className="hidden lg:block ml-2">Add Group</div>
        </Button>
      </DialogTrigger>

      <DialogContent className="">
        <GroupForm onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
