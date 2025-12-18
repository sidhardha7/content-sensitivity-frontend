import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { useSocket } from '@/context/SocketContext';

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
}

export default function VideoDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { socket } = useSocket();
  const [video, setVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processingProgress, setProcessingProgress] = useState<number | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadVideo();
    }
  }, [id]);

  useEffect(() => {
    if (!socket || !id) return;

    const handleProcessingStart = (data: { videoId: string; progress: number }) => {
      if (data.videoId === id) {
        setProcessingProgress(data.progress);
      }
    };

    const handleProcessingProgress = (data: { videoId: string; progress: number }) => {
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

    socket.on('processing:start', handleProcessingStart);
    socket.on('processing:progress', handleProcessingProgress);
    socket.on('processing:completed', handleProcessingCompleted);
    socket.on('processing:failed', handleProcessingFailed);

    return () => {
      socket.off('processing:start', handleProcessingStart);
      socket.off('processing:progress', handleProcessingProgress);
      socket.off('processing:completed', handleProcessingCompleted);
      socket.off('processing:failed', handleProcessingFailed);
    };
  }, [socket, id]);

  const loadVideo = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/videos/${id}`);
      setVideo(response.data.video);

      // Create video URL for streaming (if processed)
      if (response.data.video.status === 'processed') {
        const token = localStorage.getItem('token');
        // Get base URL from environment variable or use default
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        const baseUrl = apiUrl.replace('/api', '');
        // Include token in URL for video element (backend will validate it)
        setVideoUrl(`${baseUrl}/api/videos/${id}/stream?token=${token}`);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load video');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this video?')) {
      return;
    }

    try {
      await api.delete(`/videos/${id}`);
      navigate('/videos');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete video');
    }
  };


  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-8 text-muted-foreground">Loading video...</div>
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="pt-6 text-center text-red-600">
            {error || 'Video not found'}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{video.title}</h1>
        {(user?.role === 'editor' || user?.role === 'admin') && (
          <Button variant="destructive" onClick={handleDelete}>
            Delete
          </Button>
        )}
      </div>

      {video.status === 'processing' && processingProgress !== null && (
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

      {video.status === 'processed' && videoUrl && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <video
              controls
              className="w-full rounded-lg"
              src={videoUrl}
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
              {video.description || 'No description provided'}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2">Status</h3>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                video.status === 'processed' ? 'bg-green-100 text-green-800' :
                video.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                video.status === 'failed' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {video.status}
              </span>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Safety Status</h3>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                video.safetyStatus === 'safe' ? 'bg-green-100 text-green-800' :
                video.safetyStatus === 'flagged' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {video.safetyStatus}
              </span>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Size</h3>
              <p className="text-muted-foreground">{(video.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
            {video.duration && (
              <div>
                <h3 className="font-semibold mb-2">Duration</h3>
                <p className="text-muted-foreground">
                  {Math.floor(video.duration / 60)}:{String(video.duration % 60).padStart(2, '0')}
                </p>
              </div>
            )}
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
    </div>
  );
}

