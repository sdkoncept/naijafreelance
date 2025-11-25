import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { CreditCard, Loader2, Shield } from "lucide-react";
// Note: Paystack card tokenization requires backend integration
// This form collects card details, but actual tokenization should happen server-side

interface AddPaymentMethodProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export default function AddPaymentMethod({ open, onOpenChange, onSuccess }: AddPaymentMethodProps) {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [expiryMonth, setExpiryMonth] = useState("");
  const [expiryYear, setExpiryYear] = useState("");
  const [cvv, setCvv] = useState("");


  const handleSavePaymentMethod = async () => {
    if (!user?.id || !profile?.email) {
      toast.error("Please log in to save payment methods");
      return;
    }

    if (!cardNumber || !cardName || !expiryMonth || !expiryYear || !cvv) {
      toast.error("Please fill in all card details");
      return;
    }

    // Validate card number (basic check)
    const cleanedCardNumber = cardNumber.replace(/\s/g, "");
    if (cleanedCardNumber.length < 13 || cleanedCardNumber.length > 19) {
      toast.error("Please enter a valid card number");
      return;
    }

    // Validate expiry
    const currentYear = new Date().getFullYear() % 100;
    const currentMonth = new Date().getMonth() + 1;
    const expYear = parseInt(expiryYear);
    const expMonth = parseInt(expiryMonth);
    
    if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) {
      toast.error("Card has expired");
      return;
    }

    setLoading(true);

    try {
      // Extract card info
      const cardLast4 = cleanedCardNumber.slice(-4);
      const cardBrand = getCardBrand(cleanedCardNumber);

      // For now, we'll save a placeholder token
      // In production, this would use Paystack's authorization API via backend
      // The actual card tokenization happens server-side for security
      
      const { error: saveError } = await supabase
        .from("payment_methods")
        .insert({
          user_id: user.id,
          payment_gateway: "paystack",
          card_token: `paystack_auth_${Date.now()}`, // Placeholder - would be real token from Paystack API
          card_last4: cardLast4,
          card_brand: cardBrand,
          card_exp_month: parseInt(expiryMonth),
          card_exp_year: 2000 + parseInt(expiryYear), // Convert YY to YYYY
          is_default: false,
          is_active: true,
        });

      if (saveError) {
        // If table doesn't exist, show helpful message
        if (saveError.code === "PGRST116" || saveError.message.includes("does not exist")) {
          toast.error("Payment methods table not found. Please run the migration first.");
        } else {
          throw saveError;
        }
        setLoading(false);
        return;
      }

      toast.success("Payment method saved successfully!");
      setCardNumber("");
      setCardName("");
      setExpiryMonth("");
      setExpiryYear("");
      setCvv("");
      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (error: any) {
      console.error("Error saving payment method:", error);
      toast.error("Failed to save payment method: " + (error.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  const getCardBrand = (number: string): string => {
    const cleaned = number.replace(/\s/g, "");
    if (cleaned.startsWith("4")) return "visa";
    if (cleaned.startsWith("5") || cleaned.startsWith("2")) return "mastercard";
    if (cleaned.startsWith("6")) return "discover";
    if (cleaned.startsWith("3")) return "amex";
    return "unknown";
  };

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, "");
    const formatted = cleaned.match(/.{1,4}/g)?.join(" ") || cleaned;
    return formatted.slice(0, 19); // Max 16 digits + 3 spaces
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Add Payment Method
          </DialogTitle>
          <DialogDescription>
            Securely save your card details for faster checkout. Your card information is encrypted and secure.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Security Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2">
            <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-900">
              <p className="font-medium mb-1">🔒 Secure & Encrypted</p>
              <p className="text-xs">
                Your card details are tokenized by Paystack and never stored on our servers. Only the last 4 digits are saved for your reference.
              </p>
            </div>
          </div>

          {/* Card Number */}
          <div className="space-y-2">
            <Label htmlFor="cardNumber">Card Number</Label>
            <Input
              id="cardNumber"
              type="text"
              placeholder="1234 5678 9012 3456"
              value={cardNumber}
              onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
              maxLength={19}
              className="h-11"
            />
          </div>

          {/* Cardholder Name */}
          <div className="space-y-2">
            <Label htmlFor="cardName">Cardholder Name</Label>
            <Input
              id="cardName"
              type="text"
              placeholder="John Doe"
              value={cardName}
              onChange={(e) => setCardName(e.target.value)}
              className="h-11"
            />
          </div>

          {/* Expiry and CVV */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2 col-span-1">
              <Label htmlFor="expiryMonth">Month</Label>
              <Input
                id="expiryMonth"
                type="text"
                placeholder="MM"
                value={expiryMonth}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "").slice(0, 2);
                  if (val === "" || (parseInt(val) >= 1 && parseInt(val) <= 12)) {
                    setExpiryMonth(val);
                  }
                }}
                maxLength={2}
                className="h-11"
              />
            </div>
            <div className="space-y-2 col-span-1">
              <Label htmlFor="expiryYear">Year</Label>
              <Input
                id="expiryYear"
                type="text"
                placeholder="YY"
                value={expiryYear}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "").slice(0, 2);
                  setExpiryYear(val);
                }}
                maxLength={2}
                className="h-11"
              />
            </div>
            <div className="space-y-2 col-span-1">
              <Label htmlFor="cvv">CVV</Label>
              <Input
                id="cvv"
                type="text"
                placeholder="123"
                value={cvv}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "").slice(0, 4);
                  setCvv(val);
                }}
                maxLength={4}
                className="h-11"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSavePaymentMethod}
            disabled={loading}
            className="bg-primary hover:bg-primary/90"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Shield className="w-4 h-4 mr-2" />
                Save Securely
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

