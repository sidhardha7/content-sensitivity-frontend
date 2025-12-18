import { Card, CardContent } from "@/components/ui/card";

interface VideoPlayerProps {
  videoUrl: string;
  onError: (error: string) => void;
}

export default function VideoPlayer({ videoUrl, onError }: VideoPlayerProps) {
  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <video
          controls
          className="w-full rounded-lg"
          src={videoUrl}
          preload="metadata"
          crossOrigin="anonymous"
          onError={() => {
            onError("Failed to load video. Please try again.");
          }}
        >
          Your browser does not support the video tag.
        </video>
      </CardContent>
    </Card>
  );
}
