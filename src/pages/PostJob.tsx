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
import { toast } from "sonner";
import { Save, Loader2 } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function PostJob() {
  const { user, profile, userRole } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category_id: "",
    budget: "",
    delivery_days: "",
    requirements: "",
  });

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }

    const isClient = profile?.user_type === "client";
    const isAdmin = userRole === "admin";

    if (!isClient && !isAdmin) {
      toast.error("This page is for clients only");
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
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      .substring(0, 50);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (!user?.id) {
        toast.error("You must be logged in to post a job");
        setSaving(false);
        return;
      }

      if (!formData.title || !formData.description || !formData.category_id) {
        toast.error("Please fill in all required fields");
        setSaving(false);
        return;
      }

      // Generate unique slug
      const baseSlug = generateSlug(formData.title);
      let slug = baseSlug;
      let counter = 0;
      
      // Check for existing slug
      while (true) {
        const { data: existing } = await supabase
          .from("jobs")
          .select("id")
          .eq("slug", slug)
          .eq("client_id", user.id)
          .maybeSingle();
        
        if (!existing) break;
        counter++;
        slug = `${baseSlug}-${counter}`;
      }

      // Create job posting
      const jobData = {
        client_id: user.id,
        title: formData.title,
        slug: slug,
        description: formData.description,
        category_id: formData.category_id,
        budget: formData.budget ? parseFloat(formData.budget) : null,
        currency: "NGN" as const,
        delivery_days: formData.delivery_days ? parseInt(formData.delivery_days) : null,
        requirements: formData.requirements || null,
        status: "open" as const,
      };

      const { data: job, error } = await supabase
        .from("jobs")
        .insert([jobData])
        .select()
        .single();

      if (error) {
        // Check if jobs table exists
        if (error.code === "PGRST205") {
          toast.error("Jobs table not found. Please run the database migration first.");
          console.error("Jobs table missing. Run migration: supabase/migrations/20251124000006_create_jobs_table.sql");
          setSaving(false);
          return;
        }
        throw error;
      }

      // Log job creation
      try {
        await supabase.from("audit_logs").insert([{
          user_id: user.id,
          action: "job_create",
          table_name: "jobs",
          record_id: job.id,
          new_data: {
            title: jobData.title,
            category_id: jobData.category_id,
            budget: jobData.budget,
            status: jobData.status,
          },
        }]);
      } catch (logError) {
        console.error("Error logging job creation:", logError);
      }

      toast.success("Job posted successfully! Freelancers can now view and apply to your job.");
      navigate("/client/orders"); // Or navigate to a jobs list page
    } catch (error: any) {
      console.error("Error posting job:", error);
      toast.error("Failed to post job: " + error.message);
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
        <h1 className="text-4xl font-bold mb-2">Post a Job</h1>
        <p className="text-gray-600">Describe your project and find the perfect freelancer</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Job Details</CardTitle>
          <CardDescription>
            Posting a job allows freelancers to apply. Alternatively, browse existing gigs and place orders directly.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Job Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Need a professional logo design"
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
              <Label htmlFor="description">Job Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe your project in detail..."
                rows={6}
                required
                maxLength={2000}
              />
              <p className="text-xs text-gray-500">
                {formData.description.length}/2000 characters
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="budget">Budget (₦)</Label>
                <Input
                  id="budget"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="delivery_days">Expected Delivery (Days)</Label>
                <Input
                  id="delivery_days"
                  type="number"
                  min="1"
                  value={formData.delivery_days}
                  onChange={(e) => setFormData({ ...formData, delivery_days: e.target.value })}
                  placeholder="e.g., 7"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="requirements">Additional Requirements</Label>
              <Textarea
                id="requirements"
                value={formData.requirements}
                onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                placeholder="Any specific requirements or preferences..."
                rows={4}
                maxLength={1000}
              />
            </div>

            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Posting...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Post Job
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Alternative: Browse Existing Services</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            Instead of posting a job, you can browse freelancers' existing gigs and place orders directly.
            This is often faster as you can see pricing and delivery times upfront.
          </p>
          <Button asChild>
            <a href="/browse">Browse Services</a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

