import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Search, Package, Calendar, DollarSign } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

interface Order {
  id: string;
  order_number: string;
  gig_id: string;
  freelancer_id: string;
  price: number;
  currency: string;
  status: string;
  created_at: string;
  delivery_date: string;
  gigs: {
    title: string;
    slug: string;
  };
  profiles: {
    full_name: string;
  };
}

export default function ClientOrders() {
  const { user, profile, userRole } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }

    const isClient = profile?.user_type === "client";
    const isAdmin = userRole === "admin";

    if (!isClient && !isAdmin) {
      toast.error("This page is for clients only");
      navigate("/");
      return;
    }

    fetchOrders();
  }, [user, profile, userRole, navigate]);

  useEffect(() => {
    filterOrders();
  }, [searchTerm, statusFilter, orders]);

  const fetchOrders = async () => {
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
          profiles:freelancer_id (
            full_name
          )
        `)
        .eq("client_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const transformedOrders = (data || []).map((order: any) => ({
        ...order,
        gigs: Array.isArray(order.gigs) ? order.gigs[0] : order.gigs,
        profiles: Array.isArray(order.profiles) ? order.profiles[0] : order.profiles,
      }));

      setOrders(transformedOrders);
      setFilteredOrders(transformedOrders);
    } catch (error: any) {
      console.error("Error fetching orders:", error);
      // If orders table doesn't exist, just show empty state
      if (error.code !== "PGRST205") {
        toast.error("Failed to load orders");
      }
      setOrders([]);
      setFilteredOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = [...orders];

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (order) =>
          order.order_number.toLowerCase().includes(searchLower) ||
          order.gigs?.title?.toLowerCase().includes(searchLower) ||
          order.profiles?.full_name?.toLowerCase().includes(searchLower)
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((order) => order.status === statusFilter);
    }

    setFilteredOrders(filtered);
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

    return (
      <Badge variant={variants[status] || "outline"}>
        {status.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-slate-700"></div>
          <p className="mt-4 text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">My Orders</h1>
        <p className="text-gray-600">Track and manage your orders</p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-4 flex-col md:flex-row">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type="text"
            placeholder="Search by order number, gig title, or freelancer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No orders yet</h3>
            <p className="text-gray-600 mb-4">
              {orders.length === 0
                ? "Start browsing services to place your first order"
                : "No orders match your filters"}
            </p>
            {orders.length === 0 && (
              <Button asChild>
                <Link to="/browse">Browse Services</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <Card key={order.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-lg font-semibold">
                        {order.gigs?.title || "Unknown Service"}
                      </h3>
                      {getStatusBadge(order.status)}
                    </div>
                    <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
                      <div>
                        <p className="font-medium text-gray-900 mb-1">Order Details</p>
                        <p>Order #: {order.order_number}</p>
                        <p className="flex items-center gap-1 mt-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(order.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 mb-1">Freelancer</p>
                        <p>{order.profiles?.full_name || "Unknown"}</p>
                        <p className="flex items-center gap-1 mt-1 text-slate-700 font-medium">
                          <DollarSign className="h-4 w-4" />
                          {order.currency} {order.price.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button asChild variant="outline" size="sm">
                      <Link to={`/order/${order.id}`}>View Details</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

