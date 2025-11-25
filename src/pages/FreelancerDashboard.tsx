import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Plus, TrendingUp, DollarSign, Package, Star, Eye, ShoppingBag, MessageSquare, Briefcase, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import EarningsWidget from "@/components/EarningsWidget";

interface Gig {
  id: string;
  title: string;
  slug: string;
  status: string;
  views_count: number;
  orders_count: number;
  average_rating: number;
  basic_package_price: number;
  created_at: string;
}

interface FreelancerStats {
  total_gigs: number;
  active_gigs: number;
  total_orders: number;
  total_earnings: number;
  average_rating: number;
}

export default function FreelancerDashboard() {
  const { user, profile, userRole } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [activeOrders, setActiveOrders] = useState<any[]>([]);
  const [stats, setStats] = useState<FreelancerStats>({
    total_gigs: 0,
    active_gigs: 0,
    total_orders: 0,
    total_earnings: 0,
    average_rating: 0,
  });

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }

    const isFreelancer = profile?.user_type === "freelancer";
    const isAdmin = userRole === "admin";

    if (!isFreelancer && !isAdmin) {
      toast.error("This page is for freelancers only");
      navigate("/");
      return;
    }

    fetchGigs();
    fetchStats();
    fetchActiveOrders();
  }, [user, profile, userRole, navigate]);

  const fetchGigs = async () => {
    try {
      if (!user?.id) return;

      const { data, error } = await supabase
        .from("gigs")
        .select("*")
        .eq("freelancer_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      setGigs(data || []);
    } catch (error: any) {
      console.error("Error fetching gigs:", error);
      toast.error("Failed to load gigs");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      if (!user?.id) return;

      const { data: gigsData, error: gigsError } = await supabase
        .from("gigs")
        .select("id, status, orders_count, average_rating")
        .eq("freelancer_id", user.id);

      if (gigsError) throw gigsError;

      const totalGigs = gigsData?.length || 0;
      const activeGigs = gigsData?.filter((g) => g.status === "active").length || 0;
      const totalOrders = gigsData?.reduce((sum, g) => sum + (g.orders_count || 0), 0) || 0;
      const avgRating =
        gigsData && gigsData.length > 0
          ? gigsData.reduce((sum, g) => sum + (g.average_rating || 0), 0) / gigsData.length
          : 0;

      // Fetch earnings from orders (if orders table exists)
      let totalEarnings = 0;
      try {
        const { data: ordersData } = await supabase
          .from("orders")
          .select("freelancer_earnings")
          .eq("freelancer_id", user.id)
          .eq("status", "completed");

        if (ordersData) {
          totalEarnings = ordersData.reduce((sum, o) => sum + (parseFloat(String(o.freelancer_earnings || 0))), 0);
        }
      } catch (e) {
        // Orders table might not exist yet
        console.log("Orders table not available");
      }

      setStats({
        total_gigs: totalGigs,
        active_gigs: activeGigs,
        total_orders: totalOrders,
        total_earnings: totalEarnings,
        average_rating: avgRating,
      });
    } catch (error: any) {
      console.error("Error fetching stats:", error);
    }
  };

  const fetchActiveOrders = async () => {
    try {
      if (!user?.id) return;

      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          gigs:gig_id (
            title,
            slug
          ),
          profiles:client_id (
            full_name
          )
        `)
        .eq("freelancer_id", user.id)
        .in("status", ["pending", "in_progress", "delivered"])
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) throw error;

      const transformedOrders = (data || []).map((order: any) => ({
        ...order,
        gigs: Array.isArray(order.gigs) ? order.gigs[0] : order.gigs,
        profiles: Array.isArray(order.profiles) ? order.profiles[0] : order.profiles,
      }));

      setActiveOrders(transformedOrders);
    } catch (error: any) {
      // Orders table might not exist
      console.log("Orders not available:", error);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-20">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">Freelancer Dashboard</h1>
          <p className="text-gray-600">Manage your services and track your performance</p>
        </div>
        <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
          <Link to="/freelancer/gigs/create">
            <Plus className="mr-2 h-4 w-4" />
            Create New Gig
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="border-gray-200 hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Gigs</CardTitle>
            <Package className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{stats.total_gigs}</div>
            <p className="text-xs text-gray-500 mt-1">
              {stats.active_gigs} active
            </p>
          </CardContent>
        </Card>

        <Card className="border-gray-200 hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Orders</CardTitle>
            <ShoppingBag className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{stats.total_orders}</div>
            <p className="text-xs text-gray-500 mt-1">All time</p>
          </CardContent>
        </Card>

        <Card className="border-gray-200 hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Earnings</CardTitle>
            <DollarSign className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">₦{stats.total_earnings.toLocaleString()}</div>
            <p className="text-xs text-gray-500 mt-1">Completed orders</p>
          </CardContent>
        </Card>

        <Card className="border-gray-200 hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Average Rating</CardTitle>
            <Star className="h-5 w-5 text-primary fill-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              {stats.average_rating > 0 ? stats.average_rating.toFixed(1) : "0.0"}
            </div>
            <p className="text-xs text-gray-500 mt-1">Based on reviews</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for different sections */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="gigs">My Gigs</TabsTrigger>
          <TabsTrigger value="orders">Active Jobs</TabsTrigger>
          <TabsTrigger value="earnings">Earnings</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Earnings Widget */}
            <div className="lg:col-span-2">
              <EarningsWidget
                totalEarnings={stats.total_earnings}
                pendingBalance={0}
                availableBalance={stats.total_earnings}
              />
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link to="/freelancer/gigs/create">
                    <Plus className="mr-2 h-4 w-4" />
                    Create New Gig
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link to="/jobs">
                    <Briefcase className="mr-2 h-4 w-4" />
                    Browse Jobs
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link to="/messages">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Messages
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link to="/freelancer/earnings">
                    <DollarSign className="mr-2 h-4 w-4" />
                    View Earnings
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Recent Active Orders */}
          {activeOrders.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Active Jobs</CardTitle>
                    <CardDescription>Orders that need your attention</CardDescription>
                  </div>
                  <Button asChild variant="ghost" size="sm">
                    <Link to="/my-gigs">
                      View All
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {activeOrders.map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex-1">
                        <h4 className="font-semibold mb-1">{order.gigs?.title || "Unknown Service"}</h4>
                        <p className="text-sm text-gray-600">
                          Client: {order.profiles?.full_name || "Unknown"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="default">{order.status}</Badge>
                        <Button asChild variant="outline" size="sm">
                          <Link to={`/order/${order.id}`}>View</Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Gigs Tab */}
        <TabsContent value="gigs">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Your Gigs</CardTitle>
                  <CardDescription>Manage your service offerings</CardDescription>
                </div>
                <Button asChild variant="outline" size="sm">
                  <Link to="/browse">View All</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {gigs.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No gigs yet</h3>
                  <p className="text-gray-600 mb-6">Create your first gig to start offering services</p>
                  <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
                    <Link to="/freelancer/gigs/create">Create Your First Gig</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {gigs.map((gig) => (
                    <div
                      key={gig.id}
                      className="flex items-center justify-between p-5 border rounded-lg hover:shadow-md transition-all border-gray-200"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">{gig.title}</h3>
                          <Badge
                            variant={
                              gig.status === "active"
                                ? "default"
                                : gig.status === "paused"
                                ? "secondary"
                                : "outline"
                            }
                          >
                            {gig.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-6 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            {gig.views_count} views
                          </span>
                          <span className="flex items-center gap-1">
                            <ShoppingBag className="h-4 w-4" />
                            {gig.orders_count} orders
                          </span>
                          {gig.average_rating > 0 && (
                            <span className="flex items-center gap-1">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              {gig.average_rating.toFixed(1)}
                            </span>
                          )}
                          {gig.basic_package_price && (
                            <span className="text-gray-900 font-medium">
                              From ₦{gig.basic_package_price.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button asChild variant="outline" size="sm">
                          <Link to={`/gig/${gig.slug}`}>View</Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Active Jobs Tab */}
        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Active Jobs</CardTitle>
                  <CardDescription>Orders that need your attention</CardDescription>
                </div>
                <Button asChild variant="outline" size="sm">
                  <Link to="/my-gigs">View All</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {activeOrders.length === 0 ? (
                <div className="text-center py-12">
                  <Briefcase className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No active jobs</h3>
                  <p className="text-gray-600">You don't have any active orders at the moment</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeOrders.map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between p-5 border rounded-lg hover:shadow-md transition-all border-gray-200"
                    >
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-2">
                          {order.gigs?.title || "Unknown Service"}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Client: {order.profiles?.full_name || "Unknown"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="default">{order.status}</Badge>
                        <Button asChild variant="outline" size="sm">
                          <Link to={`/order/${order.id}`}>View Details</Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Earnings Tab */}
        <TabsContent value="earnings">
          <EarningsWidget
            totalEarnings={stats.total_earnings}
            pendingBalance={0}
            availableBalance={stats.total_earnings}
          />
          <div className="mt-6">
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
              <Link to="/freelancer/earnings">View Full Earnings Report</Link>
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

