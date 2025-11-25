import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Search, Package, Calendar, DollarSign, MessageSquare, Briefcase, Heart, Settings, ArrowRight, Clock, CheckCircle } from "lucide-react";
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
  const [recentMessages, setRecentMessages] = useState<any[]>([]);

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
    fetchRecentMessages();
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

  const fetchRecentMessages = async () => {
    try {
      if (!user?.id) return;

      const { data, error } = await supabase
        .from("messages")
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey (
            full_name,
            avatar_url
          ),
          receiver:profiles!messages_receiver_id_fkey (
            full_name,
            avatar_url
          )
        `)
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) throw error;
      setRecentMessages(data || []);
    } catch (error: any) {
      // Messages table might not exist
      console.log("Messages not available:", error);
    }
  };


  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-amber-100 text-amber-800 border-amber-200",
      in_progress: "bg-blue-100 text-blue-800 border-blue-200",
      delivered: "bg-purple-100 text-purple-800 border-purple-200",
      completed: "bg-green-100 text-green-800 border-green-200",
      cancelled: "bg-red-100 text-red-800 border-red-200",
      disputed: "bg-red-100 text-red-800 border-red-200",
    };
    return colors[status] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === "pending").length,
    inProgress: orders.filter((o) => o.status === "in_progress").length,
    completed: orders.filter((o) => o.status === "completed").length,
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
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold mb-2">Client Dashboard</h1>
        <p className="text-gray-600">Track and manage your projects and orders</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="border-gray-200 hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Orders</CardTitle>
            <Package className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
            <p className="text-xs text-gray-500 mt-1">All time</p>
          </CardContent>
        </Card>

        <Card className="border-gray-200 hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">In Progress</CardTitle>
            <Clock className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{stats.inProgress}</div>
            <p className="text-xs text-gray-500 mt-1">Active projects</p>
          </CardContent>
        </Card>

        <Card className="border-gray-200 hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Pending</CardTitle>
            <Clock className="h-5 w-5 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{stats.pending}</div>
            <p className="text-xs text-gray-500 mt-1">Awaiting action</p>
          </CardContent>
        </Card>

        <Card className="border-gray-200 hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Completed</CardTitle>
            <CheckCircle className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{stats.completed}</div>
            <p className="text-xs text-gray-500 mt-1">Finished projects</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="projects" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto">
          <TabsTrigger value="projects">Current Projects</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
          <TabsTrigger value="saved">Saved Freelancers</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
        </TabsList>

        {/* Current Projects Tab */}
        <TabsContent value="projects" className="space-y-6">
          {/* Filters */}
          <div className="flex gap-4 flex-col md:flex-row">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search by order number, gig title, or freelancer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-12"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[200px] h-12">
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
              <CardContent className="py-16 text-center">
                <Package className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold mb-2">No orders yet</h3>
                <p className="text-gray-600 mb-6">
                  {orders.length === 0
                    ? "Start browsing services to place your first order"
                    : "No orders match your filters"}
                </p>
                {orders.length === 0 && (
                  <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
                    <Link to="/browse">Browse Services</Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <Card key={order.id} className="hover:shadow-lg transition-all border-gray-200">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3 flex-wrap">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {order.gigs?.title || "Unknown Service"}
                          </h3>
                          <Badge className={getStatusColor(order.status)}>
                            {order.status.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                          </Badge>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="font-medium text-gray-900 mb-2">Order Details</p>
                            <p className="text-gray-600">Order #: {order.order_number}</p>
                            <p className="flex items-center gap-1 mt-1 text-gray-600">
                              <Calendar className="h-4 w-4" />
                              {new Date(order.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 mb-2">Freelancer</p>
                            <p className="text-gray-600">{order.profiles?.full_name || "Unknown"}</p>
                            <p className="flex items-center gap-1 mt-1 text-gray-900 font-semibold">
                              <DollarSign className="h-4 w-4" />
                              {order.currency} {order.price.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button asChild variant="outline" size="sm">
                          <Link to={`/order/${order.id}`}>Track Order</Link>
                        </Button>
                        <Button asChild variant="ghost" size="sm" title="Message Freelancer">
                          <Link to={`/messages?user=${order.freelancer_id}`}>
                            <MessageSquare className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Messages Tab */}
        <TabsContent value="messages">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Messages</CardTitle>
                  <CardDescription>Your recent conversations with freelancers</CardDescription>
                </div>
                <Button asChild variant="outline" size="sm">
                  <Link to="/messages">
                    View All
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {recentMessages.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No messages yet</h3>
                  <p className="text-gray-600">Start a conversation with a freelancer</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentMessages.map((message) => (
                    <div
                      key={message.id}
                      className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {message.sender_id === user?.id
                            ? message.receiver?.full_name
                            : message.sender?.full_name}
                        </p>
                        <p className="text-sm text-gray-600 line-clamp-1">{message.content}</p>
                      </div>
                      <Button asChild variant="ghost" size="sm">
                        <Link to={`/messages?user=${message.sender_id === user?.id ? message.receiver_id : message.sender_id}`}>
                          Open
                        </Link>
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Saved Freelancers Tab */}
        <TabsContent value="saved">
          <Card>
            <CardContent className="py-16 text-center">
              <Heart className="mx-auto h-16 w-16 text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold mb-2">No saved freelancers</h3>
              <p className="text-gray-600 mb-6">Save freelancers you're interested in working with</p>
              <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
                <Link to="/browse">Browse Freelancers</Link>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payments Tab */}
        <TabsContent value="payments">
          <Card>
            <CardContent className="py-16 text-center">
              <DollarSign className="mx-auto h-16 w-16 text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Payment History</h3>
              <p className="text-gray-600">Your payment history will appear here</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

