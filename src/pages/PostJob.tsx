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
import { Save, Loader2, ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import MultiStepForm from "@/components/MultiStepForm";

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
  const [currentStep, setCurrentStep] = useState(0);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category_id: "",
    budget: "",
    delivery_days: "",
    requirements: "",
  });

  const steps = [
    { id: "basic", title: "Basic Info", description: "Title & Category" },
    { id: "description", title: "Description", description: "Details & Requirements" },
    { id: "budget", title: "Budget & Timeline", description: "Pricing & Delivery" },
    { id: "review", title: "Review", description: "Confirm & Submit" },
  ];

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

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 0:
        return !!(formData.title && formData.category_id);
      case 1:
        return !!formData.description;
      case 2:
        return true; // Budget and delivery are optional
      case 3:
        return true; // Review step
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
    } else {
      toast.error("Please fill in all required fields");
    }
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleSubmit = async () => {
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
        <h1 className="text-3xl sm:text-4xl font-bold mb-2">Post a Job</h1>
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
          <MultiStepForm steps={steps} currentStep={currentStep}>
            <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-6">
              {/* Step 1: Basic Info */}
              {currentStep === 0 && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="title">Job Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g., Need a professional logo design"
                      className="h-12"
                      maxLength={100}
                    />
                    <p className="text-xs text-gray-500">
                      Be specific about what you need
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select
                      value={formData.category_id}
                      onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                    >
                      <SelectTrigger className="h-12">
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
                </div>
              )}

              {/* Step 2: Description */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="description">Job Description *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Describe your project in detail. Include goals, scope, and any specific requirements..."
                      rows={8}
                      maxLength={2000}
                      className="resize-none"
                    />
                    <p className="text-xs text-gray-500">
                      {formData.description.length}/2000 characters
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="requirements">Additional Requirements</Label>
                    <Textarea
                      id="requirements"
                      value={formData.requirements}
                      onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                      placeholder="Any specific requirements, preferences, or constraints..."
                      rows={4}
                      maxLength={1000}
                      className="resize-none"
                    />
                    <p className="text-xs text-gray-500">Optional</p>
                  </div>
                </div>
              )}

              {/* Step 3: Budget & Timeline */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
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
                        className="h-12"
                      />
                      <p className="text-xs text-gray-500">Optional - helps freelancers understand your budget</p>
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
                        className="h-12"
                      />
                      <p className="text-xs text-gray-500">How many days do you need this completed?</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Review */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <CheckCircle2 className="w-6 h-6 text-green-600" />
                      <h3 className="text-lg font-semibold text-green-900">Review Your Job Posting</h3>
                    </div>
                    <p className="text-green-800">Please review all details before submitting.</p>
                  </div>

                  <div className="space-y-4 border rounded-lg p-6">
                    <div>
                      <Label className="text-sm text-gray-500">Job Title</Label>
                      <p className="text-lg font-semibold mt-1">{formData.title || "Not set"}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-500">Category</Label>
                      <p className="text-lg font-semibold mt-1">
                        {categories.find((c) => c.id === formData.category_id)?.name || "Not selected"}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-500">Description</Label>
                      <p className="text-gray-700 mt-1 whitespace-pre-wrap">
                        {formData.description || "Not provided"}
                      </p>
                    </div>
                    {formData.budget && (
                      <div>
                        <Label className="text-sm text-gray-500">Budget</Label>
                        <p className="text-lg font-semibold mt-1">₦{parseFloat(formData.budget).toLocaleString()}</p>
                      </div>
                    )}
                    {formData.delivery_days && (
                      <div>
                        <Label className="text-sm text-gray-500">Expected Delivery</Label>
                        <p className="text-lg font-semibold mt-1">{formData.delivery_days} days</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-6 border-t">
                <div>
                  {currentStep > 0 && (
                    <Button type="button" variant="outline" onClick={handlePrevious}>
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Previous
                    </Button>
                  )}
                </div>
                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                    Cancel
                  </Button>
                  {currentStep < steps.length - 1 ? (
                    <Button type="button" onClick={handleNext} className="bg-primary hover:bg-primary/90">
                      Next
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  ) : (
                    <Button type="submit" disabled={saving} className="bg-primary hover:bg-primary/90">
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
                  )}
                </div>
              </div>
            </form>
          </MultiStepForm>
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

