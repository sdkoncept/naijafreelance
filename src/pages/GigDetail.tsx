import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, Clock, TrendingUp, ArrowLeft, Check, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";

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

    // TODO: Implement order creation
    toast.success("Order functionality coming soon!");
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
    <div className="container mx-auto px-4 py-8">
      <Button
        variant="ghost"
        onClick={() => navigate("/browse")}
        className="mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Browse
      </Button>

      <div className="grid lg:grid-cols-3 gap-8">
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
                  <CardTitle className="text-3xl mb-2">{gig.title}</CardTitle>
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
                      <div className="text-2xl font-bold text-slate-700">
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
                  <div className="flex justify-between items-center text-lg">
                    <span className="font-medium">Total:</span>
                    <span className="text-slate-700 font-bold">
                      {formatPrice(
                        packages.find((p) => p.value === selectedPackage)?.price || null
                      )}
                    </span>
                  </div>
                  <Button className="w-full" size="lg" onClick={handleOrder}>
                    Place Order
                  </Button>
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
    </div>
  );
}

