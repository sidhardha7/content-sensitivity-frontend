import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { useSocket } from "@/context/SocketContext";
import DeleteVideoDialog from "@/components/video/DeleteVideoDialog";
import ProcessingProgress from "@/components/video/ProcessingProgress";
import VideoPlayer from "@/components/video/VideoPlayer";
import VideoInfo from "@/components/video/VideoInfo";
import VideoAssignments from "@/components/video/VideoAssignments";

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

export default function VideoDetail() {
  const { id } = useParams<{ id: string }>();
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

  useEffect(() => {
    if (id) {
      loadVideo();
    }
  }, [id]);

  useEffect(() => {
    if (user?.role === "admin" && video) {
      // Users will be loaded by VideoAssignments component
    }
  }, [user?.role, video]);

  // Socket.io real-time updates
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

  // Polling fallback for processing status (when Socket.io is unavailable)
  useEffect(() => {
    if (!id || !video) return;

    // Only poll if video is processing
    if (video.status !== "processing") {
      return;
    }

    const pollStatus = async () => {
      try {
        const response = await api.get(`/videos/${id}/status`);
        const { status, safetyStatus, processing } = response.data;

        // Update progress if available from polling
        if (processing?.progress !== undefined) {
          setProcessingProgress(processing.progress);
        }

        // If status changed, reload video
        if (status !== video.status || safetyStatus !== video.safetyStatus) {
          loadVideo();
        }
      } catch (err) {
        // Silently fail polling - Socket.io is primary method
        console.error("Polling status failed:", err);
      }
    };

    // Poll every 3 seconds while video is processing
    const pollInterval = setInterval(pollStatus, 3000);

    // Initial poll
    pollStatus();

    return () => {
      clearInterval(pollInterval);
    };
  }, [id, video?.status, video?.safetyStatus]);

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
          <Button
            variant="destructive"
            onClick={() => setDeleteDialogOpen(true)}
          >
            Delete
          </Button>
        )}
      </div>

      {video.status === "processing" && processingProgress !== null && (
        <ProcessingProgress progress={processingProgress} />
      )}

      {video.status === "processed" && videoUrl && (
        <VideoPlayer videoUrl={videoUrl} onError={setError} />
      )}

      <VideoInfo video={video} />

      {/* Video Assignments Section - Only for admins */}
      {user?.role === "admin" && (
        <VideoAssignments
          video={video}
          videoId={video._id}
          onUpdate={loadVideo}
        />
      )}

      <DeleteVideoDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        videoId={video._id}
        videoTitle={video.title}
        onSuccess={loadVideo}
      />
    </div>
  );
}
