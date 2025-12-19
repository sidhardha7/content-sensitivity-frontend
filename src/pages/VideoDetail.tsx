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
import { Loader2 } from "lucide-react";
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
  const [processingMessage, setProcessingMessage] = useState<string>("");
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [startingAnalysis, setStartingAnalysis] = useState(false);

  const loadVideo = async (showLoading = false) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      const response = await api.get(`/videos/${id}`);
      setVideo(response.data.video);

      // Create video URL for streaming (if uploaded or processed)
      // Video can be streamed even before analysis is complete
      if (
        response.data.video.status === "uploaded" ||
        response.data.video.status === "processed"
      ) {
        const token = localStorage.getItem("token");
        const apiUrl =
          import.meta.env.VITE_API_URL || "http://localhost:5000/api";
        const baseUrl = apiUrl.replace("/api", "");
        setVideoUrl(`${baseUrl}/api/videos/${id}/stream?token=${token}`);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load video");
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (id) {
      loadVideo(true);
    }
  }, [id]);

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
      }
    };

    const handleProcessingFailed = (data: { videoId: string }) => {
      if (data.videoId === id) {
        setProcessingProgress(null);
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

  const handleStartAnalysis = async () => {
    if (!id || !video) return;

    try {
      setStartingAnalysis(true);
      setError("");

      // Update video status locally
      setVideo({
        ...video,
        status: "processing",
        safetyStatus: "unknown",
      });

      // Get API base URL
      const apiUrl =
        import.meta.env.VITE_API_URL || "http://localhost:5000/api";
      const baseUrl = apiUrl.replace("/api", "");
      const token = localStorage.getItem("token");

      // Use fetch with ReadableStream for Server-Sent Events
      const response = await fetch(`${baseUrl}/api/videos/${id}/analyze`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to start analysis");
      }

      // Read the stream
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const data = JSON.parse(line.substring(6));

                if (data.progress !== undefined) {
                  setProcessingProgress(data.progress);
                }

                if (data.message) {
                  setProcessingMessage(data.message);
                }

                // Update safetyStatus whenever it's available in the stream
                if (data.safetyStatus) {
                  setVideo((prevVideo) => {
                    if (!prevVideo) return prevVideo;
                    return {
                      ...prevVideo,
                      safetyStatus: data.safetyStatus,
                    };
                  });
                }

                // If completed, update video status
                if (
                  data.status === "completed" ||
                  data.status === "processed"
                ) {
                  setVideo((prevVideo) => {
                    if (!prevVideo) return prevVideo;
                    return {
                      ...prevVideo,
                      status: "processed",
                      safetyStatus:
                        data.safetyStatus ||
                        prevVideo.safetyStatus ||
                        "unknown",
                    };
                  });
                  setStartingAnalysis(false);
                  // Reload video to ensure we have the latest state from database
                  loadVideo(false);
                }

                // If failed, update status
                if (data.status === "failed") {
                  setVideo({
                    ...video,
                    status: "failed",
                  });
                  setError(data.message || "Analysis failed");
                  setStartingAnalysis(false);
                }
              } catch (err) {
                console.error("Error parsing SSE data:", err);
              }
            }
          }
        }
      }
    } catch (err: any) {
      setError(err.message || "Failed to start analysis");
      setStartingAnalysis(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Loader2 className="animate-spin h-4 w-4 dark:text-white text-black" />
        <span>Loading video...</span>
      </div>
    );
  }

  if (error || !video) {
    return (
      <Card>
        <CardContent className="pt-6 text-center text-destructive">
          {error || "Video not found"}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold break-words">
          {video.title}
        </h1>
        {(user?.role === "editor" || user?.role === "admin") && (
          <Button
            variant="destructive"
            onClick={() => setDeleteDialogOpen(true)}
            className="w-full sm:w-auto"
          >
            Delete
          </Button>
        )}
      </div>

      {/* Video Player - Show when uploaded or processed */}
      {videoUrl && <VideoPlayer videoUrl={videoUrl} onError={setError} />}

      {/* Start Analysis Button - Show when video is uploaded, processed, or failed (allows re-analysis) */}
      {video.status !== "processing" &&
        (user?.role === "editor" || user?.role === "admin") && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">Sensitivity Analysis</h3>
                  <p className="text-sm text-muted-foreground">
                    {video.status === "uploaded"
                      ? "Start content sensitivity analysis for this video"
                      : video.status === "processed"
                      ? "Re-run content sensitivity analysis for this video"
                      : "Retry content sensitivity analysis for this video"}
                  </p>
                </div>
                <Button
                  onClick={handleStartAnalysis}
                  disabled={startingAnalysis}
                  className="w-full sm:w-auto"
                >
                  {startingAnalysis
                    ? "Starting..."
                    : video.status === "uploaded"
                    ? "Start Analysis"
                    : "Re-analyze"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

      {/* Processing Progress Bar - Show when analysis is running */}
      {video.status === "processing" && processingProgress !== null && (
        <ProcessingProgress
          progress={processingProgress}
          message={processingMessage || "Processing video..."}
        />
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
