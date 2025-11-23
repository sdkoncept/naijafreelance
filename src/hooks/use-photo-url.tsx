import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Hook to generate signed URLs for photos stored in private storage buckets
 * @param photoPath - The storage path to the photo (e.g., "enrollee-photos/filename.jpg")
 * @param expiresIn - How long the signed URL is valid in seconds (default: 3600 = 1 hour)
 * @returns The signed URL or null if not available
 */
export function usePhotoUrl(photoPath: string | null | undefined, expiresIn: number = 3600): string | null {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!photoPath) {
      setSignedUrl(null);
      return;
    }

    const generateSignedUrl = async () => {
      try {
        // Extract bucket name and file path
        let bucket = "enrollee-photos";
        let filePath = photoPath;

        // If the path includes the bucket name, extract it
        if (photoPath.includes("/")) {
          const parts = photoPath.split("/");
          if (parts.length > 1 && !photoPath.startsWith("http")) {
            // If it's already a full path like "enrollee-photos/file.jpg"
            bucket = parts[0];
            filePath = parts.slice(1).join("/");
          }
        }

        const { data, error } = await supabase.storage
          .from(bucket)
          .createSignedUrl(filePath, expiresIn);

        if (error) {
          console.error("Error generating signed URL:", error);
          setSignedUrl(null);
          return;
        }

        setSignedUrl(data.signedUrl);
      } catch (error) {
        console.error("Error generating signed URL:", error);
        setSignedUrl(null);
      }
    };

    generateSignedUrl();
  }, [photoPath, expiresIn]);

  return signedUrl;
}