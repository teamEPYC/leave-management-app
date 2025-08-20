import * as React from "react";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { toast } from "sonner";
import {
  createUser,
  getOrganizationRoles,
  type OrganizationRole,
  type CreateUserRequest,
} from "~/lib/api/users/users";

interface AddUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  organizationId: string;
  apiKey: string;
}

export function AddUserDialog({
  open,
  onOpenChange,
  onSuccess,
  organizationId,
  apiKey,
}: AddUserDialogProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [roles, setRoles] = React.useState<OrganizationRole[]>([]);
  const [isLoadingRoles, setIsLoadingRoles] = React.useState(false);
  const [formData, setFormData] = React.useState<
    Omit<CreateUserRequest, "organizationId">
  >({
    email: "",
    name: "",
    roleId: "",
    employeeType: "FULL_TIME",
  });

  // Fetch roles when dialog opens
  React.useEffect(() => {
    if (open && organizationId && apiKey) {
      fetchRoles();
    }
  }, [open, organizationId, apiKey]);

  const fetchRoles = async () => {
    setIsLoadingRoles(true);
    try {
      console.log("Fetching roles for org:", organizationId);
      const response = await getOrganizationRoles(organizationId, apiKey);
      console.log("Roles response:", response);
      if (response.ok) {
        setRoles(response.data);
        console.log("Roles set:", response.data);
      } else {
        console.error("Roles response not ok:", response);
        toast.error("Failed to fetch roles");
      }
    } catch (error) {
      console.error("Failed to fetch roles:", error);
      toast.error("Failed to fetch roles");
    } finally {
      setIsLoadingRoles(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!formData.email || !formData.name || !formData.roleId) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await createUser(
        {
          organizationId,
          email: formData.email,
          name: formData.name,
          roleId: formData.roleId,
          employeeType: formData.employeeType,
        },
        apiKey
      );

      if (response.ok) {
        toast.success(response.data.message);
        onSuccess?.();
        onOpenChange(false);

        // Reset form
        setFormData({
          email: "",
          name: "",
          roleId: "",
          employeeType: "FULL_TIME",
        });
      } else {
        toast.error("Failed to create user");
      }
    } catch (error) {
      console.error("Failed to create user:", error);
      toast.error("Failed to create user");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New User</DialogTitle>
          <DialogDescription>
            Add a new user to your organization. They will be created
            immediately and can start using the system.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              placeholder="user@example.com"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              type="text"
              placeholder="John Doe"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="role">Role *</Label>
              <Select
                value={formData.roleId}
                onValueChange={(value) => handleInputChange("roleId", value)}
                required
                disabled={isLoadingRoles}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={isLoadingRoles ? "Loading..." : "Select role"}
                  />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Employee Type</Label>
              <Select
                value={formData.employeeType}
                onValueChange={(value) =>
                  handleInputChange("employeeType", value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FULL_TIME">Full Time</SelectItem>
                  <SelectItem value="PART_TIME">Part Time</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || isLoadingRoles}>
              {isSubmitting ? "Creating..." : "Create User"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
