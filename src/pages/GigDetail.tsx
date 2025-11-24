import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Star, Clock, TrendingUp, ArrowLeft, Check, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import PaystackPayment from "@/components/PaystackPayment";

interface Gig {
  id: string;
  title: string;
  slug: string;
  description: string;
  category_id: string;
  basic_package_price: number;
  standard_package_price: number;
  premium_package_price: number;
  basic_package_features: string[];
  standard_package_features: string[];
  premium_package_features: string[];
  basic_package_delivery_days: number | null;
  standard_package_delivery_days: number | null;
  premium_package_delivery_days: number | null;
  images: string[];
  tags: string[];
  views_count: number;
  orders_count: number;
  average_rating: number;
  created_at: string;
  freelancer_id: string;
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

export default function GigDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [gig, setGig] = useState<Gig | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPackage, setSelectedPackage] = useState<"basic" | "standard" | "premium" | null>(null);
  const [showOrderDialog, setShowOrderDialog] = useState(false);
  const [orderRequirements, setOrderRequirements] = useState("");
  const [creatingOrder, setCreatingOrder] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<{ id: string; order_number: string; price: number } | null>(null);

  useEffect(() => {
    if (slug) {
      fetchGigDetails();
    }
  }, [slug]);

  const fetchGigDetails = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("gigs")
        .select(`
          *,
          profiles:freelancer_id (
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
        .eq("status", "active")
        .single();

      if (error) throw error;

      if (data) {
        // Transform the data
        const transformedGig = {
          ...data,
          profiles: Array.isArray(data.profiles) ? data.profiles[0] : data.profiles,
          categories: Array.isArray(data.categories) ? data.categories[0] : data.categories,
        };
        setGig(transformedGig);

        // Increment views count
        await supabase
          .from("gigs")
          .update({ views_count: (data.views_count || 0) + 1 })
          .eq("id", data.id);
      }
    } catch (error: any) {
      console.error("Error fetching gig details:", error);
      toast.error("Failed to load gig details: " + error.message);
      navigate("/browse");
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number | null) => {
    if (!price) return "Price on request";
    return `₦${price.toLocaleString()}`;
  };

  const handleOrder = () => {
    if (!user) {
      toast.error("Please sign in to place an order");
      navigate("/auth");
      return;
    }

    if (!selectedPackage) {
      toast.error("Please select a package");
      return;
    }

    // Check if user is trying to order their own gig
    if (user.id === gig?.freelancer_id) {
      toast.error("You cannot order your own service");
      return;
    }

    setShowOrderDialog(true);
  };

  const createOrder = async () => {
    if (!user || !gig || !selectedPackage) {
      toast.error("Missing required information");
      return;
    }

    setCreatingOrder(true);

    try {
      const selectedPkg = packages.find((p) => p.value === selectedPackage);
      if (!selectedPkg || !selectedPkg.price) {
        toast.error("Invalid package selected");
        setCreatingOrder(false);
        return;
      }

      const price = selectedPkg.price;
      const commissionRate = 0.20; // 20% commission
      const commissionAmount = price * commissionRate;
      const freelancerEarnings = price - commissionAmount;

      // Calculate delivery date
      let deliveryDate: string | null = null;
      if (selectedPkg.deliveryDays) {
        const date = new Date();
        date.setDate(date.getDate() + selectedPkg.deliveryDays);
        deliveryDate = date.toISOString();
      }

      // Check if orders table exists by attempting a simple query first
      const { error: tableCheckError } = await supabase
        .from("orders")
        .select("id")
        .limit(1);

      if (tableCheckError && tableCheckError.code === "PGRST205") {
        toast.error("Orders table not found. Please run the database migration first.");
        console.error("Orders table missing. Run migration: supabase/migrations/20251124000005_create_orders_and_payments.sql");
        setCreatingOrder(false);
        return;
      }

      // Create order
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          client_id: user.id,
          freelancer_id: gig.freelancer_id,
          gig_id: gig.id,
          package_type: selectedPackage,
          price: price,
          currency: "NGN",
          status: "pending",
          requirements: orderRequirements || null,
          delivery_date: deliveryDate,
          commission_rate: commissionRate,
          commission_amount: commissionAmount,
          freelancer_earnings: freelancerEarnings,
        })
        .select("id, order_number, price")
        .single();

      if (orderError) {
        console.error("Order creation error:", orderError);
        if (orderError.code === "PGRST205") {
          toast.error("Orders table not found. Please run the database migration.");
        } else if (orderError.code === "23503") {
          toast.error("Invalid user or gig. Please refresh the page.");
        } else if (orderError.code === "23505") {
          toast.error("Order already exists. Please refresh the page.");
        } else {
          toast.error("Failed to create order: " + (orderError.message || "Unknown error"));
        }
        setCreatingOrder(false);
        return;
      }

      if (order) {
        setCreatedOrder(order);
        // Update gig orders count (non-blocking)
        supabase
          .from("gigs")
          .update({ orders_count: (gig.orders_count || 0) + 1 })
          .eq("id", gig.id)
          .then(({ error }) => {
            if (error) {
              console.warn("Failed to update gig orders count:", error);
            }
          });

        // Log order creation
        try {
          await supabase.from("audit_logs").insert([{
            user_id: user.id,
            action: "order_create",
            table_name: "orders",
            record_id: order.id,
            new_data: {
              order_number: order.order_number,
              gig_id: gig.id,
              package_type: selectedPackage,
              price: price,
              status: "pending",
            },
          }]);
        } catch (logError) {
          console.error("Error logging order creation:", logError);
        }

        toast.success("Order created successfully!");
      } else {
        toast.error("Order created but no data returned");
        setCreatingOrder(false);
      }
    } catch (error: any) {
      console.error("Unexpected error creating order:", error);
      toast.error("Failed to create order: " + (error.message || "Unexpected error occurred"));
      setCreatingOrder(false);
    }
  };

  const handlePaymentSuccess = async (reference: string) => {
    if (!createdOrder) return;

    try {
      // Create payment record
      const { error: paymentError } = await supabase
        .from("payments")
        .insert({
          order_id: createdOrder.id,
          amount: createdOrder.price,
          currency: "NGN",
          payment_gateway: "paystack",
          gateway_reference: reference,
          status: "completed",
          commission_amount: createdOrder.price * 0.20,
          freelancer_payout_amount: createdOrder.price * 0.80,
          paid_at: new Date().toISOString(),
        });

      if (paymentError) throw paymentError;

      // Update order status
      const { error: updateError } = await supabase
        .from("orders")
        .update({ status: "in_progress" })
        .eq("id", createdOrder.id);

      if (updateError) throw updateError;

      // Log payment and order status change
      try {
        await supabase.from("audit_logs").insert([
          {
            user_id: user.id,
            action: "payment_completed",
            table_name: "payments",
            record_id: createdOrder.id,
            new_data: {
              gateway_reference: reference,
              amount: createdOrder.price,
              status: "completed",
            },
          },
          {
            user_id: user.id,
            action: "order_status_change",
            table_name: "orders",
            record_id: createdOrder.id,
            old_data: { status: "pending" },
            new_data: { status: "in_progress" },
          },
        ]);
      } catch (logError) {
        console.error("Error logging payment:", logError);
      }

      toast.success("Payment successful! Your order is now in progress.");
      setShowOrderDialog(false);
      setCreatedOrder(null);
      setOrderRequirements("");
      navigate(`/order/${createdOrder.id}`);
    } catch (error: any) {
      console.error("Error processing payment:", error);
      toast.error("Payment recorded but failed to update order. Please contact support.");
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-slate-700"></div>
          <p className="mt-4 text-gray-600">Loading gig details...</p>
        </div>
      </div>
    );
  }

  if (!gig) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-xl text-gray-600 mb-4">Gig not found</p>
            <Button asChild>
              <Link to="/browse">Browse Services</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const packages = [
    {
      name: "Basic",
      price: gig.basic_package_price,
      features: gig.basic_package_features || [],
      deliveryDays: gig.basic_package_delivery_days,
      value: "basic" as const,
    },
    {
      name: "Standard",
      price: gig.standard_package_price,
      features: gig.standard_package_features || [],
      deliveryDays: gig.standard_package_delivery_days,
      value: "standard" as const,
    },
    {
      name: "Premium",
      price: gig.premium_package_price,
      features: gig.premium_package_features || [],
      deliveryDays: gig.premium_package_delivery_days,
      value: "premium" as const,
    },
  ].filter((pkg) => pkg.price !== null && pkg.price !== undefined);

  return (
    <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
      <Button
        variant="ghost"
        onClick={() => navigate("/browse")}
        className="mb-4 sm:mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Browse
      </Button>

      <div className="grid lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Images */}
          {gig.images && gig.images.length > 0 && (
            <Card>
              <CardContent className="p-0">
                <div className="aspect-video w-full overflow-hidden rounded-t-lg bg-gray-100">
                  <img
                    src={gig.images[0]}
                    alt={gig.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Title and Meta */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <CardTitle className="text-xl sm:text-2xl md:text-3xl mb-2">{gig.title}</CardTitle>
                  <div className="flex items-center gap-3 flex-wrap">
                    {gig.categories && (
                      <Badge variant="secondary">{gig.categories.name}</Badge>
                    )}
                    {gig.average_rating > 0 && (
                      <div className="flex items-center gap-1 text-yellow-600">
                        <Star className="w-5 h-5 fill-current" />
                        <span className="font-medium">{gig.average_rating.toFixed(1)}</span>
                      </div>
                    )}
                    {gig.orders_count > 0 && (
                      <div className="flex items-center gap-1 text-gray-600">
                        <TrendingUp className="w-4 h-4" />
                        <span>{gig.orders_count} orders</span>
                      </div>
                    )}
                    {gig.views_count > 0 && (
                      <div className="flex items-center gap-1 text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span>{gig.views_count} views</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <p className="text-gray-700 whitespace-pre-line">{gig.description}</p>
              </div>

              {/* Tags */}
              {gig.tags && gig.tags.length > 0 && (
                <div className="mt-6 flex flex-wrap gap-2">
                  {gig.tags.map((tag, index) => (
                    <Badge key={index} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Packages */}
          <Card>
            <CardHeader>
              <CardTitle>Packages</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                {packages.map((pkg) => (
                  <Card
                    key={pkg.value}
                    className={`cursor-pointer transition-all ${
                      selectedPackage === pkg.value
                        ? "border-slate-700 border-2"
                        : "hover:border-slate-300"
                    }`}
                    onClick={() => setSelectedPackage(pkg.value)}
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between mb-2">
                        <CardTitle className="text-lg">{pkg.name}</CardTitle>
                        {selectedPackage === pkg.value && (
                          <Check className="w-5 h-5 text-slate-700" />
                        )}
                      </div>
                      <div className="text-lg sm:text-xl md:text-2xl font-bold text-slate-700">
                        {formatPrice(pkg.price)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      {pkg.deliveryDays && (
                        <p className="text-xs text-gray-500 mb-2">
                          Delivery: {pkg.deliveryDays} day{pkg.deliveryDays !== 1 ? "s" : ""}
                        </p>
                      )}
                      {pkg.features.length > 0 ? (
                        <ul className="text-xs text-gray-600 space-y-1">
                          {pkg.features.slice(0, 3).map((feature, idx) => (
                            <li key={idx} className="flex items-start gap-1">
                              <Check className="w-3 h-3 text-slate-700 mt-0.5 flex-shrink-0" />
                              <span>{feature}</span>
                            </li>
                          ))}
                          {pkg.features.length > 3 && (
                            <li className="text-gray-500">+{pkg.features.length - 3} more</li>
                          )}
                        </ul>
                      ) : (
                        <p className="text-sm text-gray-600">No features listed</p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Order Card */}
          <Card>
            <CardHeader>
              <CardTitle>Order Now</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedPackage ? (
                <>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Selected Package:</span>
                    <span className="text-slate-700 font-bold">
                      {packages.find((p) => p.value === selectedPackage)?.name}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-base sm:text-lg">
                    <span className="font-medium">Total:</span>
                    <span className="text-slate-700 font-bold">
                      {formatPrice(
                        packages.find((p) => p.value === selectedPackage)?.price || null
                      )}
                    </span>
                  </div>
                  {user?.id === gig.freelancer_id ? (
                    <p className="text-sm text-gray-500 text-center">
                      You cannot order your own service
                    </p>
                  ) : (
                    <Button className="w-full" size="lg" onClick={handleOrder}>
                      Place Order
                    </Button>
                  )}
                </>
              ) : (
                <p className="text-sm text-gray-600 text-center">
                  Select a package to continue
                </p>
              )}
            </CardContent>
          </Card>

          {/* Freelancer Card */}
          <Card>
            <CardHeader>
              <CardTitle>About the Freelancer</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={gig.profiles?.avatar_url} />
                  <AvatarFallback>
                    {gig.profiles?.full_name?.[0]?.toUpperCase() || "F"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-lg">{gig.profiles?.full_name}</p>
                  {gig.average_rating > 0 && (
                    <div className="flex items-center gap-1 text-yellow-600">
                      <Star className="w-4 h-4 fill-current" />
                      <span>{gig.average_rating.toFixed(1)}</span>
                    </div>
                  )}
                </div>
              </div>
              {gig.profiles?.bio && (
                <p className="text-sm text-gray-600 mb-4">{gig.profiles.bio}</p>
              )}
              <Button variant="outline" className="w-full" asChild>
                <Link to={`/messages?user=${gig.freelancer_id}`}>
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Contact Freelancer
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Order Dialog */}
      {showOrderDialog && (
        <Dialog open={showOrderDialog} onOpenChange={setShowOrderDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Place Your Order</DialogTitle>
            <DialogDescription>
              Review your order details and complete payment
            </DialogDescription>
          </DialogHeader>

          {!createdOrder ? (
            <div className="space-y-6">
              {/* Order Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Service:</span>
                    <span className="font-medium">{gig.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Package:</span>
                    <span className="font-medium">
                      {packages.find((p) => p.value === selectedPackage)?.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Freelancer:</span>
                    <span className="font-medium">{gig.profiles?.full_name}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-2 border-t">
                    <span>Total:</span>
                    <span className="text-slate-700">
                      {formatPrice(
                        packages.find((p) => p.value === selectedPackage)?.price || null
                      )}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Requirements */}
              <div className="space-y-2">
                <Label htmlFor="requirements">Project Requirements (Optional)</Label>
                <Textarea
                  id="requirements"
                  placeholder="Describe your project requirements, deadlines, or any specific details..."
                  value={orderRequirements}
                  onChange={(e) => setOrderRequirements(e.target.value)}
                  rows={4}
                  maxLength={1000}
                />
                <p className="text-xs text-gray-500">
                  {orderRequirements.length}/1000 characters
                </p>
              </div>

              {/* Create Order Button */}
              <Button
                onClick={createOrder}
                disabled={creatingOrder}
                className="w-full"
                size="lg"
              >
                {creatingOrder ? "Creating Order..." : "Create Order & Proceed to Payment"}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-green-700 mb-2">
                  <Check className="w-5 h-5" />
                  <span className="font-semibold">Order Created Successfully!</span>
                </div>
                <p className="text-sm text-green-600">
                  Order Number: <span className="font-mono font-bold">{createdOrder.order_number}</span>
                </p>
              </div>

              {/* Payment Component */}
              <PaystackPayment
                amount={createdOrder.price}
                email={user.email || ""}
                orderId={createdOrder.id}
                orderNumber={createdOrder.order_number}
                onSuccess={handlePaymentSuccess}
                onPaymentInitiated={() => {
                  // Close the dialog when Paystack popup opens
                  setShowOrderDialog(false);
                }}
                onCancel={() => {
                  setShowOrderDialog(false);
                  navigate(`/order/${createdOrder.id}`);
                }}
              />
            </div>
          )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

