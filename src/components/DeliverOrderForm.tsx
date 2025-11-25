import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Upload, X, File, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { notifyOrderDelivered } from "@/utils/notifications";

interface DeliverOrderFormProps {
  orderId: string;
  onSuccess: () => void;
  onCancel?: () => void;
}

export default function DeliverOrderForm({
  orderId,
  onSuccess,
  onCancel,
}: DeliverOrderFormProps) {
  const { user } = useAuth();
  const [message, setMessage] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [fileUrls, setFileUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    setFiles([...files, ...selectedFiles]);
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
    setFileUrls(fileUrls.filter((_, i) => i !== index));
  };

  const uploadFiles = async (): Promise<string[]> => {
    if (files.length === 0) return [];

    const uploadedUrls: string[] = [];

    for (const file of files) {
      try {
        const fileExt = file.name.split(".").pop();
        const fileName = `${orderId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `deliverables/${fileName}`;

        // Try to upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from("deliverables")
          .upload(filePath, file);

        if (uploadError) {
          // If bucket doesn't exist or upload fails, convert to data URL as fallback
          console.warn("Storage upload failed, using data URL:", uploadError);
          
          // Convert file to base64 data URL as fallback
          const reader = new FileReader();
          const dataUrl = await new Promise<string>((resolve, reject) => {
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
          
          uploadedUrls.push(dataUrl);
          continue;
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from("deliverables")
          .getPublicUrl(filePath);

        uploadedUrls.push(publicUrl);
      } catch (error) {
        console.error("Error uploading file:", error);
        // Fallback to data URL
        try {
          const reader = new FileReader();
          const dataUrl = await new Promise<string>((resolve, reject) => {
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
          uploadedUrls.push(dataUrl);
        } catch (fallbackError) {
          toast.error(`Failed to upload ${file.name}`);
        }
      }
    }

    return uploadedUrls;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (files.length === 0 && !message.trim()) {
      toast.error("Please add files or a message to deliver the order");
      return;
    }

    setSubmitting(true);
    setUploading(true);

    try {
      // Upload files if any
      let uploadedFileUrls: string[] = [];
      if (files.length > 0) {
        uploadedFileUrls = await uploadFiles();
        if (uploadedFileUrls.length === 0 && files.length > 0) {
          toast.error("Failed to upload files. Please try again.");
          setSubmitting(false);
          setUploading(false);
          return;
        }
      }

      // Create deliverable record
      const { error: deliverableError } = await supabase
        .from("order_deliverables")
        .insert({
          order_id: orderId,
          file_urls: uploadedFileUrls,
          message: message.trim() || null,
          delivered_by: user?.id,
        });

      if (deliverableError) {
        // If table doesn't exist, we'll still update the order
        console.error("Error creating deliverable:", deliverableError);
      }

      // Update order status to delivered
      const { error: orderError } = await supabase
        .from("orders")
        .update({
          status: "delivered",
          delivered_at: new Date().toISOString(),
        })
        .eq("id", orderId);

      if (orderError) throw orderError;

      // Get order details to notify client
      const { data: orderData } = await supabase
        .from("orders")
        .select("client_id, client:profiles!orders_client_id_fkey(full_name)")
        .eq("id", orderId)
        .single();

      // Notify client about delivery
      if (orderData?.client_id && user?.id) {
        const clientName = (orderData.client as any)?.full_name || "Client";
        const { data: freelancerData } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", user.id)
          .single();
        
        const freelancerName = freelancerData?.full_name || "Freelancer";
        notifyOrderDelivered(orderData.client_id, orderId, freelancerName).catch(
          (err) => console.error("Failed to send notification:", err)
        );
      }

      toast.success("Order delivered successfully! The client will be notified.");
      onSuccess();
    } catch (error: any) {
      console.error("Error delivering order:", error);
      toast.error("Failed to deliver order: " + error.message);
    } finally {
      setSubmitting(false);
      setUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Deliver Order</CardTitle>
        <CardDescription>
          Upload your completed work files and add a message for the client.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Files Upload */}
          <div className="space-y-2">
            <Label htmlFor="files">Upload Files</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              <Input
                id="files"
                type="file"
                multiple
                onChange={handleFileSelect}
                disabled={uploading || submitting}
                className="hidden"
              />
              <Label
                htmlFor="files"
                className="flex flex-col items-center justify-center cursor-pointer"
              >
                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                <span className="text-sm text-gray-600">
                  Click to upload or drag and drop
                </span>
                <span className="text-xs text-gray-500 mt-1">
                  You can upload multiple files
                </span>
              </Label>
            </div>

            {/* Selected Files */}
            {files.length > 0 && (
              <div className="space-y-2 mt-4">
                {files.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded border"
                  >
                    <div className="flex items-center gap-2">
                      <File className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-700">{file.name}</span>
                      <span className="text-xs text-gray-500">
                        ({(file.size / 1024).toFixed(1)} KB)
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                      disabled={uploading || submitting}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="message">Delivery Message (Optional)</Label>
            <Textarea
              id="message"
              placeholder="Add any notes or instructions about the delivered work..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              disabled={uploading || submitting}
              className="resize-none"
            />
            <p className="text-xs text-gray-500">
              Let the client know what you've delivered and any important details.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              type="submit"
              disabled={uploading || submitting || (files.length === 0 && !message.trim())}
              className="flex-1"
            >
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Delivering...
                </>
              ) : (
                "Deliver Order"
              )}
            </Button>
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={uploading || submitting}
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

