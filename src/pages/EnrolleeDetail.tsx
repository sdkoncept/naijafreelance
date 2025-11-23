import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, Trash2, Printer, Edit, CheckCircle, XCircle, Clock } from "lucide-react";
import { toast } from "sonner";
import DependantForm from "@/components/DependantForm";
import { IDCard } from "@/components/IDCard";
import { useReactToPrint } from "react-to-print";
import { useAuth } from "@/hooks/use-auth";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FacilityHistory } from "@/components/FacilityHistory";
import { PLAN_NAMES } from "@/constants/plans";

interface Enrollee {
  id: string;
  cin: string;
  registration_date: string;
  lga: string;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  date_of_birth: string;
  gender: string;
  home_address: string;
  phone_number: string;
  email: string | null;
  genotype: string;
  blood_group: string;
  allergies: string | null;
  photo_url: string | null;
  payment_status: string;
  payment_date: string | null;
  payment_reference: string | null;
  facility: string;
  health_plan: string;
  created_by: string;
}

interface Dependant {
  id: string;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  date_of_birth: string;
  gender: string;
  relationship: string;
  phone_number: string | null;
  address: string | null;
  genotype: string | null;
  allergies: string | null;
  photo_url: string | null;
}

export default function EnrolleeDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, userRole } = useAuth();
  const [enrollee, setEnrollee] = useState<Enrollee | null>(null);
  const [dependants, setDependants] = useState<Dependant[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDependantForm, setShowDependantForm] = useState(false);
  const [printingEnrollee, setPrintingEnrollee] = useState(false);
  const [printingDependantId, setPrintingDependantId] = useState<string | null>(null);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<string>("");
  const [paymentReference, setPaymentReference] = useState<string>("");
  const [paymentDate, setPaymentDate] = useState<string>("");
  const [paymentNotes, setPaymentNotes] = useState<string>("");
  const [updating, setUpdating] = useState(false);
  const [showPlanDialog, setShowPlanDialog] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<"bronze" | "silver" | "formal" | "enhanced" | "equity">("bronze");
  const enrolleeCardRef = useRef<HTMLDivElement>(null);
  const dependantCardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchEnrolleeDetails();
  }, [id]);

  const fetchEnrolleeDetails = async () => {
    if (!id) return;

    try {
      const { data: enrolleeData, error: enrolleeError } = await supabase
        .from("enrollees")
        .select("*")
        .eq("id", id)
        .single();

      if (enrolleeError) throw enrolleeError;
      setEnrollee(enrolleeData);

      const { data: dependantsData, error: dependantsError } = await supabase
        .from("dependants")
        .select("*")
        .eq("enrollee_id", id);

      if (dependantsError) throw dependantsError;
      setDependants(dependantsData || []);
    } catch (error: any) {
      toast.error("Failed to load enrollee details");
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDependant = async (dependantId: string) => {
    if (!confirm("Are you sure you want to delete this dependant?")) return;

    try {
      const dependantToDelete = dependants.find(d => d.id === dependantId);
      
      const { error } = await supabase.from("dependants").delete().eq("id", dependantId);
      if (error) throw error;

      // Log dependant deletion
      const { data: { user } } = await supabase.auth.getUser();
      if (user && dependantToDelete) {
        const { error: logError } = await supabase.from("audit_logs").insert([{
          user_id: user.id,
          action: "dependant_delete",
          table_name: "dependants",
          record_id: dependantId,
          old_data: dependantToDelete as any,
        }]);
        if (logError) console.error("Failed to log action:", logError);
      }

      toast.success("Dependant deleted successfully");
      setDependants(dependants.filter((d) => d.id !== dependantId));
    } catch (error: any) {
      toast.error("Failed to delete dependant");
    }
  };

  const handlePrintEnrolleeCard = () => {
    setPrintingEnrollee(true);
    setTimeout(() => {
      const printFn = useReactToPrint({
        contentRef: enrolleeCardRef,
        documentTitle: `ID-Card-${enrollee?.cin}`,
        onAfterPrint: () => setPrintingEnrollee(false),
      });
      printFn();
    }, 100);
  };

  const handlePrintDependantCard = (dependantId: string) => {
    setPrintingDependantId(dependantId);
    setTimeout(() => {
      const printFn = useReactToPrint({
        contentRef: dependantCardRef,
        documentTitle: `ID-Card-${enrollee?.cin}-DEP-${dependantId.slice(0, 8)}`,
        onAfterPrint: () => setPrintingDependantId(null),
      });
      printFn();
    }, 100);
  };

  const getFullName = (person: Enrollee | Dependant) => {
    return [person.first_name, person.middle_name, person.last_name]
      .filter(Boolean)
      .join(' ');
  };

  const getPaymentStatusBadge = (status: string) => {
    const statusConfig = {
      confirmed: { variant: "default" as const, icon: CheckCircle, label: "Confirmed" },
      pending: { variant: "secondary" as const, icon: Clock, label: "Pending" },
      failed: { variant: "destructive" as const, icon: XCircle, label: "Failed" },
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const handleOpenPaymentDialog = () => {
    if (enrollee) {
      setPaymentStatus(enrollee.payment_status);
      setPaymentReference(enrollee.payment_reference || "");
      setPaymentDate(enrollee.payment_date ? new Date(enrollee.payment_date).toISOString().split('T')[0] : "");
      setPaymentNotes("");
      setShowPaymentDialog(true);
    }
  };

  const handleUpdatePaymentStatus = async () => {
    if (!enrollee) return;
    setUpdating(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const updateData: any = {
        payment_status: paymentStatus,
        payment_reference: paymentReference || null,
      };

      if (paymentStatus === "confirmed") {
        updateData.payment_date = paymentDate || new Date().toISOString();
      } else {
        updateData.payment_date = null;
      }

      const { error: updateError } = await supabase
        .from("enrollees")
        .update(updateData)
        .eq("id", id);

      if (updateError) throw updateError;

      // Generate CIN if status is confirmed and CIN doesn't exist
      if (paymentStatus === "confirmed" && !enrollee.cin && enrollee.health_plan && enrollee.lga) {
        const { data: cinData, error: cinError } = await supabase.rpc("generate_enrollee_cin", {
          plan: enrollee.health_plan as any,
          lga: enrollee.lga
        });
        if (!cinError && cinData) {
          await supabase.from("enrollees").update({ cin: cinData }).eq("id", id);
        }
      }

      // Create audit log
      await supabase.from("audit_logs").insert({
        user_id: user.id,
        record_id: id!,
        action: "payment_status_updated",
        table_name: "enrollees",
        old_data: { 
          payment_status: enrollee.payment_status,
          payment_reference: enrollee.payment_reference,
          payment_date: enrollee.payment_date,
        },
        new_data: updateData,
      });

      toast.success("Payment status updated successfully");
      setShowPaymentDialog(false);
      await fetchEnrolleeDetails();
    } catch (error: any) {
      toast.error("Failed to update payment status");
      console.error(error);
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdateHealthPlan = async () => {
    if (!enrollee) return;
    setUpdating(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Generate new CIN with the new plan
      const { data: newCin, error: cinError } = await supabase.rpc("generate_enrollee_cin", {
        plan: selectedPlan as any,
        lga: enrollee.lga
      });

      if (cinError) throw cinError;

      const updateData: any = { health_plan: selectedPlan };
      if (newCin) {
        updateData.cin = newCin;
      }

      const { error: updateError } = await supabase
        .from("enrollees")
        .update(updateData)
        .eq("id", id);

      if (updateError) throw updateError;

      // Create audit log
      await supabase.from("audit_logs").insert({
        user_id: user.id,
        record_id: id!,
        action: "health_plan_updated",
        table_name: "enrollees",
        old_data: { 
          health_plan: enrollee.health_plan,
          cin: enrollee.cin 
        },
        new_data: { 
          health_plan: selectedPlan,
          cin: newCin 
        },
      });

      toast.success("Health plan and CIN updated successfully");
      setShowPlanDialog(false);
      await fetchEnrolleeDetails();
    } catch (error: any) {
      toast.error("Failed to update health plan");
      console.error(error);
    } finally {
      setUpdating(false);
    }
  };

  const canEditPayment = () => {
    if (!enrollee || !user || userRole === "viewer") return false;
    return userRole === "admin" || enrollee.created_by === user.id;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!enrollee) {
    return <div>Enrollee not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate("/")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
        {userRole !== "viewer" && (
          <Button onClick={handlePrintEnrolleeCard}>
            <Printer className="mr-2 h-4 w-4" />
            Print ID Card
          </Button>
        )}
      </div>

      {/* Print View for Enrollee Card */}
      <div style={{ display: printingEnrollee ? 'block' : 'none' }}>
        <div ref={enrolleeCardRef}>
          <IDCard
            type="enrollee"
            data={{
              cin: enrollee.cin,
              full_name: getFullName(enrollee),
              date_of_birth: enrollee.date_of_birth,
              gender: enrollee.gender,
              blood_group: enrollee.blood_group,
              phone_number: enrollee.phone_number,
              photo_url: enrollee.photo_url || undefined,
            }}
            isPrinting={true}
          />
        </div>
      </div>

      {/* Print View for Dependant Card */}
      {printingDependantId && (
        <div style={{ display: 'block' }}>
          <div ref={dependantCardRef}>
            {(() => {
              const dep = dependants.find(d => d.id === printingDependantId);
              if (!dep) return null;
              return (
                <IDCard
                  type="dependant"
                  data={{
                    enrollee_cin: enrollee.cin,
                    full_name: getFullName(dep),
                    date_of_birth: dep.date_of_birth,
                    gender: dep.gender,
                    blood_group: dep.genotype || "N/A",
                    phone_number: dep.phone_number || undefined,
                    relationship: dep.relationship,
                    photo_url: dep.photo_url || undefined,
                  }}
                  isPrinting={true}
                />
              );
            })()}
          </div>
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>Enrollee Information</CardTitle>
              <CardDescription>Complete enrollee details</CardDescription>
            </div>
            {canEditPayment() && (
              <Button onClick={handleOpenPaymentDialog} variant="outline" size="sm">
                <Edit className="mr-2 h-4 w-4" />
                Edit Payment Status
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Payment Status Section */}
          <div className="p-4 bg-muted/50 rounded-lg space-y-3">
            <h3 className="font-semibold text-sm">Payment Information</h3>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Payment Status</p>
                <div className="mt-1">{getPaymentStatusBadge(enrollee.payment_status)}</div>
              </div>
              {enrollee.payment_date && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Payment Date</p>
                  <p className="mt-1">{new Date(enrollee.payment_date).toLocaleDateString()}</p>
                </div>
              )}
              {enrollee.payment_reference && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Payment Reference</p>
                  <p className="mt-1 text-sm">{enrollee.payment_reference}</p>
                </div>
              )}
            </div>
            {enrollee.payment_status === "confirmed" && !enrollee.cin && (
              <p className="text-sm text-muted-foreground italic">
                ✓ CIN can be generated for this enrollee
              </p>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-muted-foreground">CIN</p>
              <p className="text-lg font-semibold">{enrollee.cin || "Not Generated"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Full Name</p>
              <p className="text-lg">{getFullName(enrollee)}</p>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Health Plan</p>
                <Badge variant="outline" className="capitalize">{enrollee.health_plan}</Badge>
              </div>
              {canEditPayment() && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedPlan(enrollee.health_plan as "bronze" | "silver" | "formal" | "enhanced" | "equity");
                    setShowPlanDialog(true);
                  }}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Facility</p>
              <p>{enrollee.facility}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Date of Birth</p>
              <p>{new Date(enrollee.date_of_birth).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Gender</p>
              <p>{enrollee.gender}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">LGA</p>
              <p>{enrollee.lga}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Phone Number</p>
              <p>{enrollee.phone_number}</p>
            </div>
            {enrollee.email && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Email</p>
                <p>{enrollee.email}</p>
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-muted-foreground">Genotype</p>
              <Badge>{enrollee.genotype}</Badge>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Blood Group</p>
              <Badge>{enrollee.blood_group}</Badge>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm font-medium text-muted-foreground">Home Address</p>
              <p>{enrollee.home_address}</p>
            </div>
            {enrollee.allergies && (
              <div className="md:col-span-2">
                <p className="text-sm font-medium text-muted-foreground">Allergies</p>
                <p>{enrollee.allergies}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Dependants</CardTitle>
            <CardDescription>Manage enrollee dependants</CardDescription>
          </div>
          {userRole !== "viewer" && (
            <Button onClick={() => setShowDependantForm(!showDependantForm)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Dependant
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {showDependantForm && (
            <DependantForm
              enrolleeId={id!}
              onSuccess={() => {
                setShowDependantForm(false);
                fetchEnrolleeDetails();
              }}
              onCancel={() => setShowDependantForm(false)}
            />
          )}

          {dependants.length === 0 && !showDependantForm ? (
            <p className="text-center text-muted-foreground py-4">No dependants added yet</p>
          ) : (
            <div className="space-y-2">
              {dependants.map((dependant) => (
                <div
                  key={dependant.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">{getFullName(dependant)}</p>
                    <p className="text-sm text-muted-foreground">
                      {dependant.relationship} | DOB: {new Date(dependant.date_of_birth).toLocaleDateString()}
                      {dependant.genotype && ` | Genotype: ${dependant.genotype}`}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {userRole !== "viewer" && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handlePrintDependantCard(dependant.id)}
                        >
                          <Printer className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteDependant(dependant.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Facility History */}
      <FacilityHistory enrolleeId={id!} currentFacility={enrollee.facility} />

      {/* Payment Status Edit Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Payment Status</DialogTitle>
            <DialogDescription>
              Update the payment status for this enrollee
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Payment Status</Label>
              <Select
                value={paymentStatus}
                onValueChange={(value: any) => setPaymentStatus(value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Payment Reference</Label>
              <Input
                value={paymentReference}
                onChange={(e) => setPaymentReference(e.target.value)}
                placeholder="Enter payment reference"
              />
            </div>

            {paymentStatus === "confirmed" && (
              <div className="space-y-2">
                <Label>Payment Date</Label>
                <Input
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label>Notes (Optional)</Label>
              <Textarea
                value={paymentNotes}
                onChange={(e) => setPaymentNotes(e.target.value)}
                placeholder="Add any notes or comments"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPaymentDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdatePaymentStatus}>Update Status</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Health Plan Edit Dialog */}
      <Dialog open={showPlanDialog} onOpenChange={setShowPlanDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Health Plan</DialogTitle>
            <DialogDescription>
              Change the health plan for this enrollee
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Health Plan</Label>
              <Select
                value={selectedPlan}
                onValueChange={(value: any) => setSelectedPlan(value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(PLAN_NAMES).map(([key, name]) => (
                    <SelectItem key={key} value={key}>{name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPlanDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateHealthPlan}>Update Plan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
