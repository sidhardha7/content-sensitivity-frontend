import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { X, UserPlus } from "lucide-react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { useAuth } from "@/context/AuthContext";
import { useSocket } from "@/context/SocketContext";

interface Video {
  _id: string;
  title: string;
  description?: string;
  status: string;
  safetyStatus: string;
  size: number;
  duration?: number;
  createdAt: string;
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

export default function VideoDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { socket } = useSocket();
  const [video, setVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processingProgress, setProcessingProgress] = useState<number | null>(
    null
  );
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [assigning, setAssigning] = useState(false);
  const [removingUserId, setRemovingUserId] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadVideo();
    }
  }, [id]);

  useEffect(() => {
    if (user?.role === "admin" && video) {
      loadUsers();
    }
  }, [user?.role, video]);

  useEffect(() => {
    if (!socket || !id) return;

    const handleProcessingStart = (data: {
      videoId: string;
      progress: number;
    }) => {
      if (data.videoId === id) {
        setProcessingProgress(data.progress);
      }
    };

    const handleProcessingProgress = (data: {
      videoId: string;
      progress: number;
    }) => {
      if (data.videoId === id) {
        setProcessingProgress(data.progress);
      }
    };

    const handleProcessingCompleted = (data: { videoId: string }) => {
      if (data.videoId === id) {
        setProcessingProgress(100);
        loadVideo(); // Reload to get updated status
      }
    };

    const handleProcessingFailed = (data: { videoId: string }) => {
      if (data.videoId === id) {
        setProcessingProgress(null);
        loadVideo(); // Reload to get updated status
      }
    };

    socket.on("processing:start", handleProcessingStart);
    socket.on("processing:progress", handleProcessingProgress);
    socket.on("processing:completed", handleProcessingCompleted);
    socket.on("processing:failed", handleProcessingFailed);

    return () => {
      socket.off("processing:start", handleProcessingStart);
      socket.off("processing:progress", handleProcessingProgress);
      socket.off("processing:completed", handleProcessingCompleted);
      socket.off("processing:failed", handleProcessingFailed);
    };
  }, [socket, id]);

  const loadVideo = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/videos/${id}`);
      setVideo(response.data.video);

      // Create video URL for streaming (if processed)
      if (response.data.video.status === "processed") {
        const token = localStorage.getItem("token");
        const apiUrl =
          import.meta.env.VITE_API_URL || "http://localhost:5000/api";
        const baseUrl = apiUrl.replace("/api", "");
        setVideoUrl(`${baseUrl}/api/videos/${id}/stream?token=${token}`);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load video");
    } finally {
      setLoading(false);
    }
  };

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
      await api.post(`/videos/${id}/assign/add`, {
        userIds: [selectedUserId],
      });
      toast.success("User assigned successfully!");
      setSelectedUserId("");
      loadVideo(); // Reload to get updated assignedTo
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
      await api.post(`/videos/${id}/assign/remove`, {
        userIds: [userId],
      });
      toast.success("User removed successfully!");
      loadVideo(); // Reload to get updated assignedTo
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Failed to remove user";
      toast.error(errorMessage);
    } finally {
      setRemovingUserId(null);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/videos/${id}`);
      toast.success("Video deleted successfully!");
      navigate("/videos");
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Failed to delete video";
      setError(errorMessage);
      toast.error(errorMessage);
      setDeleteDialogOpen(false);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center py-8 text-muted-foreground">
          Loading video...
        </div>
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardContent className="pt-6 text-center text-red-600">
            {error || "Video not found"}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{video.title}</h1>
        {(user?.role === "editor" || user?.role === "admin") && (
          <>
            <Button
              variant="destructive"
              onClick={() => setDeleteDialogOpen(true)}
            >
              Delete
            </Button>
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Delete Video</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to delete "{video.title}"? This action
                    cannot be undone.
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
          </>
        )}
      </div>

      {video.status === "processing" && processingProgress !== null && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Processing video...</span>
                <span>{processingProgress}%</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{ width: `${processingProgress}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {video.status === "processed" && videoUrl && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <video
              controls
              className="w-full rounded-lg"
              src={videoUrl}
              preload="metadata"
              crossOrigin="anonymous"
              onError={(e) => {
                console.error("Video playback error:", e);
                setError("Failed to load video. Please try again.");
              }}
            >
              Your browser does not support the video tag.
            </video>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Video Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-muted-foreground">
              {video.description || "No description provided"}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2">Status</h3>
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
            </div>
            <div>
              <h3 className="font-semibold mb-2">Safety Status</h3>
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
            </div>
            <div>
              <h3 className="font-semibold mb-2">Size</h3>
              <p className="text-muted-foreground">
                {(video.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Duration</h3>
              <p className="text-muted-foreground">
                {Math.floor(video.duration ?? 0 / 60)}:
                {String(video.duration ?? 0 % 60).padStart(2, "0")}
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Uploaded By</h3>
              <p className="text-muted-foreground">{video.owner.name}</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Uploaded At</h3>
              <p className="text-muted-foreground">
                {new Date(video.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Video Assignments Section - Only for admins */}
      {user?.role === "admin" && (
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
                <Select
                  value={selectedUserId}
                  onValueChange={setSelectedUserId}
                >
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
      )}
    </div>
  );
}
