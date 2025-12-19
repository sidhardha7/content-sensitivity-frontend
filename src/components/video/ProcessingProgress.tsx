import { Card, CardContent } from "@/components/ui/card";

interface ProcessingProgressProps {
  progress: number;
  message?: string;
}

export default function ProcessingProgress({
  progress,
  message = "Processing video...",
}: ProcessingProgressProps) {
  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>{message}</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-secondary rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
