import { useState, useEffect } from "react";
import { toast } from "sonner";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { UserPlus, Trash2, Loader2, Pencil, Eye } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  const [createName, setCreateName] = useState("");
  const [createEmail, setCreateEmail] = useState("");
  const [createRole, setCreateRole] = useState<"viewer" | "editor" | "admin">(
    "viewer"
  );
  const [creating, setCreating] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editRole, setEditRole] = useState<"viewer" | "editor" | "admin">(
    "viewer"
  );
  const [editIsActive, setEditIsActive] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [permissionsDialogOpen, setPermissionsDialogOpen] = useState(false);
  const [userForPermissions, setUserForPermissions] = useState<User | null>(
    null
  );
  const [ownedVideos, setOwnedVideos] = useState<any[]>([]);
  const [assignedVideos, setAssignedVideos] = useState<any[]>([]);
  const [loadingPermissions, setLoadingPermissions] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get("/admin/users");
      setUsers(response.data.users);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Failed to load users";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError("");

    try {
      const response = await api.post("/admin/users", {
        name: createName,
        email: createEmail,
        role: createRole,
      });
      setCreateDialogOpen(false);
      setCreateName("");
      setCreateEmail("");
      setCreateRole("viewer");
      loadUsers();

      // Show success toast with temp password if returned
      if (response.data.tempPassword) {
        toast.success("User created successfully!", {
          description: `Temporary password: ${response.data.tempPassword}`,
          duration: 5000,
        });
      } else {
        toast.success("User created successfully!");
      }
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Failed to create user";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setCreating(false);
    }
  };

  const handleEditClick = (user: User) => {
    setUserToEdit(user);
    setEditName(user.name);
    setEditEmail(user.email);
    setEditRole(user.role);
    setEditIsActive(user.isActive);
    setEditDialogOpen(true);
    setError("");
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userToEdit) return;

    setUpdating(true);
    setError("");

    try {
      await api.patch(`/admin/users/${userToEdit._id}`, {
        name: editName,
        email: editEmail,
        role: editRole,
        isActive: editIsActive,
      });
      setEditDialogOpen(false);
      setUserToEdit(null);
      loadUsers();
      toast.success("User updated successfully!");
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Failed to update user";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteClick = (user: User) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!userToDelete) return;

    setDeleting(true);
    try {
      await api.delete(`/admin/users/${userToDelete._id}`);
      setDeleteDialogOpen(false);
      setUserToDelete(null);
      loadUsers();
      toast.success("User deleted successfully!");
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Failed to delete user";
      setError(errorMessage);
      toast.error(errorMessage);
      setDeleteDialogOpen(false);
    } finally {
      setDeleting(false);
    }
  };

  const handleViewPermissions = async (user: User) => {
    setUserForPermissions(user);
    setPermissionsDialogOpen(true);
    setLoadingPermissions(true);
    setOwnedVideos([]);
    setAssignedVideos([]);

    try {
      const response = await api.get(`/admin/users/${user._id}/videos`);
      setOwnedVideos(response.data.ownedVideos || []);
      setAssignedVideos(response.data.assignedVideos || []);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Failed to load video permissions";
      toast.error(errorMessage);
    } finally {
      setLoadingPermissions(false);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      case "editor":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  return (
    <div>
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-1">Members</h1>
          <p className="text-sm text-muted-foreground">
            Manage users in your tenant
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
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
        <div className="flex items-center justify-center py-8 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          <span className="ml-2">Loading users...</span>
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                      Email
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                      Display Name
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                      Status
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                      Roles
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user._id} className="border-b hover:bg-muted/50">
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{user.email}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-sm font-medium">{user.name}</span>
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            user.isActive
                              ? "bg-green-500/20 text-green-400 border border-green-500/30"
                              : "bg-gray-500/20 text-gray-400 border border-gray-500/30"
                          }`}
                        >
                          {user.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${getRoleColor(
                              user.role
                            )}`}
                          >
                            {user.role}
                          </span>
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleViewPermissions(user)}
                            title="View video permissions"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className={`h-8 w-8 ${
                              currentUser?._id === user._id
                                ? "opacity-40 cursor-not-allowed"
                                : ""
                            }`}
                            onClick={() => {
                              if (currentUser?._id !== user._id) {
                                handleEditClick(user);
                              }
                            }}
                            disabled={currentUser?._id === user._id}
                            title={
                              currentUser?._id === user._id
                                ? "Cannot edit your own account"
                                : "Edit user"
                            }
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className={`h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10 ${
                              currentUser?._id === user._id
                                ? "opacity-40 cursor-not-allowed"
                                : ""
                            }`}
                            onClick={() => {
                              if (currentUser?._id !== user._id) {
                                handleDeleteClick(user);
                              }
                            }}
                            disabled={currentUser?._id === user._id}
                            title={
                              currentUser?._id === user._id
                                ? "Cannot delete your own account"
                                : "Delete user"
                            }
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create User Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite New User</DialogTitle>
            <DialogDescription>
              Create a new user account in your tenant
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateUser} className="space-y-4">
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
                value={createName}
                onChange={(e) => setCreateName(e.target.value)}
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
                value={createEmail}
                onChange={(e) => setCreateEmail(e.target.value)}
                required
                placeholder="user@example.com"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="createRole" className="text-sm font-medium">
                Role
              </label>
              <Select
                value={createRole}
                onValueChange={(value: "viewer" | "editor" | "admin") =>
                  setCreateRole(value)
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
                onClick={() => setCreateDialogOpen(false)}
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

      {/* Edit User Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information and settings
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateUser} className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <label htmlFor="editName" className="text-sm font-medium">
                Display Name
              </label>
              <Input
                id="editName"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                required
                placeholder="User name"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="editEmail" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="editEmail"
                type="email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                required
                placeholder="user@example.com"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="editRole" className="text-sm font-medium">
                Role
              </label>
              <Select
                value={editRole}
                onValueChange={(value: "viewer" | "editor" | "admin") =>
                  setEditRole(value)
                }
              >
                <SelectTrigger id="editRole">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="viewer">Viewer</SelectItem>
                  <SelectItem value="editor">Editor</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="editIsActive"
                checked={editIsActive}
                onChange={(e) => setEditIsActive(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
              />
              <label htmlFor="editIsActive" className="text-sm font-medium">
                Active
              </label>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditDialogOpen(false)}
                disabled={updating}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updating}>
                {updating ? "Updating..." : "Update User"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {userToDelete?.name} (
              {userToDelete?.email})? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Video Permissions Dialog */}
      <Dialog
        open={permissionsDialogOpen}
        onOpenChange={setPermissionsDialogOpen}
      >
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Video Permissions</DialogTitle>
            <DialogDescription>
              Videos that {userForPermissions?.name} has access to
            </DialogDescription>
          </DialogHeader>
          {loadingPermissions ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="ml-2">Loading permissions...</span>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Owned Videos */}
              <div>
                <h3 className="font-semibold mb-3">
                  Owned Videos ({ownedVideos.length})
                </h3>
                {ownedVideos.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No videos owned by this user
                  </p>
                ) : (
                  <div className="space-y-2">
                    {ownedVideos.map((video) => (
                      <Card key={video._id}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="font-medium">{video.title}</h4>
                              {video.description && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  {video.description}
                                </p>
                              )}
                              <div className="flex gap-2 mt-2">
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    video.status === "processed"
                                      ? "bg-green-100 text-green-800"
                                      : video.status === "processing"
                                      ? "bg-blue-100 text-blue-800"
                                      : video.status === "failed"
                                      ? "bg-red-100 text-red-800"
                                      : "bg-gray-100 text-gray-800"
                                  }`}
                                >
                                  {video.status}
                                </span>
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    video.safetyStatus === "safe"
                                      ? "bg-green-100 text-green-800"
                                      : video.safetyStatus === "flagged"
                                      ? "bg-red-100 text-red-800"
                                      : "bg-gray-100 text-gray-800"
                                  }`}
                                >
                                  {video.safetyStatus}
                                </span>
                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  Owner
                                </span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              {/* Assigned Videos */}
              <div>
                <h3 className="font-semibold mb-3">
                  Assigned Videos ({assignedVideos.length})
                </h3>
                {assignedVideos.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No videos assigned to this user
                  </p>
                ) : (
                  <div className="space-y-2">
                    {assignedVideos.map((video) => (
                      <Card key={video._id}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="font-medium">{video.title}</h4>
                              {video.description && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  {video.description}
                                </p>
                              )}
                              <p className="text-xs text-muted-foreground mt-1">
                                Owner: {video.owner.name}
                              </p>
                              <div className="flex gap-2 mt-2">
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    video.status === "processed"
                                      ? "bg-green-100 text-green-800"
                                      : video.status === "processing"
                                      ? "bg-blue-100 text-blue-800"
                                      : video.status === "failed"
                                      ? "bg-red-100 text-red-800"
                                      : "bg-gray-100 text-gray-800"
                                  }`}
                                >
                                  {video.status}
                                </span>
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    video.safetyStatus === "safe"
                                      ? "bg-green-100 text-green-800"
                                      : video.safetyStatus === "flagged"
                                      ? "bg-red-100 text-red-800"
                                      : "bg-gray-100 text-gray-800"
                                  }`}
                                >
                                  {video.safetyStatus}
                                </span>
                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                  Assigned
                                </span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setPermissionsDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Video Permissions Dialog */}
      <Dialog
        open={permissionsDialogOpen}
        onOpenChange={setPermissionsDialogOpen}
      >
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Video Permissions</DialogTitle>
            <DialogDescription>
              Videos that {userForPermissions?.name} has access to
            </DialogDescription>
          </DialogHeader>
          {loadingPermissions ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="ml-2">Loading permissions...</span>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Owned Videos - Show for editor and admin, hide for viewer */}
              {userForPermissions?.role !== "viewer" && (
                <div>
                  <h3 className="font-semibold mb-3">
                    Owned Videos ({ownedVideos.length})
                  </h3>
                  {ownedVideos.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No videos owned by this user
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {ownedVideos.map((video) => (
                        <Card key={video._id}>
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <h4 className="font-medium">{video.title}</h4>
                                {video.description && (
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {video.description}
                                  </p>
                                )}
                                <div className="flex gap-2 mt-2">
                                  <span
                                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                                      video.status === "processed"
                                        ? "bg-green-100 text-green-800"
                                        : video.status === "processing"
                                        ? "bg-blue-100 text-blue-800"
                                        : video.status === "failed"
                                        ? "bg-red-100 text-red-800"
                                        : "bg-gray-100 text-gray-800"
                                    }`}
                                  >
                                    {video.status}
                                  </span>
                                  <span
                                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                                      video.safetyStatus === "safe"
                                        ? "bg-green-100 text-green-800"
                                        : video.safetyStatus === "flagged"
                                        ? "bg-red-100 text-red-800"
                                        : "bg-gray-100 text-gray-800"
                                    }`}
                                  >
                                    {video.safetyStatus}
                                  </span>
                                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    Owner
                                  </span>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Assigned Videos - Show for viewer and editor, hide for admin */}
              {userForPermissions?.role !== "admin" && (
                <div>
                  <h3 className="font-semibold mb-3">
                    Assigned Videos ({assignedVideos.length})
                  </h3>
                  {assignedVideos.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No videos assigned to this user
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {assignedVideos.map((video) => (
                        <Card key={video._id}>
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <h4 className="font-medium">{video.title}</h4>
                                {video.description && (
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {video.description}
                                  </p>
                                )}
                                <p className="text-xs text-muted-foreground mt-1">
                                  Owner: {video.owner?.name || "Unknown"}
                                </p>
                                <div className="flex gap-2 mt-2">
                                  <span
                                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                                      video.status === "processed"
                                        ? "bg-green-100 text-green-800"
                                        : video.status === "processing"
                                        ? "bg-blue-100 text-blue-800"
                                        : video.status === "failed"
                                        ? "bg-red-100 text-red-800"
                                        : "bg-gray-100 text-gray-800"
                                    }`}
                                  >
                                    {video.status}
                                  </span>
                                  <span
                                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                                      video.safetyStatus === "safe"
                                        ? "bg-green-100 text-green-800"
                                        : video.safetyStatus === "flagged"
                                        ? "bg-red-100 text-red-800"
                                        : "bg-gray-100 text-gray-800"
                                    }`}
                                  >
                                    {video.safetyStatus}
                                  </span>
                                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                    Assigned
                                  </span>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setPermissionsDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
