import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Search, Package, Calendar, DollarSign, MessageSquare, ShoppingBag, Briefcase } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";

interface Order {
  id: string;
  order_number: string;
  gig_id: string;
  client_id: string;
  freelancer_id: string;
  price: number;
  currency: string;
  status: string;
  package_type: string;
  created_at: string;
  delivery_date: string | null;
  userRole?: "client" | "freelancer";
  gigs: {
    title: string;
    slug: string;
  };
  client?: {
    full_name: string;
    avatar_url?: string;
  };
  freelancer?: {
    full_name: string;
    avatar_url?: string;
  };
  payment?: {
    status: string;
  };
}

export default function MyGigs() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [roleFilter, setRoleFilter] = useState<string>("all"); // "all", "client", "freelancer"

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    fetchOrders();
  }, [user, navigate]);

  useEffect(() => {
    filterOrders();
  }, [searchTerm, statusFilter, roleFilter, orders]);

  const fetchOrders = async () => {
    try {
      if (!user?.id) return;

      // Fetch orders where user is client
      const { data: clientOrders, error: clientError } = await supabase
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
          payment:payments (
            status
          )
        `)
        .eq("client_id", user.id)
        .order("created_at", { ascending: false });

      if (clientError && clientError.code !== "PGRST205") throw clientError;

      // Fetch orders where user is freelancer
      const { data: freelancerOrders, error: freelancerError } = await supabase
        .from("orders")
        .select(`
          *,
          gigs:gig_id (
            title,
            slug
          ),
          client:client_id (
            full_name,
            avatar_url
          ),
          payment:payments (
            status
          )
        `)
        .eq("freelancer_id", user.id)
        .order("created_at", { ascending: false });

      if (freelancerError && freelancerError.code !== "PGRST205") throw freelancerError;

      // Combine and transform orders
      const allOrders = [
        ...(clientOrders || []).map((order: any) => ({
          ...order,
          gigs: Array.isArray(order.gigs) ? order.gigs[0] : order.gigs,
          freelancer: Array.isArray(order.freelancer) ? order.freelancer[0] : order.freelancer,
          payment: Array.isArray(order.payment) ? order.payment[0] : order.payment,
          userRole: "client" as const,
        })),
        ...(freelancerOrders || []).map((order: any) => ({
          ...order,
          gigs: Array.isArray(order.gigs) ? order.gigs[0] : order.gigs,
          client: Array.isArray(order.client) ? order.client[0] : order.client,
          payment: Array.isArray(order.payment) ? order.payment[0] : order.payment,
          userRole: "freelancer" as const,
        })),
      ];

      setOrders(allOrders as Order[]);
      setFilteredOrders(allOrders as Order[]);
    } catch (error: any) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to load orders: " + error.message);
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
          (order.userRole === "client" && order.freelancer?.full_name?.toLowerCase().includes(searchLower)) ||
          (order.userRole === "freelancer" && order.client?.full_name?.toLowerCase().includes(searchLower))
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((order) => order.status === statusFilter);
    }

    if (roleFilter !== "all") {
      filtered = filtered.filter((order) => order.userRole === roleFilter);
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
          <p className="mt-4 text-gray-600">Loading your gigs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">My Gigs</h1>
        <p className="text-gray-600">View all your orders - both as a client and freelancer</p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-4 flex-col md:flex-row">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type="text"
            placeholder="Search by order number, gig title, or person..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="client">As Client</SelectItem>
            <SelectItem value="freelancer">As Freelancer</SelectItem>
          </SelectContent>
        </Select>
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
            <h3 className="text-lg font-semibold mb-2">No gigs yet</h3>
            <p className="text-gray-600 mb-4">
              {orders.length === 0
                ? "Start browsing services or create gigs to get started"
                : "No gigs match your filters"}
            </p>
            {orders.length === 0 && (
              <div className="flex gap-4 justify-center">
                <Button asChild>
                  <Link to="/browse">Browse Services</Link>
                </Button>
                {profile?.user_type === "freelancer" && (
                  <Button asChild variant="outline">
                    <Link to="/freelancer/gigs/create">Create Gig</Link>
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const isClient = order.userRole === "client";
            const otherParty = isClient ? order.freelancer : order.client;
            const otherPartyId = isClient ? order.freelancer_id : order.client_id;

            return (
              <Card key={order.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between flex-wrap gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3 flex-wrap">
                        <div className="flex items-center gap-2">
                          {isClient ? (
                            <ShoppingBag className="h-5 w-5 text-blue-500" />
                          ) : (
                            <Briefcase className="h-5 w-5 text-green-500" />
                          )}
                          <h3 className="text-lg font-semibold">
                            {order.gigs?.title || "Unknown Service"}
                          </h3>
                        </div>
                        {getStatusBadge(order.status)}
                        <Badge variant="outline" className="text-xs">
                          {isClient ? "As Client" : "As Freelancer"}
                        </Badge>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
                        <div>
                          <p className="font-medium text-gray-900 mb-1">Order Details</p>
                          <p>Order #: {order.order_number}</p>
                          <p className="flex items-center gap-1 mt-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(order.created_at).toLocaleDateString()}
                          </p>
                          {order.delivery_date && (
                            <p className="flex items-center gap-1 mt-1">
                              <Calendar className="h-4 w-4" />
                              Delivery: {new Date(order.delivery_date).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 mb-1">
                            {isClient ? "Freelancer" : "Client"}
                          </p>
                          <div className="flex items-center gap-2">
                            <Avatar className="w-6 h-6">
                              <AvatarImage src={otherParty?.avatar_url} />
                              <AvatarFallback>
                                {otherParty?.full_name?.[0]?.toUpperCase() || "U"}
                              </AvatarFallback>
                            </Avatar>
                            <p>{otherParty?.full_name || "Unknown"}</p>
                          </div>
                          <p className="flex items-center gap-1 mt-1 text-slate-700 font-medium">
                            <DollarSign className="h-4 w-4" />
                            {order.currency} {order.price.toLocaleString()}
                          </p>
                          {order.payment && (
                            <p className="text-xs mt-1">
                              Payment: {order.payment.status}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-col sm:flex-row">
                      <Button asChild variant="outline" size="sm">
                        <Link to={`/order/${order.id}`}>View Details</Link>
                      </Button>
                      <Button
                        asChild
                        variant="default"
                        size="sm"
                      >
                        <Link to={`/messages?user=${otherPartyId}`}>
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Message
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}


