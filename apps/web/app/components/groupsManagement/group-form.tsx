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
}

export function GroupForm({ onSuccess }: Props) {
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

    // simulate backend
    await new Promise((res) => setTimeout(res, 1000)); // lag before submir

    toast.success("Group created successfully");

    setLoading(false);
    onSuccess?.();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Group Name</FormLabel>
              <FormControl>
                <Input placeholder="Engineering" {...field} />
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
                  {...field}
                />
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
                  placeholder="Select users"
                  selected={field.value ?? []}
                  onChange={field.onChange}
                  options={["utkarsh", "manish", "doe"]}
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
                  placeholder="Select users"
                  selected={field.value ?? []}
                  onChange={field.onChange}
                  options={["utkarsh", "manish", "doe"]}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create Group"}
        </Button>
      </form>
    </Form>
  );
}
