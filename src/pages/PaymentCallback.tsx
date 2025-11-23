import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function PaymentCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    const reference = searchParams.get("reference");
    const trxref = searchParams.get("trxref");

    if (!reference && !trxref) {
      setStatus("error");
      return;
    }

    verifyPayment(reference || trxref || "");
  }, [searchParams]);

  const verifyPayment = async (reference: string) => {
    try {
      // Extract order ID from reference (format: ORDER-{orderId}-{timestamp})
      const orderIdMatch = reference.match(/ORDER-([^-]+)-/);
      if (!orderIdMatch) {
        setStatus("error");
        toast.error("Invalid payment reference");
        return;
      }

      const extractedOrderId = orderIdMatch[1];
      setOrderId(extractedOrderId);

      // Verify payment with Paystack (you'll need to implement this server-side)
      // For now, we'll check if payment record exists
      const { data: payment, error: paymentError } = await supabase
        .from("payments")
        .select("*, orders!inner(id, status)")
        .eq("gateway_reference", reference)
        .single();

      if (paymentError && paymentError.code !== "PGRST116") {
        throw paymentError;
      }

      if (payment && payment.status === "completed") {
        setStatus("success");
        toast.success("Payment verified successfully!");
        
        // Redirect to order page after 2 seconds
        setTimeout(() => {
          navigate(`/order/${extractedOrderId}`);
        }, 2000);
      } else {
        // Payment not yet recorded, wait a bit and check again
        setTimeout(() => {
          verifyPayment(reference);
        }, 2000);
      }
    } catch (error: any) {
      console.error("Payment verification error:", error);
      setStatus("error");
      toast.error("Failed to verify payment");
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="py-12 text-center">
            <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-slate-700" />
            <p className="text-lg font-medium mb-2">Verifying Payment...</p>
            <p className="text-sm text-gray-600">Please wait while we confirm your payment</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="py-12 text-center">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Payment Successful!</h2>
            <p className="text-gray-600 mb-6">
              Your payment has been confirmed. Redirecting to your order...
            </p>
            {orderId && (
              <Button onClick={() => navigate(`/order/${orderId}`)}>
                View Order
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="py-12 text-center">
          <XCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Payment Verification Failed</h2>
          <p className="text-gray-600 mb-6">
            We couldn't verify your payment. Please contact support if you were charged.
          </p>
          <div className="flex gap-2 justify-center">
            <Button variant="outline" onClick={() => navigate("/client/orders")}>
              View Orders
            </Button>
            <Button onClick={() => navigate("/browse")}>
              Browse Services
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

