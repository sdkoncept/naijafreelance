import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Camera, Upload, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { usePhotoUrl } from "@/hooks/use-photo-url";

interface PhotoCaptureProps {
  onPhotoCapture: (photoUrl: string) => void;
  currentPhotoUrl?: string;
  label?: string;
}

export default function PhotoCapture({ onPhotoCapture, currentPhotoUrl, label = "Photo" }: PhotoCaptureProps) {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string>("");
  const [photoPath, setPhotoPath] = useState<string>(currentPhotoUrl || "");
  const [uploading, setUploading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Generate signed URL for current photo
  const currentPhotoSignedUrl = usePhotoUrl(photoPath);

  useEffect(() => {
    if (currentPhotoSignedUrl) {
      setPhotoPreview(currentPhotoSignedUrl);
    }
  }, [currentPhotoSignedUrl]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "user" } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }
      setIsCameraActive(true);
    } catch (error) {
      toast.error("Failed to access camera");
      console.error(error);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const capturePhoto = async () => {
    if (!videoRef.current) return;

    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext("2d");
    
    if (!ctx) return;
    
    ctx.drawImage(videoRef.current, 0, 0);
    
    canvas.toBlob(async (blob) => {
      if (blob) {
        // Validate file size (5MB limit)
        const maxSize = 5 * 1024 * 1024; // 5MB in bytes
        if (blob.size > maxSize) {
          toast.error("Captured photo must be under 5MB");
          stopCamera();
          return;
        }
        await uploadPhoto(blob);
        stopCamera();
      }
    }, "image/jpeg", 0.9);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      toast.error("File must be under 5MB");
      return;
    }

    await uploadPhoto(file);
  };

  const uploadPhoto = async (file: Blob) => {
    setUploading(true);
    try {
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
      const filePath = `enrollee-photos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("enrollee-photos")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Store the file path instead of public URL for security
      // We'll generate signed URLs when displaying the photo
      const { data: signedUrlData } = await supabase.storage
        .from("enrollee-photos")
        .createSignedUrl(filePath, 3600); // 1 hour expiry

      if (signedUrlData) {
        setPhotoPreview(signedUrlData.signedUrl);
        setPhotoPath(filePath);
        // Store the path in the database, not the signed URL
        onPhotoCapture(filePath);
        toast.success("Photo uploaded successfully");
      }
    } catch (error: any) {
      toast.error("Failed to upload photo: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = () => {
    setPhotoPreview("");
    setPhotoPath("");
    onPhotoCapture("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      
      {photoPreview && !isCameraActive && (
        <div className="relative w-32 h-32 border rounded-lg overflow-hidden">
          <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-1 right-1 h-6 w-6"
            onClick={removePhoto}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {isCameraActive && (
        <div className="space-y-2">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full max-w-md border rounded-lg"
          />
          <div className="flex gap-2">
            <Button type="button" onClick={capturePhoto} disabled={uploading}>
              Capture Photo
            </Button>
            <Button type="button" variant="outline" onClick={stopCamera}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {!isCameraActive && !photoPreview && (
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={startCamera}
            disabled={uploading}
          >
            <Camera className="h-4 w-4 mr-2" />
            Use Camera
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload Image
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
      )}
    </div>
  );
}