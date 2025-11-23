import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, TrendingUp, DollarSign, Package, Star, Eye, ShoppingBag } from "lucide-react";
import { useNavigate } from "react-router-dom";

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

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-slate-700"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2">Freelancer Dashboard</h1>
          <p className="text-gray-600">Manage your services and track your performance</p>
        </div>
        <Button asChild>
          <Link to="/freelancer/gigs/create">
            <Plus className="mr-2 h-4 w-4" />
            Create New Gig
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Gigs</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_gigs}</div>
            <p className="text-xs text-muted-foreground">
              {stats.active_gigs} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_orders}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₦{stats.total_earnings.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Completed orders</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.average_rating > 0 ? stats.average_rating.toFixed(1) : "0.0"}
            </div>
            <p className="text-xs text-muted-foreground">Based on reviews</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Gigs */}
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
              <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No gigs yet</h3>
              <p className="text-gray-600 mb-4">Create your first gig to start offering services</p>
              <Button asChild>
                <Link to="/freelancer/gigs/create">Create Your First Gig</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {gigs.map((gig) => (
                <div
                  key={gig.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold">{gig.title}</h3>
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
                    <div className="flex items-center gap-4 text-sm text-gray-600">
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
                        <span className="text-slate-700 font-medium">
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
    </div>
  );
}

