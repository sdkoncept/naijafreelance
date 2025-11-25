import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

const withdrawalSchema = z.object({
  amount: z.string().min(1, "Amount is required").refine(
    (val) => {
      const num = parseFloat(val);
      return !isNaN(num) && num > 0 && num >= 2000;
    },
    { message: "Minimum withdrawal amount is ₦2,000" }
  ),
  bank_name: z.string().min(1, "Bank name is required"),
  account_number: z.string().min(10, "Account number must be at least 10 digits").regex(/^\d+$/, "Account number must contain only digits"),
  account_name: z.string().min(1, "Account name is required"),
});

type WithdrawalForm = z.infer<typeof withdrawalSchema>;

interface WithdrawalRequestFormProps {
  availableBalance: number;
  onSuccess: () => void;
  onCancel?: () => void;
}

export default function WithdrawalRequestForm({
  availableBalance,
  onSuccess,
  onCancel,
}: WithdrawalRequestFormProps) {
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<WithdrawalForm>({
    resolver: zodResolver(withdrawalSchema),
  });

  const amountValue = watch("amount");

  const nigerianBanks = [
    "Access Bank",
    "Citibank",
    "Ecobank Nigeria",
    "Fidelity Bank",
    "First Bank of Nigeria",
    "First City Monument Bank",
    "Guaranty Trust Bank",
    "Heritage Bank",
    "Keystone Bank",
    "Polaris Bank",
    "Providus Bank",
    "Stanbic IBTC Bank",
    "Standard Chartered Bank",
    "Sterling Bank",
    "Suntrust Bank",
    "Union Bank of Nigeria",
    "United Bank for Africa",
    "Unity Bank",
    "Wema Bank",
    "Zenith Bank",
  ];

  const onSubmit = async (data: WithdrawalForm) => {
    if (!user) {
      toast.error("You must be logged in to request a withdrawal");
      return;
    }

    const amount = parseFloat(data.amount);

    if (amount > availableBalance) {
      toast.error("Insufficient balance. Available: ₦" + availableBalance.toLocaleString());
      return;
    }

    setSubmitting(true);

    try {
      const { error } = await supabase.from("withdrawals").insert({
        freelancer_id: user.id,
        amount,
        currency: "NGN",
        bank_name: data.bank_name,
        account_number: data.account_number,
        account_name: data.account_name,
        status: "pending",
      });

      if (error) throw error;

      toast.success("Withdrawal request submitted successfully! It will be processed within 3-5 business days.");
      onSuccess();
    } catch (error: any) {
      console.error("Error requesting withdrawal:", error);
      if (error.code === "PGRST205") {
        toast.error("Withdrawals table not available. Please contact support.");
      } else {
        toast.error("Failed to submit withdrawal request: " + error.message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Request Withdrawal</CardTitle>
        <CardDescription>
          Withdraw your earnings to your Nigerian bank account. Minimum withdrawal: ₦2,000
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Available Balance Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900 mb-1">
              <strong>Available Balance:</strong>
            </p>
            <p className="text-2xl font-bold text-blue-900">
              ₦{availableBalance.toLocaleString()}
            </p>
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Withdrawal Amount (₦) *</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="2000"
              max={availableBalance}
              placeholder="Enter amount (minimum ₦2,000)"
              {...register("amount")}
              disabled={submitting}
            />
            {errors.amount && (
              <p className="text-sm text-red-600">{errors.amount.message}</p>
            )}
            {amountValue && parseFloat(amountValue) > availableBalance && (
              <p className="text-sm text-red-600">
                Amount exceeds available balance
              </p>
            )}
          </div>

          {/* Bank Name */}
          <div className="space-y-2">
            <Label htmlFor="bank_name">Bank Name *</Label>
            <Select
              onValueChange={(value) => setValue("bank_name", value)}
              disabled={submitting}
            >
              <SelectTrigger id="bank_name">
                <SelectValue placeholder="Select your bank" />
              </SelectTrigger>
              <SelectContent>
                {nigerianBanks.map((bank) => (
                  <SelectItem key={bank} value={bank}>
                    {bank}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.bank_name && (
              <p className="text-sm text-red-600">{errors.bank_name.message}</p>
            )}
          </div>

          {/* Account Number */}
          <div className="space-y-2">
            <Label htmlFor="account_number">Account Number *</Label>
            <Input
              id="account_number"
              type="text"
              placeholder="Enter 10-digit account number"
              maxLength={10}
              {...register("account_number")}
              disabled={submitting}
            />
            {errors.account_number && (
              <p className="text-sm text-red-600">{errors.account_number.message}</p>
            )}
          </div>

          {/* Account Name */}
          <div className="space-y-2">
            <Label htmlFor="account_name">Account Name *</Label>
            <Input
              id="account_name"
              type="text"
              placeholder="Enter account name as it appears on your bank statement"
              {...register("account_name")}
              disabled={submitting}
            />
            {errors.account_name && (
              <p className="text-sm text-red-600">{errors.account_name.message}</p>
            )}
          </div>

          {/* Info Note */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-sm text-amber-900">
              <strong>Processing Time:</strong> Withdrawals are typically processed within 3-5 business days. You'll be notified once your withdrawal is processed.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              type="submit"
              disabled={submitting || !amountValue || parseFloat(amountValue || "0") > availableBalance}
              className="flex-1"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Withdrawal Request"
              )}
            </Button>
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={submitting}
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

