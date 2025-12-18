import { useState, useEffect } from "react";
import { toast } from "sonner";
import api from "@/lib/api";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface User {
  _id: string;
  name: string;
  role: "viewer" | "editor" | "admin";
}

interface VideoPermission {
  _id: string;
  title: string;
  description?: string;
  status: string;
  safetyStatus: string;
  createdAt: string;
  owner: {
    _id: string;
    name: string;
    email: string;
  };
  accessType?: "owner" | "assigned";
}

interface VideoPermissionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
}

export default function VideoPermissionsDialog({
  open,
  onOpenChange,
  user,
}: VideoPermissionsDialogProps) {
  const [ownedVideos, setOwnedVideos] = useState<VideoPermission[]>([]);
  const [assignedVideos, setAssignedVideos] = useState<VideoPermission[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && user) {
      loadPermissions();
    } else {
      setOwnedVideos([]);
      setAssignedVideos([]);
    }
  }, [open, user]);

  const loadPermissions = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const response = await api.get(`/admin/users/${user._id}/videos`);
      setOwnedVideos(response.data.ownedVideos || []);
      setAssignedVideos(response.data.assignedVideos || []);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Failed to load video permissions";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Video Permissions</DialogTitle>
          <DialogDescription>
            Videos that {user?.name} has access to
          </DialogDescription>
        </DialogHeader>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="ml-2">Loading permissions...</span>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Owned Videos - Show for editor and admin, hide for viewer */}
            {user?.role !== "viewer" && (
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
            {user?.role !== "admin" && (
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
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
