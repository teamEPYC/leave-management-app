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
import { UserAccessEditor } from "./UserAccessEditor";

interface User {
  id: string;
  name: string;
  email: string;
  image: string | null;
  phone: string | null;
  employeeType: "FULL_TIME" | "PART_TIME";
  roleId: string;
  isOwner: boolean;
  roleName: string;
  joinedAt: string;
}

// mock for prog indicator
const stats = [
  {
    title: "Annual Leave Balance",
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
        <SheetHeader className="border-b flex flex-col">
          <SheetTitle className="flex flex-row text-2xl text-black font-bold">
            User Details
          </SheetTitle>
        </SheetHeader>
        {user && (
          <div className="flex flex-col p-4 gap-4 overflow-auto">
            {/* Name with favicon of user */}
            <div className="flex flex-row gap-4 text-xl font-bold items-center ">
                          <Avatar className="size-15">
              <AvatarImage src={user.image || undefined} />
              <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
              <div className="">
                <div>{user.name}</div>
                <div className="text-sm font-light text-muted-foreground">
                  {user.email}
                </div>
              </div>
            </div>
            {/* Groups and Role */}
            <div className=" p-4 ">
                          <UserAccessEditor
              defaultRole={user.roleName}
              defaultStatus="Active"
              defaultGroups={[]}
              onChange={(updated) => {
                console.log("Updated Access:", updated);
              }}
            />
            </div>
            {/* User detail card */}
            <Card className="rounded border-0 shadow-none">
              <CardHeader className="flex justify-between px-4 text-lg">
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
            <Card className="gap-y-2 border-0 shadow-none">
              <CardHeader className="px-4 text-lg">
                <CardTitle>Leave Balance</CardTitle>
                <CardDescription>Check User's Leave balance</CardDescription>
              </CardHeader>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
            </Card>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
