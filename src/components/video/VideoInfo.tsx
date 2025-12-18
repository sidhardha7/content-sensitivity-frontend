import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

interface VideoInfoProps {
  video: Video;
}

export default function VideoInfo({ video }: VideoInfoProps) {
  return (
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
              {Math.floor((video.duration ?? 0) / 60)}:
              {String((video.duration ?? 0) % 60).padStart(2, "0")}
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
  );
}

