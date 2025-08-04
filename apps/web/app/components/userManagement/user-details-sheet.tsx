import * as React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import type { ColumnDef } from "@tanstack/react-table";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "~/components/ui/sheet";
import { Card, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { UserStatusBadge } from "../shared/user-status-badge";
import { Button } from "../ui/button";
import {
  CalendarDays,
  Clock10,
  ExternalLink,
  Hospital,
  Users2,
} from "lucide-react";
import { DataTable } from "../ui/data-table";
import Dashboard from "~/routes/dashboard";
import { EditableProgressIndicator } from "./EditableProgressIndicator";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  groups: string[];
  status: "Active" | "Inactive";
}

// mock for prog indicator
const stats = [
  {
    title: "Leave Balance",
    Icon: Clock10,
    value: 2,
    total: 18,
  },
  {
    title: "Work from Home",
    Icon: Hospital,
    value: 8,
    total: 18,
  },
  {
    title: "Pending Requests",
    Icon: Users2,
    value: 4,
    total: 18,
  },
];

// For leaves history Data table
interface Leaves {
  leave: string;
  appliedOn: string;
  status: string;
}

const sampleLeave: Leaves[] = [
  {
    leave: "2nd july",
    appliedOn: "string",
    status: "string",
  },
  {
    leave: "3rd july",
    appliedOn: "string",
    status: "string",
  },
  {
    leave: "4th july",
    appliedOn: "string",
    status: "string",
  },
];

interface Props {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const columns: ColumnDef<Leaves>[] = [
  {
    accessorKey: "leave",
    header: "Leave",
    cell: ({ row }) => {
      const leave = row.getValue("leave") as string;
      return <div className="flex items-center gap-2 px-2">{leave}</div>;
    },
  },
  {
    accessorKey: "appliedOn",
    header: "Applied on",
    cell: ({ row }) => {
      const appliedOn = row.getValue("appliedOn") as string;
      return <div className="flex items-center gap-2 px-2">{appliedOn}</div>;
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return <div className="flex items-center gap-2 px-2">{status}</div>;
    },
  },
];

export function UserDetailsSheet({ user, open, onOpenChange }: Props) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[1280px] max-w-[100vw] rounded-0 md:rounded-tl-2xl p-0 pb-0 overflow-auto md:overflow-hidden md:max-w-[60vw] gap-0">
        <SheetHeader className="border-b flex flex-row items-center gap-5">
          <SheetTitle className="flex flex-row text-2xl text-black font-bold">
            User Details
          </SheetTitle>
        </SheetHeader>
        {user && (
          <div className="flex flex-col p-4 gap-4 overflow-auto">
            {/* Name with favicon of user */}
            <div className="flex flex-row gap-4 text-xl font-bold items-center">
              <Avatar className="size-12">
                {/* replave with user.favicon */}
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
              <div className="">
                <div>{user.name}</div>
                <div className="text-sm font-light text-muted-foreground">
                  {user.email}
                </div>
              </div>
            </div>

            {/* User detail card */}
            <Card className="rounded border-0">
              <CardHeader className="flex justify-between">
                <div className="flex flex-col gap-2">
                  <CardTitle>Leave History</CardTitle>
                  <CardDescription>
                    Users leave History, requests and their current status.
                  </CardDescription>
                </div>
                {/* future - Will open approve screen with the users name as filter */}
                <Button className="rounded" variant={"ghost"}>
                  <ExternalLink />
                </Button>
              </CardHeader>
              {/* data table of past leaves */}
              <div className="p-4 pt-0 max-h-84 overflow-auto">
                <DataTable
                  columns={columns}
                  data={sampleLeave}
                  searchKey="leave"
                />
              </div>
            </Card>

            {/* Leave balance card with progress indicator*/}

            <div className="grid grid-cols-2 gap-4">
              {stats.map((stats) => (
                <EditableProgressIndicator
                  heading={stats.title}
                  value={stats.value}
                  total={stats.total}
                  Icon={stats.Icon}
                  onChange={(used, total) =>
                    console.log("Updated:", used, total)
                  }
                />
              ))}
            </div>

            <div className="space-y-4 mt-4 text-sm">
              <div>
                <span className="font-semibold">Role:</span> {user.role}
              </div>
              <div>
                <span className="font-semibold">Groups:</span>{" "}
                {user.groups.join(", ")}
              </div>
              <div>
                <span className="font-semibold">Status:</span> {user.status}
              </div>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
