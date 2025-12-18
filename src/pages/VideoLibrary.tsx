import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

export default function VideoLibrary() {
  const { user } = useAuth();
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [sensitivityFilter, setSensitivityFilter] = useState("");

  useEffect(() => {
    loadVideos();
  }, [sensitivityFilter]);

  const loadVideos = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (search) params.search = search;
      if (sensitivityFilter) params.safetyStatus = sensitivityFilter;

      const response = await api.get("/videos", { params });
      setVideos(response.data.videos);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load videos");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadVideos();
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      uploaded: "bg-gray-100 text-gray-800",
      processing: "bg-blue-100 text-blue-800",
      processed: "bg-green-100 text-green-800",
      failed: "bg-red-100 text-red-800",
    };
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          colors[status] || colors.uploaded
        }`}
      >
        {status}
      </span>
    );
  };

  const getSafetyBadge = (safety: string) => {
    const colors: Record<string, string> = {
      safe: "bg-green-100 text-green-800",
      flagged: "bg-red-100 text-red-800",
      unknown: "bg-gray-100 text-gray-800",
    };
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          colors[safety] || colors.unknown
        }`}
      >
        {safety}
      </span>
    );
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Video Library</h1>
        {(user?.role === "editor" || user?.role === "admin") && (
          <Link to="/videos/upload">
            <Button>Upload Video</Button>
          </Link>
        )}
      </div>

      <div className="flex gap-4 items-center mb-6">
        <form
          onSubmit={handleSearch}
          className="flex-1 flex gap-4 items-center"
        >
          <Input
            placeholder="Search videos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 h-10"
          />
          <Select
            value={sensitivityFilter || "all"}
            onValueChange={(value: string) =>
              setSensitivityFilter(value === "all" ? "" : value)
            }
          >
            <SelectTrigger className="h-10 w-auto min-w-[140px]">
              <SelectValue placeholder="Filter by sensitivity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="safe">Safe</SelectItem>
              <SelectItem value="flagged">Flagged</SelectItem>
              <SelectItem value="unknown">Unknown</SelectItem>
            </SelectContent>
          </Select>
          <Button type="submit" className="h-10">
            Search
          </Button>
        </form>
      </div>

      {error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-8 text-muted-foreground">
          Loading videos...
        </div>
      ) : videos.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            No videos found
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {videos.map((video) => (
            <Card key={video._id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">{video.title}</CardTitle>
                <CardDescription>
                  {video.description || "No description"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 mb-4">
                  <div className="flex gap-2">
                    {getStatusBadge(video.status)}
                    {getSafetyBadge(video.safetyStatus)}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Size: {(video.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Uploaded by {video.owner.name}
                  </p>
                </div>
                <Link to={`/videos/${video._id}`}>
                  <Button variant="outline" className="w-full">
                    View Details
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
