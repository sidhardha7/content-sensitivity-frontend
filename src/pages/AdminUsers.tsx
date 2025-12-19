import { useState, useEffect } from "react";
import { toast } from "sonner";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { UserPlus, Loader2 } from "lucide-react";
import CreateUserDialog from "@/components/admin/CreateUserDialog";
import EditUserDialog from "@/components/admin/EditUserDialog";
import DeleteUserDialog from "@/components/admin/DeleteUserDialog";
import VideoPermissionsDialog from "@/components/admin/VideoPermissionsDialog";
import UsersTable from "@/components/admin/UsersTable";

interface User {
  _id: string;
  name: string;
  email: string;
  role: "viewer" | "editor" | "admin";
  isActive: boolean;
  createdAt?: string;
  firstLogin?: string;
  lastLogin?: string;
}

export default function AdminUsers() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [permissionsDialogOpen, setPermissionsDialogOpen] = useState(false);
  const [userForPermissions, setUserForPermissions] = useState<User | null>(
    null
  );

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get("/admin/users");
      setUsers(response.data.users);
      setError("");
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Failed to load users";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (user: User) => {
    setUserToEdit(user);
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (user: User) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const handleViewPermissions = (user: User) => {
    setUserForPermissions(user);
    setPermissionsDialogOpen(true);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-1">Members</h1>
          <p className="text-sm text-muted-foreground">
            Manage users in your tenant
          </p>
        </div>
        <Button
          onClick={() => setCreateDialogOpen(true)}
          className="w-full sm:w-auto"
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Invite User
        </Button>
      </div>

      {error && !createDialogOpen && !editDialogOpen && (
        <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-8 text-muted-foreground flex items-center justify-center gap-2">
          <Loader2 className="animate-spin h-4 w-4 dark:text-white text-black" />
          <span>Loading users</span>
        </div>
      ) : (
        <UsersTable
          users={users}
          currentUserId={currentUser?._id}
          onEdit={handleEditClick}
          onDelete={handleDeleteClick}
          onViewPermissions={handleViewPermissions}
        />
      )}

      <CreateUserDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={loadUsers}
      />

      <EditUserDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        user={userToEdit}
        onSuccess={loadUsers}
      />

      <DeleteUserDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        user={userToDelete}
        onSuccess={loadUsers}
      />

      <VideoPermissionsDialog
        open={permissionsDialogOpen}
        onOpenChange={setPermissionsDialogOpen}
        user={userForPermissions}
      />
    </div>
  );
}
