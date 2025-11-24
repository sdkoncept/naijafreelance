import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Save, X, Plus, Loader2 } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function CreateGig() {
  const { user, profile, userRole } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category_id: "",
    tags: [] as string[],
    basic_package_price: "",
    standard_package_price: "",
    premium_package_price: "",
    basic_package_delivery_days: "",
    standard_package_delivery_days: "",
    premium_package_delivery_days: "",
    basic_package_features: [] as string[],
    standard_package_features: [] as string[],
    premium_package_features: [] as string[],
  });

  const [tagInput, setTagInput] = useState("");
  const [featureInputs, setFeatureInputs] = useState({
    basic: "",
    standard: "",
    premium: "",
  });

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }

    // Check if user is freelancer or admin
    const isFreelancer = profile?.user_type === "freelancer";
    const isAdmin = userRole === "admin";
    
    if (!isFreelancer && !isAdmin) {
      toast.error("Only freelancers can create gigs");
      navigate("/");
      return;
    }

    fetchCategories();
  }, [user, profile, userRole, navigate]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("id, name, slug")
        .order("name");

      if (error) throw error;
      setCategories(data || []);
    } catch (error: any) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (title: string): string => {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()],
      });
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((t) => t !== tag),
    });
  };

  const handleAddFeature = (packageType: "basic" | "standard" | "premium") => {
    const input = featureInputs[packageType].trim();
    if (!input) return;

    const featureKey = `${packageType}_package_features` as const;
    if (!formData[featureKey].includes(input)) {
      setFormData({
        ...formData,
        [featureKey]: [...formData[featureKey], input],
      });
      setFeatureInputs({ ...featureInputs, [packageType]: "" });
    }
  };

  const handleRemoveFeature = (packageType: "basic" | "standard" | "premium", feature: string) => {
    const featureKey = `${packageType}_package_features` as const;
    setFormData({
      ...formData,
      [featureKey]: formData[featureKey].filter((f) => f !== feature),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (!user?.id) {
        toast.error("You must be logged in to create a gig");
        return;
      }

      if (!formData.title || !formData.description || !formData.category_id) {
        toast.error("Please fill in all required fields");
        return;
      }

      const slug = generateSlug(formData.title);

      // Check if slug already exists for this user
      const { data: existingGig } = await supabase
        .from("gigs")
        .select("id")
        .eq("freelancer_id", user.id)
        .eq("slug", slug)
        .single();

      if (existingGig) {
        toast.error("You already have a gig with this title. Please use a different title.");
        return;
      }

      const gigData = {
        freelancer_id: user.id,
        title: formData.title,
        slug: slug,
        description: formData.description,
        category_id: formData.category_id || null,
        tags: formData.tags,
        basic_package_price: formData.basic_package_price ? parseFloat(formData.basic_package_price) : null,
        standard_package_price: formData.standard_package_price ? parseFloat(formData.standard_package_price) : null,
        premium_package_price: formData.premium_package_price ? parseFloat(formData.premium_package_price) : null,
        basic_package_delivery_days: formData.basic_package_delivery_days ? parseInt(formData.basic_package_delivery_days) : null,
        standard_package_delivery_days: formData.standard_package_delivery_days ? parseInt(formData.standard_package_delivery_days) : null,
        premium_package_delivery_days: formData.premium_package_delivery_days ? parseInt(formData.premium_package_delivery_days) : null,
        basic_package_features: formData.basic_package_features,
        standard_package_features: formData.standard_package_features,
        premium_package_features: formData.premium_package_features,
        status: "active" as const,
      };

      const { data, error } = await supabase
        .from("gigs")
        .insert([gigData])
        .select()
        .single();

      if (error) throw error;

      // Log gig creation
      try {
        await supabase.from("audit_logs").insert([{
          user_id: user.id,
          action: "gig_create",
          table_name: "gigs",
          record_id: data.id,
          new_data: {
            title: gigData.title,
            category_id: gigData.category_id,
            status: gigData.status,
          },
        }]);
      } catch (logError) {
        console.error("Error logging gig creation:", logError);
      }

      toast.success("Gig created successfully!");
      navigate(`/freelancer/dashboard`);
    } catch (error: any) {
      console.error("Error creating gig:", error);
      toast.error("Failed to create gig: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <Loader2 className="inline-block animate-spin h-8 w-8 text-slate-700" />
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Create a New Gig</h1>
        <p className="text-gray-600">Offer your services to clients on NaijaFreelance</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Tell clients what service you're offering</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Gig Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Professional Logo Design"
                required
                maxLength={100}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category_id}
                onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe your service in detail..."
                rows={6}
                required
                maxLength={2000}
              />
              <p className="text-xs text-gray-500">
                {formData.description.length}/2000 characters
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <div className="flex gap-2">
                <Input
                  id="tags"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  placeholder="Add a tag and press Enter"
                />
                <Button type="button" onClick={handleAddTag} variant="outline">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 hover:text-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Pricing Packages */}
        {(["basic", "standard", "premium"] as const).map((packageType) => (
          <Card key={packageType}>
            <CardHeader>
              <CardTitle className="capitalize">{packageType} Package</CardTitle>
              <CardDescription>
                Set pricing and features for your {packageType} package
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`${packageType}_price`}>
                    Price (₦) *
                  </Label>
                  <Input
                    id={`${packageType}_price`}
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData[`${packageType}_package_price` as keyof typeof formData] as string}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        [`${packageType}_package_price`]: e.target.value,
                      } as any)
                    }
                    placeholder="0.00"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`${packageType}_delivery`}>
                    Delivery Days *
                  </Label>
                  <Input
                    id={`${packageType}_delivery`}
                    type="number"
                    min="1"
                    value={formData[`${packageType}_package_delivery_days` as keyof typeof formData] as string}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        [`${packageType}_package_delivery_days`]: e.target.value,
                      } as any)
                    }
                    placeholder="e.g., 3"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Package Features</Label>
                <div className="flex gap-2">
                  <Input
                    value={featureInputs[packageType]}
                    onChange={(e) =>
                      setFeatureInputs({
                        ...featureInputs,
                        [packageType]: e.target.value,
                      })
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddFeature(packageType);
                      }
                    }}
                    placeholder="Add a feature and press Enter"
                  />
                  <Button
                    type="button"
                    onClick={() => handleAddFeature(packageType)}
                    variant="outline"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {formData[`${packageType}_package_features` as keyof typeof formData].length > 0 && (
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    {(formData[`${packageType}_package_features` as keyof typeof formData] as string[]).map(
                      (feature, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <span>{feature}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveFeature(packageType, feature)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </li>
                      )
                    )}
                  </ul>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Submit Buttons */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Create Gig
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

