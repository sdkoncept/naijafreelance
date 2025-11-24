import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Calendar, DollarSign, Package, User, FileText, CheckCircle, Clock, XCircle } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import PaystackPayment from "@/components/PaystackPayment";

interface Order {
  id: string;
  order_number: string;
  client_id: string;
  freelancer_id: string;
  gig_id: string;
  package_type: string;
  price: number;
  currency: string;
  status: string;
  requirements: string | null;
  delivery_date: string | null;
  created_at: string;
  gigs: {
    title: string;
    slug: string;
  };
  freelancer: {
    full_name: string;
    avatar_url?: string;
  };
  client: {
    full_name: string;
    avatar_url?: string;
  };
  payment?: {
    status: string;
    gateway_reference: string | null;
    paid_at: string | null;
  };
}

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchOrderDetails();
    }
  }, [id]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          gigs:gig_id (
            title,
            slug
          ),
          freelancer:freelancer_id (
            full_name,
            avatar_url
          ),
          client:client_id (
            full_name,
            avatar_url
          ),
          payment:payments (
            status,
            gateway_reference,
            paid_at
          )
        `)
        .eq("id", id)
        .single();

      if (error) throw error;

      if (data) {
        const transformedOrder = {
          ...data,
          gigs: Array.isArray(data.gigs) ? data.gigs[0] : data.gigs,
          freelancer: Array.isArray(data.freelancer) ? data.freelancer[0] : data.freelancer,
          client: Array.isArray(data.client) ? data.client[0] : data.client,
          payment: Array.isArray(data.payment) ? data.payment[0] : data.payment,
        };
        setOrder(transformedOrder);
      }
    } catch (error: any) {
      console.error("Error fetching order details:", error);
      toast.error("Failed to load order details: " + error.message);
      navigate("/client/orders");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
      pending: "outline",
      in_progress: "default",
      delivered: "secondary",
      completed: "default",
      cancelled: "destructive",
      disputed: "destructive",
    };

    const icons: Record<string, any> = {
      pending: Clock,
      in_progress: Clock,
      delivered: Package,
      completed: CheckCircle,
      cancelled: XCircle,
      disputed: XCircle,
    };

    const Icon = icons[status] || Clock;

    return (
      <Badge variant={variants[status] || "outline"} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {status.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
      </Badge>
    );
  };

  const handlePaymentSuccess = async (reference: string) => {
    if (!order) return;

    try {
      // Create payment record
      const { error: paymentError } = await supabase
        .from("payments")
        .insert({
          order_id: order.id,
          amount: order.price,
          currency: order.currency,
          payment_gateway: "paystack",
          gateway_reference: reference,
          status: "completed",
          commission_amount: order.price * 0.20,
          freelancer_payout_amount: order.price * 0.80,
          paid_at: new Date().toISOString(),
        });

      if (paymentError) throw paymentError;

      // Update order status
      const { error: updateError } = await supabase
        .from("orders")
        .update({ status: "in_progress" })
        .eq("id", order.id);

      if (updateError) throw updateError;

      // Log payment and order status change
      try {
        await supabase.from("audit_logs").insert([
          {
            user_id: user?.id,
            action: "payment_completed",
            table_name: "payments",
            record_id: order.id,
            new_data: {
              gateway_reference: reference,
              amount: order.price,
              status: "completed",
            },
          },
          {
            user_id: user?.id,
            action: "order_status_change",
            table_name: "orders",
            record_id: order.id,
            old_data: { status: order.status },
            new_data: { status: "in_progress" },
          },
        ]);
      } catch (logError) {
        console.error("Error logging payment:", logError);
      }

      toast.success("Payment successful! Your order is now in progress.");
      fetchOrderDetails(); // Refresh order data
    } catch (error: any) {
      console.error("Error processing payment:", error);
      toast.error("Payment recorded but failed to update order. Please contact support.");
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-slate-700"></div>
          <p className="mt-4 text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-xl text-gray-600 mb-4">Order not found</p>
            <Button asChild>
              <Link to="/client/orders">Back to Orders</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isClient = user?.id === order.client_id;
  const isFreelancer = user?.id === order.freelancer_id;
  const needsPayment = order.status === "pending" && !order.payment && isClient;

  return (
    <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 max-w-4xl">
      <Button
        variant="ghost"
        onClick={() => navigate(isClient ? "/client/orders" : "/freelancer/dashboard")}
        className="mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>

      <div className="space-y-6">
        {/* Order Header */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div>
                <CardTitle className="text-2xl sm:text-3xl mb-2">
                  {order.gigs?.title || "Order Details"}
                </CardTitle>
                <div className="flex items-center gap-3 flex-wrap">
                  <Badge variant="outline" className="font-mono">
                    {order.order_number}
                  </Badge>
                  {getStatusBadge(order.status)}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-500 mb-1">Order Date</p>
                <p className="font-medium flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {new Date(order.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
              {order.delivery_date && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Expected Delivery</p>
                  <p className="font-medium flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {new Date(order.delivery_date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-500 mb-1">Package</p>
                <p className="font-medium flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  {order.package_type.charAt(0).toUpperCase() + order.package_type.slice(1)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Amount</p>
                <p className="font-medium flex items-center gap-2 text-lg">
                  <DollarSign className="w-4 h-4" />
                  {order.currency} {order.price.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Status */}
        {order.payment ? (
          <Card>
            <CardHeader>
              <CardTitle>Payment Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">
                    {order.payment.status === "completed" ? "Paid" : "Payment Pending"}
                  </p>
                  {order.payment.gateway_reference && (
                    <p className="text-sm text-gray-500 mt-1">
                      Reference: <span className="font-mono">{order.payment.gateway_reference}</span>
                    </p>
                  )}
                  {order.payment.paid_at && (
                    <p className="text-sm text-gray-500 mt-1">
                      Paid on: {new Date(order.payment.paid_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <Badge variant={order.payment.status === "completed" ? "default" : "outline"}>
                  {order.payment.status}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ) : needsPayment ? (
          <PaystackPayment
            amount={order.price}
            email={user?.email || ""}
            orderId={order.id}
            orderNumber={order.order_number}
            onSuccess={handlePaymentSuccess}
          />
        ) : null}

        {/* Requirements */}
        {order.requirements && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Project Requirements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 whitespace-pre-line">{order.requirements}</p>
            </CardContent>
          </Card>
        )}

        {/* Freelancer/Client Info */}
        <div className="grid md:grid-cols-2 gap-6">
          {isClient && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Freelancer
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={order.freelancer?.avatar_url} />
                    <AvatarFallback>
                      {order.freelancer?.full_name?.[0]?.toUpperCase() || "F"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{order.freelancer?.full_name}</p>
                    <Button variant="outline" size="sm" className="mt-2" asChild>
                      <Link to={`/messages?user=${order.freelancer_id}`}>
                        Message Freelancer
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {isFreelancer && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Client
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={order.client?.avatar_url} />
                    <AvatarFallback>
                      {order.client?.full_name?.[0]?.toUpperCase() || "C"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{order.client?.full_name}</p>
                    <Button variant="outline" size="sm" className="mt-2" asChild>
                      <Link to={`/messages?user=${order.client_id}`}>
                        Message Client
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Actions */}
        {isFreelancer && order.status === "in_progress" && (
          <Card>
            <CardHeader>
              <CardTitle>Order Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full sm:w-auto">
                Mark as Delivered
              </Button>
            </CardContent>
          </Card>
        )}

        {isClient && order.status === "delivered" && (
          <Card>
            <CardHeader>
              <CardTitle>Order Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 flex-wrap">
                <Button className="flex-1 sm:flex-none">
                  Accept & Complete
                </Button>
                <Button variant="outline" className="flex-1 sm:flex-none">
                  Request Revision
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

