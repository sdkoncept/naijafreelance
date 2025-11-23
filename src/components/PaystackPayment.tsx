import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CreditCard, CheckCircle } from "lucide-react";
import { loadPaystackScript, initializePaystack, nairaToKobo } from "@/lib/paystack";
import { toast } from "sonner";

interface PaystackPaymentProps {
  amount: number; // in Naira
  email: string;
  orderId: string;
  orderNumber: string;
  onSuccess: (reference: string) => void;
  onCancel?: () => void;
}

export default function PaystackPayment({
  amount,
  email,
  orderId,
  orderNumber,
  onSuccess,
  onCancel,
}: PaystackPaymentProps) {
  const [loading, setLoading] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const PAYSTACK_PUBLIC_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;

  useEffect(() => {
    if (!PAYSTACK_PUBLIC_KEY) {
      setError("Paystack public key not configured. Please add VITE_PAYSTACK_PUBLIC_KEY to your .env file.");
      return;
    }

    // Delay script loading slightly to avoid layout shift
    const timer = setTimeout(() => {
      loadPaystackScript()
        .then(() => {
          setScriptLoaded(true);
        })
        .catch((err) => {
          console.error("Error loading Paystack script:", err);
          setError("Failed to load payment gateway. Please check your internet connection and try again.");
        });
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const handlePayment = async () => {
    if (!PAYSTACK_PUBLIC_KEY) {
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

      // Initialize Paystack payment
      initializePaystack({
        publicKey: PAYSTACK_PUBLIC_KEY,
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
    return (
      <Card>
        <CardContent className="py-6">
          <div className="text-center text-red-600">
            <p className="font-medium">{error}</p>
            <p className="text-sm mt-2 text-gray-600">
              Please contact support if this issue persists
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Complete Payment
        </CardTitle>
        <CardDescription>
          Secure payment powered by Paystack
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-600">Order Total:</span>
            <span className="text-2xl font-bold text-slate-700">
              ₦{amount.toLocaleString()}
            </span>
          </div>
          <div className="text-sm text-gray-500">
            Order: {orderNumber}
          </div>
        </div>

        <Button
          onClick={handlePayment}
          disabled={loading || !scriptLoaded}
          className="w-full"
          size="lg"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : scriptLoaded ? (
            <>
              <CreditCard className="mr-2 h-4 w-4" />
              Pay ₦{amount.toLocaleString()}
            </>
          ) : (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading payment gateway...
            </>
          )}
        </Button>

        <div className="text-xs text-center text-gray-500">
          <p>Your payment is secured by Paystack</p>
          <p className="mt-1">You will be redirected to complete payment</p>
        </div>
      </CardContent>
    </Card>
  );
}

