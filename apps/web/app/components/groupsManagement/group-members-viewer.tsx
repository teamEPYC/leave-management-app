"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import GroupMemberEditor from "./group-member-editor";
import { Edit, Edit2 } from "lucide-react";

interface GroupMembersViewerProps {
  members: string[];
  allUsers: string[]; //  users to add from all memebers of org
  onUpdate: (updatedMembers: string[]) => void;
}

export default function GroupMembersViewer({
  members,
  allUsers,
  onUpdate,
}: GroupMembersViewerProps) {
  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  return (
    <Card className="rounded border-0 w-full p-0 shadow-none">
      <CardHeader className="p-0">
        <CardDescription>
          <div className="flex flex-row gap-2 items-center">
            <Edit size={16} />
            <CardDescription className="">Team Members:</CardDescription>
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 p-0 ">
        <div className="flex flex-wrap gap-3 max-h-[200px] overflow-y-auto">
          {members.length === 0 && (
            <p className="text-muted-foreground text-sm">
              No members added yet.
            </p>
          )}
          {members.map((member) => (
            <div key={member} className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={`https://api.dicebear.com/7.x/initials/svg?seed=${member}`}
                />
                <AvatarFallback>{getInitials(member)}</AvatarFallback>
              </Avatar>
              <span className="text-sm">{member}</span>
            </div>
          ))}
        </div>
        <GroupMemberEditor
          currentMembers={members}
          allUsers={allUsers}
          onSave={onUpdate}
        />
      </CardContent>
    </Card>
  );
}
