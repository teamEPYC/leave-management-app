import * as z from "zod";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { MultiSelect } from "~/components/shared/multi-select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { createGroup } from "~/lib/api/groups/groups";
import type { OrganizationUser } from "~/lib/api/organization/users";

const formSchema = z.object({
  name: z.string().min(1, "Group name is required"),
  description: z.string().optional(),
  icon: z.string().optional(),
  approvalManagers: z.array(z.string()).min(1, "Select at least one manager"),
  users: z.array(z.string()).optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface Props {
  onSuccess?: () => void;
  organizationId: string;
  apiKey: string;
  users: OrganizationUser[];
}

export function GroupForm({ onSuccess, organizationId, apiKey, users }: Props) {
  const [loading, setLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      icon: "",
      approvalManagers: [],
      users: [],
    },
  });

  const onSubmit = async (data: FormValues) => {
    setLoading(true);

    try {
      // Call backend API to create group
      const response = await createGroup({
        apiKey,
        organizationId,
        name: data.name,
        description: data.description || undefined,
        icon: data.icon?.trim() || undefined, // Send undefined if empty
        approvalManagerIds: data.approvalManagers,
        memberIds: data.users,
      });

      if (response && response.groupId) {
        toast.success("Group created successfully");
        form.reset(); // Reset form after successful creation
        onSuccess?.();
      } else {
        toast.error("Failed to create group");
      }
    } catch (error) {
      console.error("Failed to create group:", error);
      toast.error("Failed to create group");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Group Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter group name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Brief description about the group"
                  className="min-h-[80px] resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="icon"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Icon URL (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="https://example.com/icon.png" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Approval Managers */}
        <FormField
          control={form.control}
          name="approvalManagers"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Approval Managers</FormLabel>
              <FormControl>
                <MultiSelect
                  label=""
                  placeholder="Select approval managers"
                  selected={field.value ?? []}
                  onChange={field.onChange}
                  options={users.map((user) => ({
                    value: user.id,
                    label: `${user.name} (${user.email})`,
                  }))}
                  className="w-full"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Users */}
        <FormField
          control={form.control}
          name="users"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Group Members</FormLabel>
              <FormControl>
                <MultiSelect
                  label=""
                  placeholder="Select group members"
                  selected={field.value ?? []}
                  onChange={field.onChange}
                  options={users.map((user) => ({
                    value: user.id,
                    label: `${user.name} (${user.email})`,
                  }))}
                  className="w-full"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="submit" disabled={loading} className="min-w-[120px]">
            {loading ? "Creating..." : "Create Group"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
