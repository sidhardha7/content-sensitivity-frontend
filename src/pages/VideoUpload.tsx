import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pin, X, Paperclip } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function VideoUpload() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.type.startsWith("video/")) {
        setError("Please select a video file");
        return;
      }
      if (selectedFile.size > 500 * 1024 * 1024) {
        setError("File size must be less than 500MB");
        return;
      }
      setFile(selectedFile);
      setError("");
    }
  };

  const handleCancelFile = () => {
    setFile(null);
    // Reset the file input
    const fileInput = document.getElementById("file") as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title) {
      setError("Please fill in all required fields");
      return;
    }

    setUploading(true);
    setError("");
    setProgress(0);

    try {
      const formData = new FormData();
      formData.append("video", file);
      formData.append("title", title);
      if (description) {
        formData.append("description", description);
      }

      const response = await api.post("/videos/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setProgress(percentCompleted);
          }
        },
      });

      navigate(`/videos/${response.data.video._id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-2xl ">
      <h1 className="text-3xl font-bold mb-6">Upload Video</h1>
      <Card>
        <CardHeader>
          <CardTitle>Upload New Video</CardTitle>
          <CardDescription>
            Select a video file to upload and process
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">
                Title *
              </label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="Video title"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Video description (optional)"
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="file"
                className="text-sm font-medium flex items-center gap-2"
              >
                Video File *
              </label>
              <div className="flex items-center gap-2">
                <Input
                  id="file"
                  type="file"
                  accept="video/*"
                  onChange={handleFileChange}
                  required
                />
              </div>
              {file && (
                <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
                  <Pin className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0"
                    onClick={handleCancelFile}
                    title="Remove file"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
            {uploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Uploading...</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}
            <Button
              type="submit"
              className="w-full"
              disabled={uploading || !file}
            >
              {uploading ? "Uploading..." : "Upload Video"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
