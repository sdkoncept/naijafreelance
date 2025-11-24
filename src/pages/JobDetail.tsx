import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Calendar, DollarSign, Clock, MessageCircle, Briefcase, MapPin } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";

// Function to send email notification for job application
const sendJobApplicationEmail = async (
  clientId: string,
  jobId: string,
  freelancerId: string,
  jobTitle: string
) => {
  try {
    // Get client email
    const { data: clientProfile } = await supabase
      .from("profiles" as any)
      .select("email, full_name")
      .eq("id", clientId)
      .single();

    if (!clientProfile || !(clientProfile as any).email) {
      console.warn("Client email not found, cannot send notification");
      return;
    }

    // Get freelancer info
    const { data: freelancerProfile } = await supabase
      .from("profiles" as any)
      .select("full_name, email")
      .eq("id", freelancerId)
      .single();

    const client = clientProfile as any;
    const freelancer = freelancerProfile as any;

    // Call Supabase Edge Function to send email
    // You'll need to create this function in Supabase
    try {
      const { error } = await supabase.functions.invoke("send-job-application-email", {
        body: {
          to: client.email,
          clientName: client.full_name,
          freelancerName: freelancer?.full_name || "A freelancer",
          freelancerEmail: freelancer?.email,
          jobTitle: jobTitle,
          jobId: jobId,
          applicationUrl: `${window.location.origin}/job/${jobId}/applications`,
        },
      });

      if (error) {
        console.error("Email function error:", error);
        // Fallback: log to console (in production, you'd want proper error handling)
      }
    } catch (funcError) {
      console.warn("Email function not available, skipping email notification:", funcError);
      // Email function might not be set up yet - that's okay
    }
  } catch (error) {
    console.error("Error sending email notification:", error);
    // Don't throw - email failure shouldn't block application
  }
};

interface Job {
  id: string;
  title: string;
  slug: string;
  description: string;
  category_id: string;
  budget: number | null;
  currency: string;
  delivery_days: number | null;
  requirements: string | null;
  status: string;
  views_count: number;
  applications_count: number;
  created_at: string;
  client_id: string;
  profiles: {
    full_name: string;
    avatar_url?: string;
    bio?: string;
  };
  categories: {
    name: string;
    slug: string;
  };
}

export default function JobDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [applicationText, setApplicationText] = useState("");
  const [submittingApplication, setSubmittingApplication] = useState(false);

  useEffect(() => {
    if (slug) {
      fetchJobDetails();
    }
  }, [slug]);

  const fetchJobDetails = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("jobs" as any)
        .select(`
          *,
          profiles:client_id (
            full_name,
            avatar_url,
            bio
          ),
          categories:category_id (
            name,
            slug
          )
        `)
        .eq("slug", slug)
        .eq("status", "open")
        .single();

      if (error) throw error;

      if (data) {
        // Transform the data
        const transformedJob = {
          ...(data as any),
          profiles: Array.isArray((data as any).profiles) ? (data as any).profiles[0] : (data as any).profiles,
          categories: Array.isArray((data as any).categories) ? (data as any).categories[0] : (data as any).categories,
        };
        setJob(transformedJob);

        // Increment views count
        await supabase
          .from("jobs" as any)
          .update({ views_count: ((data as any).views_count || 0) + 1 })
          .eq("id", (data as any).id);
      }
    } catch (error: any) {
      console.error("Error fetching job details:", error);
      if (error.code === "PGRST116") {
        toast.error("Job not found or no longer available");
      } else {
        toast.error("Failed to load job details: " + error.message);
      }
      navigate("/jobs");
    } finally {
      setLoading(false);
    }
  };

  const formatBudget = (budget: number | null, currency: string) => {
    if (!budget) return "Budget not specified";
    return `${currency} ${budget.toLocaleString()}`;
  };

  const handleApply = async () => {
    if (!user) {
      toast.error("Please sign in to apply for this job");
      navigate("/auth");
      return;
    }

    if (!profile || profile.user_type !== "freelancer") {
      toast.error("Only freelancers can apply for jobs");
      return;
    }

    if (!job) return;

    // Check if user is trying to apply to their own job
    if (user.id === job.client_id) {
      toast.error("You cannot apply to your own job posting");
      return;
    }

    if (!applicationText.trim()) {
      toast.error("Please provide a message explaining why you're a good fit");
      return;
    }

    setSubmittingApplication(true);

    try {
      // Check if already applied
      const { data: existingApplication } = await supabase
        .from("job_applications" as any)
        .select("id")
        .eq("job_id", job.id)
        .eq("freelancer_id", user.id)
        .maybeSingle();

      if (existingApplication) {
        toast.error("You have already applied for this job");
        setSubmittingApplication(false);
        return;
      }

      // Create job application
      const { data: application, error: applicationError } = await supabase
        .from("job_applications" as any)
        .insert({
          job_id: job.id,
          freelancer_id: user.id,
          application_text: applicationText,
          status: "pending",
        })
        .select()
        .single();

      if (applicationError) {
        if (applicationError.code === "23505") {
          toast.error("You have already applied for this job");
          setSubmittingApplication(false);
          return;
        }
        if (applicationError.code === "PGRST205") {
          toast.error("Job applications table not found. Please run the database migration.");
          setSubmittingApplication(false);
          return;
        }
        throw applicationError;
      }

      // Create message to client
      let messageId = null;
      try {
        const { data: message, error: messageError } = await supabase
          .from("messages" as any)
          .insert({
            sender_id: user.id,
            receiver_id: job.client_id,
            job_id: job.id,
            content: `Application for "${job.title}":\n\n${applicationText}`,
          })
          .select()
          .single();

        if (!messageError && message) {
          messageId = (message as any).id;
          // Update application with message_id
          await supabase
            .from("job_applications" as any)
            .update({ message_id: (message as any).id })
            .eq("id", (application as any).id);
        }
      } catch (messageErr) {
        console.warn("Failed to create message, but application was created:", messageErr);
      }

      // Increment applications count
      await supabase
        .from("jobs" as any)
        .update({ applications_count: (job.applications_count || 0) + 1 })
        .eq("id", job.id);

      // Send email notification to client
      try {
        await sendJobApplicationEmail((job as any).client_id, (job as any).id, user.id, (job as any).title);
      } catch (emailError) {
        console.error("Failed to send email notification:", emailError);
        // Don't fail the application if email fails
      }

      // Log application
      try {
        await supabase.from("audit_logs").insert([{
          user_id: user.id,
          action: "job_apply",
          table_name: "job_applications",
          record_id: (application as any).id,
          new_data: {
            job_id: (job as any).id,
            job_title: (job as any).title,
            application_text: applicationText.substring(0, 100), // First 100 chars
          },
        }]);
      } catch (logError) {
        console.error("Error logging application:", logError);
      }

      toast.success("Application submitted successfully! The client will be notified.");
      setApplicationText("");
      navigate("/freelancer/dashboard");
    } catch (error: any) {
      console.error("Error applying for job:", error);
      toast.error("Failed to submit application: " + error.message);
    } finally {
      setSubmittingApplication(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-slate-700"></div>
          <p className="mt-4 text-gray-600">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-xl text-gray-600 mb-4">Job not found</p>
            <Button asChild>
              <Link to="/jobs">Browse Jobs</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isClient = user?.id === job.client_id;
  const isFreelancer = profile?.user_type === "freelancer";

  return (
    <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 max-w-4xl">
      <Button
        variant="ghost"
        onClick={() => navigate("/jobs")}
        className="mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Jobs
      </Button>

      <div className="grid lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title and Meta */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <CardTitle className="text-xl sm:text-2xl md:text-3xl mb-2">{job.title}</CardTitle>
                  <div className="flex items-center gap-3 flex-wrap">
                    {job.categories && (
                      <Badge variant="secondary">{job.categories.name}</Badge>
                    )}
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      {job.status}
                    </Badge>
                    {job.views_count > 0 && (
                      <div className="flex items-center gap-1 text-gray-600 text-sm">
                        <Briefcase className="w-4 h-4" />
                        <span>{job.views_count} views</span>
                      </div>
                    )}
                    {job.applications_count > 0 && (
                      <div className="flex items-center gap-1 text-gray-600 text-sm">
                        <MessageCircle className="w-4 h-4" />
                        <span>{job.applications_count} applications</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <p className="text-gray-700 whitespace-pre-line">{job.description}</p>
              </div>

              {/* Requirements */}
              {job.requirements && (
                <div className="mt-6">
                  <h3 className="font-semibold text-lg mb-2">Requirements</h3>
                  <p className="text-gray-700 whitespace-pre-line">{job.requirements}</p>
                </div>
              )}

              {/* Job Details */}
              <div className="mt-6 grid md:grid-cols-2 gap-4 pt-6 border-t">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Budget</p>
                  <p className="font-semibold text-lg text-slate-700">
                    {formatBudget(job.budget, job.currency)}
                  </p>
                </div>
                {job.delivery_days && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Expected Delivery</p>
                    <p className="font-semibold flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {job.delivery_days} day{job.delivery_days !== 1 ? "s" : ""}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-500 mb-1">Posted</p>
                  <p className="font-medium flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {new Date(job.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Application Form (for freelancers) */}
          {isFreelancer && !isClient && (
            <Card>
              <CardHeader>
                <CardTitle>Apply for This Job</CardTitle>
                <CardDescription>
                  Send a message to the client explaining why you're the right fit
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="application">Your Application Message *</Label>
                  <Textarea
                    id="application"
                    value={applicationText}
                    onChange={(e) => setApplicationText(e.target.value)}
                    placeholder="Tell the client about your experience, skills, and why you're perfect for this job..."
                    rows={6}
                    maxLength={1000}
                    required
                  />
                  <p className="text-xs text-gray-500">
                    {applicationText.length}/1000 characters
                  </p>
                </div>
                <Button
                  onClick={handleApply}
                  disabled={submittingApplication || !applicationText.trim()}
                  className="w-full"
                  size="lg"
                >
                  {submittingApplication ? "Submitting..." : "Submit Application"}
                </Button>
              </CardContent>
            </Card>
          )}

          {isClient && (
            <Card>
              <CardContent className="py-6 text-center space-y-4">
                <p className="text-gray-600">This is your job posting.</p>
                <div className="flex gap-3 justify-center">
                  <Button asChild>
                    <Link to={`/job/${slug}/applications`}>
                      View Applications ({job.applications_count || 0})
                    </Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link to="/messages">View Messages</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Client Card */}
          <Card>
            <CardHeader>
              <CardTitle>About the Client</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={job.profiles?.avatar_url} />
                  <AvatarFallback>
                    {job.profiles?.full_name?.[0]?.toUpperCase() || "C"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-lg">{job.profiles?.full_name}</p>
                </div>
              </div>
              {job.profiles?.bio && (
                <p className="text-sm text-gray-600 mb-4">{job.profiles.bio}</p>
              )}
              {!isClient && (
              <Button variant="outline" className="w-full" asChild>
                <Link to={`/messages?user=${(job as any).client_id}`}>
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Contact Client
                </Link>
              </Button>
              )}
            </CardContent>
          </Card>

          {/* Quick Info Card */}
          <Card>
            <CardHeader>
              <CardTitle>Job Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Budget:</span>
                <span className="font-semibold text-slate-700">
                  {formatBudget(job.budget, job.currency)}
                </span>
              </div>
              {job.delivery_days && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery:</span>
                  <span className="font-semibold">{job.delivery_days} days</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  {job.status}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Applications:</span>
                <span className="font-semibold">{job.applications_count}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

