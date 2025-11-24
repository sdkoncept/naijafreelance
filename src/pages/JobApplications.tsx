import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { ArrowLeft, Calendar, CheckCircle, XCircle, MessageCircle, User, Clock } from "lucide-react";

interface Application {
  id: string;
  job_id: string;
  freelancer_id: string;
  application_text: string;
  status: string;
  created_at: string;
  profiles: {
    full_name: string;
    avatar_url?: string;
    email?: string;
    bio?: string;
  };
  jobs: {
    title: string;
    slug: string;
  };
}

export default function JobApplications() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [job, setJob] = useState<any>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [declineReason, setDeclineReason] = useState("");
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    if (slug) {
      fetchJobAndApplications();
    }
  }, [slug]);

  const fetchJobAndApplications = async () => {
    try {
      setLoading(true);
      
      // Fetch job
      const { data: jobData, error: jobError } = await supabase
        .from("jobs" as any)
        .select("*")
        .eq("slug", slug)
        .single();

      if (jobError) throw jobError;
      setJob(jobData);

      // Verify user owns this job
      if (jobData.client_id !== user?.id) {
        toast.error("You don't have permission to view these applications");
        navigate("/jobs");
        return;
      }

      // Fetch applications
      const { data: applicationsData, error: applicationsError } = await supabase
        .from("job_applications" as any)
        .select(`
          *,
          profiles:freelancer_id (
            full_name,
            avatar_url,
            email,
            bio
          ),
          jobs:job_id (
            title,
            slug
          )
        `)
        .eq("job_id", jobData.id)
        .order("created_at", { ascending: false });

      if (applicationsError) {
        if (applicationsError.code === "PGRST205") {
          toast.error("Job applications table not found. Please run the database migration.");
          setLoading(false);
          return;
        }
        throw applicationsError;
      }

      const transformedApplications = (applicationsData || []).map((app: any) => ({
        ...app,
        profiles: Array.isArray(app.profiles) ? app.profiles[0] : app.profiles,
        jobs: Array.isArray(app.jobs) ? app.jobs[0] : app.jobs,
      }));

      setApplications(transformedApplications);
    } catch (error: any) {
      console.error("Error fetching applications:", error);
      toast.error("Failed to load applications: " + error.message);
      navigate("/jobs");
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (application: Application) => {
    setProcessing(application.id);

    try {
      // Update application status
      const { error: updateError } = await supabase
        .from("job_applications" as any)
        .update({
          status: "accepted",
          accepted_at: new Date().toISOString(),
        })
        .eq("id", application.id);

      if (updateError) throw updateError;

      // Optionally close the job or mark as in_progress
      await supabase
        .from("jobs" as any)
        .update({ status: "in_progress" })
        .eq("id", application.job_id);

      // Send notification email to freelancer
      try {
        await sendApplicationStatusEmail(
          application.freelancer_id,
          application.job_id,
          "accepted",
          job.title
        );
      } catch (emailError) {
        console.error("Failed to send email:", emailError);
      }

      // Log action
      try {
        await supabase.from("audit_logs").insert([{
          user_id: user?.id,
          action: "job_application_accepted",
          table_name: "job_applications",
          record_id: application.id,
          new_data: {
            application_id: application.id,
            freelancer_id: application.freelancer_id,
            status: "accepted",
          },
        }]);
      } catch (logError) {
        console.error("Error logging:", logError);
      }

      toast.success("Application accepted! The freelancer has been notified.");
      fetchJobAndApplications();
    } catch (error: any) {
      console.error("Error accepting application:", error);
      toast.error("Failed to accept application: " + error.message);
    } finally {
      setProcessing(null);
    }
  };

  const handleDecline = async (application: Application) => {
    if (!declineReason.trim()) {
      toast.error("Please provide a reason for declining");
      return;
    }

    setProcessing(application.id);

    try {
      // Update application status
      const { error: updateError } = await supabase
        .from("job_applications" as any)
        .update({
          status: "declined",
          declined_at: new Date().toISOString(),
          declined_reason: declineReason,
        })
        .eq("id", application.id);

      if (updateError) throw updateError;

      // Send notification email to freelancer
      try {
        await sendApplicationStatusEmail(
          application.freelancer_id,
          application.job_id,
          "declined",
          job.title,
          declineReason
        );
      } catch (emailError) {
        console.error("Failed to send email:", emailError);
      }

      // Log action
      try {
        await supabase.from("audit_logs").insert([{
          user_id: user?.id,
          action: "job_application_declined",
          table_name: "job_applications",
          record_id: application.id,
          new_data: {
            application_id: application.id,
            freelancer_id: application.freelancer_id,
            status: "declined",
            reason: declineReason,
          },
        }]);
      } catch (logError) {
        console.error("Error logging:", logError);
      }

      toast.success("Application declined. The freelancer has been notified.");
      setSelectedApplication(null);
      setDeclineReason("");
      fetchJobAndApplications();
    } catch (error: any) {
      console.error("Error declining application:", error);
      toast.error("Failed to decline application: " + error.message);
    } finally {
      setProcessing(null);
    }
  };

  const sendApplicationStatusEmail = async (
    freelancerId: string,
    jobId: string,
    status: "accepted" | "declined",
    jobTitle: string,
    reason?: string
  ) => {
    try {
      const { data: freelancerProfile } = await supabase
        .from("profiles" as any)
        .select("email, full_name")
        .eq("id", freelancerId)
        .single();

      if (!freelancerProfile || !(freelancerProfile as any).email) return;

      const freelancer = freelancerProfile as any;

      try {
        await supabase.functions.invoke("send-application-status-email", {
          body: {
            to: freelancer.email,
            freelancerName: freelancer.full_name,
            jobTitle: jobTitle,
            status: status,
            reason: reason,
            jobUrl: `${window.location.origin}/job/${jobId}`,
          },
        });
      } catch (funcError) {
        console.warn("Email function not available, skipping email notification:", funcError);
      }
    } catch (error) {
      console.error("Error sending status email:", error);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
      pending: "outline",
      accepted: "default",
      declined: "destructive",
      withdrawn: "secondary",
    };

    return (
      <Badge variant={variants[status] || "outline"}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-slate-700"></div>
          <p className="mt-4 text-gray-600">Loading applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 max-w-6xl">
      <Button
        variant="ghost"
        onClick={() => navigate(`/job/${slug}`)}
        className="mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Job
      </Button>

      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">
          Applications for "{job?.title}"
        </h1>
        <p className="text-sm sm:text-base text-gray-600">
          Review and manage applications from freelancers
        </p>
      </div>

      {applications.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <MessageCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No applications yet</h3>
            <p className="text-gray-600">
              No freelancers have applied for this job yet. Share the job link to get more applicants.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {applications.map((application) => (
            <Card key={application.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={application.profiles?.avatar_url} />
                      <AvatarFallback>
                        {application.profiles?.full_name?.[0]?.toUpperCase() || "F"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-semibold text-lg">
                          {application.profiles?.full_name || "Unknown Freelancer"}
                        </h3>
                        {getStatusBadge(application.status)}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Applied {new Date(application.created_at).toLocaleDateString()}
                        </div>
                        {application.profiles?.email && (
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {application.profiles.email}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-900 mb-2">Application Message:</p>
                  <p className="text-gray-700 whitespace-pre-line">{application.application_text}</p>
                </div>

                {application.profiles?.bio && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-900 mb-1">About the Freelancer:</p>
                    <p className="text-sm text-gray-600">{application.profiles.bio}</p>
                  </div>
                )}

                {application.status === "pending" && (
                  <div className="flex gap-3 pt-4 border-t">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="default"
                          disabled={processing === application.id}
                          className="flex-1"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          {processing === application.id ? "Processing..." : "Accept"}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Accept Application</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to accept {application.profiles?.full_name}'s application?
                            This will notify the freelancer and mark the job as in progress.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleAccept(application)}>
                            Accept Application
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="destructive"
                          disabled={processing === application.id}
                          className="flex-1"
                          onClick={() => setSelectedApplication(application)}
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Decline
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Decline Application</AlertDialogTitle>
                          <AlertDialogDescription>
                            Please provide a reason for declining this application. The freelancer will be notified.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <div className="py-4">
                          <Label htmlFor="declineReason">Reason (Optional)</Label>
                          <Textarea
                            id="declineReason"
                            value={declineReason}
                            onChange={(e) => setDeclineReason(e.target.value)}
                            placeholder="e.g., Looking for someone with more experience in..."
                            rows={3}
                            className="mt-2"
                          />
                        </div>
                        <AlertDialogFooter>
                          <AlertDialogCancel onClick={() => setDeclineReason("")}>
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDecline(application)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Decline Application
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                )}

                {application.status === "accepted" && (
                  <div className="pt-4 border-t">
                    <div className="flex items-center gap-2 text-green-700 mb-2">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-medium">Application Accepted</span>
                    </div>
                    <Button variant="outline" asChild>
                      <Link to={`/messages?user=${application.freelancer_id}`}>
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Message Freelancer
                      </Link>
                    </Button>
                  </div>
                )}

                {application.status === "declined" && (
                  <div className="pt-4 border-t">
                    <div className="flex items-center gap-2 text-red-700 mb-2">
                      <XCircle className="w-5 h-5" />
                      <span className="font-medium">Application Declined</span>
                    </div>
                    {application.declined_reason && (
                      <p className="text-sm text-gray-600 mb-2">
                        Reason: {application.declined_reason}
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

