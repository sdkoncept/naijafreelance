import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CreditCard, CheckCircle, Shield, Lock, Info, CheckCircle2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { loadPaystackScript, initializePaystack, nairaToKobo } from "@/lib/paystack";
import { toast } from "sonner";

interface PaystackPaymentProps {
  amount: number; // in Naira
  email: string;
  orderId: string;
  orderNumber: string;
  onSuccess: (reference: string) => void;
  onCancel?: () => void;
  onPaymentInitiated?: () => void; // Called when payment popup opens
}

export default function PaystackPayment({
  amount,
  email,
  orderId,
  orderNumber,
  onSuccess,
  onCancel,
  onPaymentInitiated,
}: PaystackPaymentProps) {
  const [loading, setLoading] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get the key - Vite will replace this at build time
  const PAYSTACK_PUBLIC_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || "";

  useEffect(() => {
    // Check if key exists
    const keyToUse = PAYSTACK_PUBLIC_KEY || import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || "";
    
    if (!keyToUse || keyToUse === "") {
      const errorMsg = "Paystack public key not configured. Please add VITE_PAYSTACK_PUBLIC_KEY to your .env file.";
      console.error("❌ Paystack Error:", errorMsg);
      console.error("PAYSTACK_PUBLIC_KEY value:", PAYSTACK_PUBLIC_KEY);
      console.error("Full import.meta.env:", import.meta.env);
      setError(errorMsg);
      return;
    }

    // Validate key format
    if (!keyToUse.startsWith('pk_test_') && !keyToUse.startsWith('pk_live_')) {
      const errorMsg = "Invalid Paystack public key format. Key should start with 'pk_test_' or 'pk_live_'";
      console.error("Paystack Error:", errorMsg);
      console.error("Key value:", keyToUse);
      setError(errorMsg);
      return;
    }

    // Delay script loading slightly to avoid layout shift
    const timer = setTimeout(() => {
      loadPaystackScript()
        .then(() => {
          setScriptLoaded(true);
          console.log("Paystack script loaded successfully");
        })
        .catch((err) => {
          console.error("Error loading Paystack script:", err);
          setError("Failed to load payment gateway. Please check your internet connection and try again.");
        });
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const handlePayment = async () => {
    const keyToUse = PAYSTACK_PUBLIC_KEY || import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || "";
    if (!keyToUse) {
      toast.error("Payment gateway not configured");
      return;
    }

    if (!scriptLoaded) {
      toast.error("Payment gateway is still loading. Please wait...");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Generate unique reference
      const reference = `ORDER-${orderId}-${Date.now()}`;

      // Close dialog/modal before opening Paystack popup
      if (onPaymentInitiated) {
        onPaymentInitiated();
      }

      // Initialize Paystack payment
      const keyToUse = PAYSTACK_PUBLIC_KEY || import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || "";
      initializePaystack({
        publicKey: keyToUse,
        email,
        amount: nairaToKobo(amount),
        reference,
        metadata: {
          order_id: orderId,
          order_number: orderNumber,
          custom_fields: [
            {
              display_name: "Order Number",
              variable_name: "order_number",
              value: orderNumber,
            },
          ],
        },
        callback_url: `${window.location.origin}/payment/callback`,
        onSuccess: (response) => {
          setLoading(false);
          toast.success("Payment successful!");
          onSuccess(response.reference);
        },
        onClose: () => {
          setLoading(false);
          if (onCancel) {
            onCancel();
          }
          toast.info("Payment cancelled");
        },
      });
    } catch (err: any) {
      console.error("Payment error:", err);
      setError(err.message || "Failed to initialize payment");
      setLoading(false);
      toast.error("Failed to initialize payment");
    }
  };

  if (error) {
    console.error("❌ Paystack Error Displayed:", error);
    return (
      <Card>
        <CardContent className="py-6">
          <div className="text-center text-red-600">
            <p className="font-medium">{error}</p>
            <p className="text-sm mt-2 text-gray-600">
              Please contact support if this issue persists
            </p>
            <p className="text-xs mt-4 text-gray-500 font-mono">
              Debug: KEY={PAYSTACK_PUBLIC_KEY ? "FOUND" : "MISSING"} | 
              ENV={import.meta.env.VITE_PAYSTACK_PUBLIC_KEY ? "FOUND" : "MISSING"}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate fees (example: 1.5% + ₦100)
  const platformFee = amount * 0.015; // 1.5% platform fee
  const processingFee = 100; // Fixed processing fee
  const totalFees = platformFee + processingFee;
  const totalAmount = amount + totalFees;

  return (
    <Card className="border-gray-200">
      <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b">
        <CardTitle className="flex items-center gap-2 text-xl">
          <CreditCard className="w-6 h-6 text-primary" />
          Complete Payment
        </CardTitle>
        <CardDescription className="text-base">
          Secure payment powered by Paystack
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 p-6">
        {/* Order Summary */}
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-900">Order Summary</h3>
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Order Number:</span>
              <span className="font-medium text-gray-900">{orderNumber}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Service Amount:</span>
              <span className="font-medium text-gray-900">₦{amount.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Fee Breakdown */}
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-900">Fee Breakdown</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Platform Fee (1.5%):</span>
              <span className="text-gray-900">₦{platformFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Processing Fee:</span>
              <span className="text-gray-900">₦{processingFee.toLocaleString()}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-base font-semibold">
              <span className="text-gray-900">Total Amount:</span>
              <span className="text-primary text-xl">₦{totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Escrow Explanation */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="font-semibold text-blue-900">Payment Protection</h4>
              <p className="text-sm text-blue-800 leading-relaxed">
                Your payment is held securely in escrow until the work is completed and you approve it. 
                This ensures you only pay when you're satisfied with the delivered work.
              </p>
            </div>
          </div>
        </div>

        {/* Security Info */}
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Lock className="w-4 h-4" />
          <span>Secured by Paystack • SSL Encrypted</span>
        </div>

        {/* Payment Button */}
        <Button
          onClick={handlePayment}
          disabled={loading || !scriptLoaded}
          className="w-full bg-primary hover:bg-primary/90 h-12 text-base font-semibold"
          size="lg"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Processing...
            </>
          ) : scriptLoaded ? (
            <>
              <CreditCard className="mr-2 h-5 w-5" />
              Pay ₦{totalAmount.toFixed(2)}
            </>
          ) : (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Loading payment gateway...
            </>
          )}
        </Button>

        <div className="text-xs text-center text-gray-500 space-y-1">
          <p className="flex items-center justify-center gap-1">
            <Info className="w-3 h-3" />
            You will be redirected to complete payment securely
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

