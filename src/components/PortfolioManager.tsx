import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Image as ImageIcon, Video, FileText, Trash2, Edit, Star, ExternalLink } from "lucide-react";
import { useDropzone } from "react-dropzone";

interface PortfolioItem {
  id: string;
  title: string;
  description?: string;
  media_type: "image" | "video" | "document";
  media_url: string;
  thumbnail_url?: string;
  category?: string;
  tags: string[];
  project_url?: string;
  client_name?: string;
  featured: boolean;
  display_order: number;
  created_at: string;
}

const MEDIA_CATEGORIES = [
  "web_design",
  "logo_design",
  "branding",
  "graphic_design",
  "ui_ux",
  "illustration",
  "photography",
  "video_editing",
  "other"
];

export default function PortfolioManager() {
  const { user, profile } = useAuth();
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    media_type: "image" as "image" | "video" | "document",
    category: "",
    tags: [] as string[],
    project_url: "",
    client_name: "",
    featured: false,
  });

  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  useEffect(() => {
    if (user?.id) {
      fetchPortfolioItems();
    }
  }, [user?.id]);

  const fetchPortfolioItems = async () => {
    try {
      setLoading(true);
      
      if (!user?.id) {
        console.warn("No user ID available for portfolio fetch");
        setItems([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("portfolio_items" as any)
        .select("*")
        .eq("freelancer_id", user.id)
        .order("display_order", { ascending: true })
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Portfolio fetch error:", error);
        // Check if table doesn't exist
        if (error.message?.includes("does not exist") || error.code === "42P01") {
          toast.error("Portfolio feature not set up. Please run the database migration.");
          console.error("portfolio_items table does not exist. Run migration: 20251126000001_create_portfolio_table.sql");
        } else {
          toast.error("Failed to load portfolio: " + error.message);
        }
        setItems([]);
        return;
      }

      setItems((data || []) as unknown as PortfolioItem[]);
    } catch (error: any) {
      console.error("Error fetching portfolio:", error);
      toast.error("Failed to load portfolio: " + (error.message || "Unknown error"));
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const onDrop = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    setUploadedFile(acceptedFiles[0]);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"],
      "video/*": [".mp4", ".webm", ".mov"],
      "application/pdf": [".pdf"],
    },
    maxFiles: 1,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) {
      toast.error("You must be logged in");
      return;
    }

    // If editing and no new file, use existing media_url
    let mediaUrl = editingItem?.media_url || "";

    try {
      setUploading(true);

      // Upload file if provided
      if (uploadedFile) {
        const fileExt = uploadedFile.name.split(".").pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        const filePath = `portfolio/${fileName}`;

        // Check if bucket exists first
        const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
        if (bucketError) {
          console.error("Error checking buckets:", bucketError);
          throw new Error("Unable to access storage. Please check Supabase configuration.");
        }

        const portfolioBucket = buckets?.find(b => b.name === "portfolio");
        if (!portfolioBucket) {
          throw new Error("Portfolio storage bucket not found. Please create a 'portfolio' bucket in Supabase Storage.");
        }

        const { error: uploadError } = await supabase.storage
          .from("portfolio")
          .upload(filePath, uploadedFile, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) {
          console.error("Upload error:", uploadError);
          if (uploadError.message?.includes("Bucket not found")) {
            throw new Error("Portfolio storage bucket not found. Please create it in Supabase Dashboard > Storage.");
          }
          throw uploadError;
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from("portfolio")
          .getPublicUrl(filePath);

        mediaUrl = publicUrl;
      }

      if (!mediaUrl) {
        toast.error("Please upload a file");
        return;
      }

      // Determine media type
      const mediaType = uploadedFile
        ? (uploadedFile.type.startsWith("image/")
            ? "image"
            : uploadedFile.type.startsWith("video/")
            ? "video"
            : "document")
        : editingItem?.media_type || "image";

      const portfolioData = {
        freelancer_id: user.id,
        title: formData.title,
        description: formData.description || null,
        media_type: mediaType,
        media_url: mediaUrl,
        category: formData.category || null,
        tags: formData.tags,
        project_url: formData.project_url || null,
        client_name: formData.client_name || null,
        featured: formData.featured,
        display_order: editingItem?.display_order || items.length,
      };

      if (editingItem) {
        // Update existing item
        const { error } = await supabase
          .from("portfolio_items" as any)
          .update(portfolioData)
          .eq("id", editingItem.id);

        if (error) {
          console.error("Update error:", error);
          if (error.message?.includes("does not exist") || error.code === "42P01") {
            throw new Error("Portfolio table not found. Please run the database migration.");
          }
          throw error;
        }
        toast.success("Portfolio item updated!");
      } else {
        // Create new item
        const { error } = await supabase
          .from("portfolio_items" as any)
          .insert([portfolioData]);

        if (error) {
          console.error("Insert error:", error);
          if (error.message?.includes("does not exist") || error.code === "42P01") {
            throw new Error("Portfolio table not found. Please run the database migration.");
          }
          if (error.code === "42501") {
            throw new Error("Permission denied. Please check Row Level Security policies.");
          }
          throw error;
        }
        toast.success("Portfolio item added!");
      }

      setShowAddDialog(false);
      setEditingItem(null);
      setFormData({
        title: "",
        description: "",
        media_type: "image",
        category: "",
        tags: [],
        project_url: "",
        client_name: "",
        featured: false,
      });
      setUploadedFile(null);
      fetchPortfolioItems();
    } catch (error: any) {
      console.error("Error saving portfolio item:", error);
      toast.error("Failed to save portfolio item: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this portfolio item?")) return;

    try {
      const { error } = await supabase
        .from("portfolio_items" as any)
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("Portfolio item deleted");
      fetchPortfolioItems();
    } catch (error: any) {
      console.error("Error deleting portfolio item:", error);
      toast.error("Failed to delete: " + error.message);
    }
  };

  const handleEdit = (item: PortfolioItem) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      description: item.description || "",
      media_type: item.media_type,
      category: item.category || "",
      tags: item.tags || [],
      project_url: item.project_url || "",
      client_name: item.client_name || "",
      featured: item.featured,
    });
    setUploadedFile(null);
    setShowAddDialog(true);
  };

  const resetForm = () => {
    setEditingItem(null);
    setFormData({
      title: "",
      description: "",
      media_type: "image",
      category: "",
      tags: [],
      project_url: "",
      client_name: "",
      featured: false,
    });
    setUploadedFile(null);
  };

  // Show loading state
  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent"></div>
        <p className="mt-4 text-gray-600">Loading portfolio...</p>
      </div>
    );
  }

  // Show error state if user is not available
  if (!user?.id) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-gray-600">Please log in to manage your portfolio.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with ALWAYS VISIBLE button */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h3 className="text-xl font-semibold mb-2">Portfolio Gallery</h3>
          <p className="text-gray-600 text-sm">
            Showcase your best work to attract clients
          </p>
        </div>
        <Button 
          onClick={() => {
            resetForm();
            setShowAddDialog(true);
          }}
          className="bg-primary hover:bg-primary/90"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Portfolio Item
        </Button>
      </div>

      {/* Dialog for Add/Edit */}
      <Dialog open={showAddDialog} onOpenChange={(open) => {
        setShowAddDialog(open);
        if (!open) resetForm();
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingItem ? "Edit Portfolio Item" : "Add Portfolio Item"}
              </DialogTitle>
              <DialogDescription>
                Upload your work samples to showcase your skills
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* File Upload */}
              <div>
                <Label>Media File {!editingItem && "*"}</Label>
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                    isDragActive
                      ? "border-primary bg-primary/5"
                      : "border-gray-300 hover:border-primary"
                  }`}
                >
                  <input {...getInputProps()} />
                  {uploadedFile ? (
                    <div>
                      <p className="text-sm font-medium">{uploadedFile.name}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  ) : editingItem ? (
                    <div>
                      <p className="text-sm text-gray-600">
                        Current: {editingItem.media_url.split("/").pop()}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Upload a new file to replace
                      </p>
                    </div>
                  ) : (
                    <div>
                      <ImageIcon className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                      <p className="text-sm">
                        {isDragActive
                          ? "Drop the file here"
                          : "Drag & drop a file, or click to select"}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Images, videos, or PDFs (max 10MB)
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Title */}
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                  placeholder="e.g., E-commerce Website Redesign"
                />
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Describe this project..."
                  rows={3}
                />
              </div>

              {/* Category */}
              <div>
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData({ ...formData, category: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {MEDIA_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Project URL */}
              <div>
                <Label htmlFor="project_url">Project URL</Label>
                <Input
                  id="project_url"
                  type="url"
                  value={formData.project_url}
                  onChange={(e) =>
                    setFormData({ ...formData, project_url: e.target.value })
                  }
                  placeholder="https://example.com"
                />
              </div>

              {/* Client Name */}
              <div>
                <Label htmlFor="client_name">Client Name (Optional)</Label>
                <Input
                  id="client_name"
                  value={formData.client_name}
                  onChange={(e) =>
                    setFormData({ ...formData, client_name: e.target.value })
                  }
                  placeholder="Client name (if allowed)"
                />
              </div>

              {/* Featured */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="featured"
                  checked={formData.featured}
                  onChange={(e) =>
                    setFormData({ ...formData, featured: e.target.checked })
                  }
                  className="rounded"
                />
                <Label htmlFor="featured" className="cursor-pointer">
                  Feature this item (shown first)
                </Label>
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowAddDialog(false);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={uploading}>
                  {uploading
                    ? "Uploading..."
                    : editingItem
                    ? "Update"
                    : "Add Item"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

      {/* Portfolio Grid */}
      {items.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <ImageIcon className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No portfolio items yet</h3>
            <p className="text-gray-600 mb-4">
              Start building your portfolio to showcase your work
            </p>
            <Button 
              onClick={() => {
                resetForm();
                setShowAddDialog(true);
              }}
              size="lg" 
              className="bg-primary hover:bg-primary/90"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Your First Portfolio Item
            </Button>
          </CardContent>
        </Card>
      ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <Card key={item.id} className="overflow-hidden group">
                <div className="aspect-video bg-gray-100 relative">
                  {item.media_type === "image" ? (
                    <img
                      src={item.media_url}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  ) : item.media_type === "video" ? (
                    <video
                      src={item.media_url}
                      className="w-full h-full object-cover"
                      controls
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FileText className="w-16 h-16 text-gray-400" />
                    </div>
                  )}
                  {item.featured && (
                    <div className="absolute top-2 left-2">
                      <Badge className="bg-primary">
                        <Star className="w-3 h-3 mr-1" />
                        Featured
                      </Badge>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleEdit(item)}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(item.id)}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
                <CardContent className="p-4">
                  <h4 className="font-semibold mb-1 line-clamp-1">{item.title}</h4>
                  {item.description && (
                    <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                      {item.description}
                    </p>
                  )}
                  {item.project_url && (
                    <a
                      href={item.project_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline flex items-center gap-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                      View Project
                    </a>
                  )}
                </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
