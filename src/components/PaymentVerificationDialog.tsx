import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, CreditCard } from "lucide-react";

interface Enrollee {
  id: string;
  cin: string | null;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  registration_date: string;
  health_plan: string;
  payment_status: string;
}

interface PaymentVerificationDialogProps {
  enrollee: Enrollee | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function PaymentVerificationDialog({
  enrollee,
  open,
  onOpenChange,
  onSuccess,
}: PaymentVerificationDialogProps) {
  const [step, setStep] = useState(1);
  const [paymentReference, setPaymentReference] = useState("");
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState("bank_transfer");
  const [verifying, setVerifying] = useState(false);

  const getFullName = () => {
    if (!enrollee) return "";
    return [enrollee.first_name, enrollee.middle_name, enrollee.last_name]
      .filter(Boolean)
      .join(' ');
  };

  const handleVerifyPayment = async () => {
    if (!enrollee) return;

    setVerifying(true);
    try {
      const oldData = {
        payment_status: enrollee.payment_status,
      };

      // Update payment status
      const { error: updateError } = await supabase
        .from("enrollees")
        .update({
          payment_status: "confirmed",
          payment_reference: paymentReference,
          payment_date: new Date(paymentDate).toISOString(),
        })
        .eq("id", enrollee.id);

      if (updateError) throw updateError;

      // Generate CIN if not already generated
      if (!enrollee.cin) {
        const { data: cinData, error: cinError } = await supabase.rpc("generate_cin");
        if (!cinError && cinData) {
          await supabase.from("enrollees").update({ cin: cinData }).eq("id", enrollee.id);
        }
      }

      // Create audit log
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("audit_logs").insert({
          user_id: user.id,
          record_id: enrollee.id,
          action: "payment_verified",
          table_name: "enrollees",
          old_data: oldData,
          new_data: {
            payment_status: "confirmed",
            payment_reference: paymentReference,
            payment_date: paymentDate,
            payment_method: paymentMethod,
          },
        });
      }

      toast.success("Payment verified successfully");
      handleClose();
      onSuccess();
    } catch (error: any) {
      toast.error("Failed to verify payment");
      console.error(error);
    } finally {
      setVerifying(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setPaymentReference("");
    setPaymentDate(new Date().toISOString().split('T')[0]);
    setPaymentMethod("bank_transfer");
    onOpenChange(false);
  };

  if (!enrollee) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Verification
          </DialogTitle>
          <DialogDescription>
            Verify payment for enrollee registration
          </DialogDescription>
        </DialogHeader>

        {/* Stepper */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className={`flex items-center justify-center h-8 w-8 rounded-full ${step >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
              {step > 1 ? <CheckCircle2 className="h-4 w-4" /> : "1"}
            </div>
            <span className="text-sm font-medium">Details</span>
          </div>
          <div className="flex-1 h-px bg-border mx-2" />
          <div className="flex items-center gap-2">
            <div className={`flex items-center justify-center h-8 w-8 rounded-full ${step >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
              {step > 2 ? <CheckCircle2 className="h-4 w-4" /> : "2"}
            </div>
            <span className="text-sm font-medium">Payment Info</span>
          </div>
          <div className="flex-1 h-px bg-border mx-2" />
          <div className="flex items-center gap-2">
            <div className={`flex items-center justify-center h-8 w-8 rounded-full ${step >= 3 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
              {step > 3 ? <CheckCircle2 className="h-4 w-4" /> : "3"}
            </div>
            <span className="text-sm font-medium">Confirm</span>
          </div>
        </div>

        {/* Step 1: Review Details */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="p-4 bg-muted/50 rounded-lg space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold">{getFullName()}</p>
                  <p className="text-sm text-muted-foreground">
                    CIN: {enrollee.cin || "Will be generated"}
                  </p>
                </div>
                <Badge variant="secondary">Pending Verification</Badge>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-2 border-t">
                <div>
                  <p className="text-xs text-muted-foreground">Registration Date</p>
                  <p className="text-sm font-medium">
                    {new Date(enrollee.registration_date).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Health Plan</p>
                  <p className="text-sm font-medium capitalize">{enrollee.health_plan}</p>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button onClick={() => setStep(2)}>
                Next: Enter Payment Info
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Enter Payment Information */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="payment-reference">Payment Reference Number *</Label>
              <Input
                id="payment-reference"
                value={paymentReference}
                onChange={(e) => setPaymentReference(e.target.value)}
                placeholder="Enter payment reference number"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment-date">Payment Date *</Label>
              <Input
                id="payment-date"
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment-method">Payment Method</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger id="payment-method">
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="card">Card Payment</SelectItem>
                  <SelectItem value="mobile_money">Mobile Money</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button onClick={() => setStep(3)} disabled={!paymentReference || !paymentDate}>
                Next: Review & Confirm
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Confirmation */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="p-4 bg-muted/50 rounded-lg space-y-3">
              <h3 className="font-semibold text-sm">Review Payment Information</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Enrollee:</span>
                  <span className="font-medium">{getFullName()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Payment Reference:</span>
                  <span className="font-medium">{paymentReference}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Payment Date:</span>
                  <span className="font-medium">
                    {new Date(paymentDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Payment Method:</span>
                  <span className="font-medium capitalize">{paymentMethod.replace('_', ' ')}</span>
                </div>
              </div>
            </div>

            {!enrollee.cin && (
              <div className="p-3 bg-primary/10 border border-primary/20 rounded-md">
                <p className="text-sm text-primary">
                  ✓ CIN will be automatically generated upon verification
                </p>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setStep(2)} disabled={verifying}>
                Back
              </Button>
              <Button onClick={handleVerifyPayment} disabled={verifying}>
                {verifying ? "Verifying..." : "Confirm & Verify Payment"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
