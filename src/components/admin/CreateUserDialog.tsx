import { useState } from "react";
import { toast } from "sonner";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CreateUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function CreateUserDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateUserDialogProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"viewer" | "editor" | "admin">("viewer");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError("");

    try {
      const response = await api.post("/admin/users", {
        name,
        email,
        role,
      });
      onOpenChange(false);
      setName("");
      setEmail("");
      setRole("viewer");

      // Show success toast with temp password if returned
      if (response.data.tempPassword) {
        toast.success("User created successfully!", {
          description: `Temporary password: ${response.data.tempPassword}`,
          duration: 5000,
        });
      } else {
        toast.success("User created successfully!");
      }
      onSuccess();
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Failed to create user";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite New User</DialogTitle>
          <DialogDescription>
            Create a new user account in your tenant
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <label htmlFor="createName" className="text-sm font-medium">
              Display Name
            </label>
            <Input
              id="createName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="User name"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="createEmail" className="text-sm font-medium">
              Email
            </label>
            <Input
              id="createEmail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="user@example.com"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="createRole" className="text-sm font-medium">
              Role
            </label>
            <Select
              value={role}
              onValueChange={(value: "viewer" | "editor" | "admin") =>
                setRole(value)
              }
            >
              <SelectTrigger id="createRole">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="viewer">Viewer</SelectItem>
                <SelectItem value="editor">Editor</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={creating}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={creating}>
              {creating ? "Creating..." : "Create User"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
