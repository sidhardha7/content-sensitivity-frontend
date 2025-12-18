import { useState, useEffect } from "react";
import { toast } from "sonner";
import { X, UserPlus } from "lucide-react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Video {
  _id: string;
  owner: {
    _id: string;
    name: string;
    email: string;
  };
  assignedTo?: Array<{
    _id: string;
    name: string;
    email: string;
  }>;
}

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  isActive?: boolean;
}

interface VideoAssignmentsProps {
  video: Video;
  videoId: string;
  onUpdate: () => void;
}

export default function VideoAssignments({
  video,
  videoId,
  onUpdate,
}: VideoAssignmentsProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [assigning, setAssigning] = useState(false);
  const [removingUserId, setRemovingUserId] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await api.get("/admin/users");
      setUsers(response.data.users || []);
    } catch (err: any) {
      console.error("Failed to load users:", err);
    }
  };

  const handleAddUser = async () => {
    if (!selectedUserId) return;

    setAssigning(true);
    try {
      await api.post(`/videos/${videoId}/assign/add`, {
        userIds: [selectedUserId],
      });
      toast.success("User assigned successfully!");
      setSelectedUserId("");
      onUpdate();
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Failed to assign user";
      toast.error(errorMessage);
    } finally {
      setAssigning(false);
    }
  };

  const handleRemoveUser = async (userId: string) => {
    setRemovingUserId(userId);
    try {
      await api.post(`/videos/${videoId}/assign/remove`, {
        userIds: [userId],
      });
      toast.success("User removed successfully!");
      onUpdate();
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Failed to remove user";
      toast.error(errorMessage);
    } finally {
      setRemovingUserId(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Video Assignments</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Currently Assigned Users */}
        <div>
          <h3 className="font-semibold mb-3">
            Assigned Users ({video.assignedTo?.length || 0})
          </h3>
          {video.assignedTo && video.assignedTo.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {video.assignedTo.map((assignedUser) => (
                <div
                  key={assignedUser._id}
                  className="flex items-center gap-2 px-3 py-2 bg-muted rounded-md"
                >
                  <span className="text-sm">
                    {assignedUser.name} ({assignedUser.email})
                  </span>
                  <button
                    onClick={() => handleRemoveUser(assignedUser._id)}
                    disabled={removingUserId === assignedUser._id}
                    className="text-muted-foreground hover:text-destructive transition-colors"
                    title="Remove user"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No users assigned to this video
            </p>
          )}
        </div>

        {/* Add User Assignment */}
        <div className="border-t pt-4">
          <h3 className="font-semibold mb-3">Assign to User</h3>
          <div className="flex gap-2">
            <Select value={selectedUserId} onValueChange={setSelectedUserId}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Select a user to assign" />
              </SelectTrigger>
              <SelectContent>
                {users
                  .filter(
                    (u) =>
                      // Exclude already assigned users
                      !video.assignedTo?.some((au) => au._id === u._id) &&
                      // Exclude inactive users
                      u.isActive !== false &&
                      // Exclude the video owner (they already have access)
                      u._id !== video.owner._id &&
                      // Exclude admins (they already have access to all videos)
                      u.role !== "admin"
                  )
                  .map((u) => (
                    <SelectItem key={u._id} value={u._id}>
                      {u.name} ({u.email}) - {u.role}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <Button
              onClick={handleAddUser}
              disabled={!selectedUserId || assigning}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              {assigning ? "Assigning..." : "Assign"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
