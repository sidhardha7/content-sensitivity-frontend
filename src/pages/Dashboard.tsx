import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import api from "@/lib/api";
import {
  Video,
  BarChart3,
  Shield,
  Users,
  Upload,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";

interface VideoStats {
  total: number;
  processed: number;
  processing: number;
  uploaded: number;
  failed: number;
  safe: number;
  flagged: number;
  unknown: number;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<VideoStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get("/videos");
        const videos = response.data.videos || [];

        const videoStats: VideoStats = {
          total: videos.length,
          processed: videos.filter((v: any) => v.status === "processed").length,
          processing: videos.filter((v: any) => v.status === "processing")
            .length,
          uploaded: videos.filter((v: any) => v.status === "uploaded").length,
          failed: videos.filter((v: any) => v.status === "failed").length,
          safe: videos.filter((v: any) => v.safetyStatus === "safe").length,
          flagged: videos.filter((v: any) => v.safetyStatus === "flagged")
            .length,
          unknown: videos.filter(
            (v: any) => v.safetyStatus === "unknown" || !v.safetyStatus
          ).length,
        };

        setStats(videoStats);
      } catch (error) {
        console.error("Failed to fetch video stats:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchStats();
    }
  }, [user]);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {user?.name}!</p>
      </div>

      {/* Project Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Project Overview
          </CardTitle>
          <CardDescription>
            Video Content Sensitivity Analysis Platform
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">About This Platform</h3>
            <p className="text-sm text-muted-foreground">
              A comprehensive full-stack application for uploading videos,
              analyzing content sensitivity using FFmpeg frame extraction and
              image analysis, and streaming videos with real-time processing
              updates. Built with Node.js, Express, MongoDB, React, and
              TypeScript.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">Content Analysis</p>
                <p className="text-xs text-muted-foreground">
                  Automated sensitivity detection
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Video className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">Video Streaming</p>
                <p className="text-xs text-muted-foreground">
                  HTTP range-request based
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">Multi-Tenant</p>
                <p className="text-xs text-muted-foreground">
                  Role-based access control
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Video Statistics */}
      {!loading && stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Video className="h-4 w-4" />
                Total Videos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground mt-1">
                All videos in your library
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Processed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.processed}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Analysis completed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Upload className="h-4 w-4 text-blue-500" />
                Processing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.processing}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Currently analyzing
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                Flagged
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.flagged}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Requires review
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Status Breakdown */}
      {!loading && stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Processing Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Processed</span>
                <span className="font-semibold">{stats.processed}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Processing</span>
                <span className="font-semibold">{stats.processing}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Uploaded</span>
                <span className="font-semibold">{stats.uploaded}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Failed</span>
                <span className="font-semibold">{stats.failed}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Safety Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Safe</span>
                <span className="font-semibold text-green-500">
                  {stats.safe}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Flagged</span>
                <span className="font-semibold text-yellow-500">
                  {stats.flagged}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Unknown</span>
                <span className="font-semibold text-muted-foreground">
                  {stats.unknown}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* User Info */}
      <Card>
        <CardHeader>
          <CardTitle>Your Account</CardTitle>
          <CardDescription>
            Logged in as {user?.role} • {user?.email}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {user?.role === "admin" &&
              "You have full system access, including user management and all videos."}
            {user?.role === "editor" &&
              "You can upload videos and manage videos you own or are assigned to."}
            {user?.role === "viewer" &&
              "You have read-only access to videos assigned to you."}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
