import { useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface DeleteVideoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  videoId: string;
  videoTitle: string;
  onSuccess: () => void;
}

export default function DeleteVideoDialog({
  open,
  onOpenChange,
  videoId,
  videoTitle,
  onSuccess,
}: DeleteVideoDialogProps) {
  const navigate = useNavigate();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/videos/${videoId}`);
      toast.success("Video deleted successfully!");
      onOpenChange(false);
      navigate("/videos");
      onSuccess();
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Failed to delete video";
      toast.error(errorMessage);
      onOpenChange(false);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Video</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete "{videoTitle}"? This action cannot
            be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={deleting}
          >
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
            {deleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

