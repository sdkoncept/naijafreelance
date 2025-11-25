import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { AlertTriangle, Search, CheckCircle, XCircle, MessageSquare, DollarSign, Calendar, User, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

interface DisputedOrder {
  id: string;
  order_number: string;
  status: string;
  price: number;
  currency: string;
  created_at: string;
  client_id: string;
  freelancer_id: string;
  gig_id: string;
  cancellation_reason?: string;
  client: {
    full_name: string;
    email: string;
  };
  freelancer: {
    full_name: string;
    email: string;
  };
  gigs: {
    title: string;
    slug: string;
  };
}

export default function DisputeCenter() {
  const { user, userRole } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [disputes, setDisputes] = useState<DisputedOrder[]>([]);
  const [filteredDisputes, setFilteredDisputes] = useState<DisputedOrder[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDispute, setSelectedDispute] = useState<DisputedOrder | null>(null);
  const [resolveDialogOpen, setResolveDialogOpen] = useState(false);
  const [resolutionAction, setResolutionAction] = useState<string>("");
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [resolving, setResolving] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }

    if (userRole !== "admin") {
      toast.error("This page is for administrators only");
      navigate("/");
      return;
    }

    fetchDisputes();
  }, [user, userRole, navigate]);

  useEffect(() => {
    filterDisputes();
  }, [searchTerm, disputes]);

  const fetchDisputes = async () => {
    try {
      if (!user?.id) return;

      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          client:profiles!orders_client_id_fkey (
            full_name,
            email
          ),
          freelancer:profiles!orders_freelancer_id_fkey (
            full_name,
            email
          ),
          gigs:gig_id (
            title,
            slug
          )
        `)
        .eq("status", "disputed")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const transformedDisputes = (data || []).map((order: any) => ({
        ...order,
        client: Array.isArray(order.client) ? order.client[0] : order.client,
        freelancer: Array.isArray(order.freelancer) ? order.freelancer[0] : order.freelancer,
        gigs: Array.isArray(order.gigs) ? order.gigs[0] : order.gigs,
      }));

      setDisputes(transformedDisputes);
      setFilteredDisputes(transformedDisputes);
    } catch (error: any) {
      console.error("Error fetching disputes:", error);
      if (error.code !== "PGRST205") {
        toast.error("Failed to load disputes");
      }
      setDisputes([]);
      setFilteredDisputes([]);
    } finally {
      setLoading(false);
    }
  };

  const filterDisputes = () => {
    let filtered = [...disputes];

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (dispute) =>
          dispute.order_number.toLowerCase().includes(searchLower) ||
          dispute.client?.full_name?.toLowerCase().includes(searchLower) ||
          dispute.freelancer?.full_name?.toLowerCase().includes(searchLower) ||
          dispute.gigs?.title?.toLowerCase().includes(searchLower)
      );
    }

    setFilteredDisputes(filtered);
  };

  const handleResolveDispute = async () => {
    if (!selectedDispute || !resolutionAction) {
      toast.error("Please select a resolution action");
      return;
    }

    setResolving(true);
    try {
      let newStatus = "";
      if (resolutionAction === "favor_client") {
        newStatus = "cancelled";
      } else if (resolutionAction === "favor_freelancer") {
        newStatus = "completed";
      } else if (resolutionAction === "partial_refund") {
        newStatus = "completed";
      }

      const { error } = await supabase
        .from("orders")
        .update({
          status: newStatus,
          cancellation_reason: resolutionNotes || `Dispute resolved: ${resolutionAction}`,
          updated_at: new Date().toISOString(),
        })
        .eq("id", selectedDispute.id);

      if (error) throw error;

      // Log the resolution
      try {
        await supabase.from("audit_logs").insert([{
          user_id: user?.id,
          action: "dispute_resolved",
          table_name: "orders",
          record_id: selectedDispute.id,
          new_data: {
            resolution_action: resolutionAction,
            resolution_notes: resolutionNotes,
            new_status: newStatus,
          },
        }]);
      } catch (logError) {
        console.error("Error logging dispute resolution:", logError);
      }

      toast.success("Dispute resolved successfully");
      setResolveDialogOpen(false);
      setSelectedDispute(null);
      setResolutionAction("");
      setResolutionNotes("");
      fetchDisputes();
    } catch (error: any) {
      console.error("Error resolving dispute:", error);
      toast.error("Failed to resolve dispute: " + error.message);
    } finally {
      setResolving(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-20">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Loading disputes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <AlertTriangle className="w-8 h-8 text-red-600" />
          <h1 className="text-3xl sm:text-4xl font-bold">Dispute Center</h1>
        </div>
        <p className="text-gray-600">Review and resolve order disputes</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Card className="border-red-200 bg-red-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-900">Active Disputes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-900">{disputes.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{disputes.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Avg Resolution Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">-</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type="text"
            placeholder="Search by order number, client, freelancer, or gig title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12 h-12"
          />
        </div>
      </div>

      {/* Disputes List */}
      {filteredDisputes.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <CheckCircle className="mx-auto h-16 w-16 text-green-300 mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Active Disputes</h3>
            <p className="text-gray-600">
              {disputes.length === 0
                ? "There are no disputes at this time"
                : "No disputes match your search"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredDisputes.map((dispute) => (
            <Card key={dispute.id} className="border-red-200 hover:shadow-lg transition-all">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Order #{dispute.order_number}
                      </h3>
                      <Badge variant="destructive" className="bg-red-600">
                        Disputed
                      </Badge>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="font-medium text-gray-900 mb-1">Gig</p>
                        <p className="text-gray-600">{dispute.gigs?.title || "Unknown"}</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 mb-1">Amount</p>
                        <p className="text-gray-900 font-semibold">
                          {dispute.currency} {dispute.price.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 mb-1">Client</p>
                        <p className="text-gray-600">{dispute.client?.full_name || "Unknown"}</p>
                        <p className="text-xs text-gray-500">{dispute.client?.email}</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 mb-1">Freelancer</p>
                        <p className="text-gray-600">{dispute.freelancer?.full_name || "Unknown"}</p>
                        <p className="text-xs text-gray-500">{dispute.freelancer?.email}</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 mb-1">Created</p>
                        <p className="text-gray-600">
                          {new Date(dispute.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    {dispute.cancellation_reason && (
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs font-medium text-gray-700 mb-1">Reason:</p>
                        <p className="text-sm text-gray-600">{dispute.cancellation_reason}</p>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-2 w-full lg:w-auto">
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="w-full lg:w-auto"
                    >
                      <Link to={`/order/${dispute.id}`}>View Order</Link>
                    </Button>
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="w-full lg:w-auto"
                    >
                      <Link to={`/messages?user=${dispute.client_id}`}>
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Message Client
                      </Link>
                    </Button>
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="w-full lg:w-auto"
                    >
                      <Link to={`/messages?user=${dispute.freelancer_id}`}>
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Message Freelancer
                      </Link>
                    </Button>
                    <Button
                      onClick={() => {
                        setSelectedDispute(dispute);
                        setResolveDialogOpen(true);
                      }}
                      className="w-full lg:w-auto bg-primary hover:bg-primary/90 text-white"
                      size="sm"
                    >
                      Resolve Dispute
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Resolve Dispute Dialog */}
      <Dialog open={resolveDialogOpen} onOpenChange={setResolveDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Resolve Dispute</DialogTitle>
            <DialogDescription>
              Review the dispute and select a resolution action
            </DialogDescription>
          </DialogHeader>
          {selectedDispute && (
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <p className="text-sm font-medium text-gray-900">Order Details</p>
                <p className="text-sm text-gray-600">Order #{selectedDispute.order_number}</p>
                <p className="text-sm text-gray-600">
                  {selectedDispute.currency} {selectedDispute.price.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">
                  Client: {selectedDispute.client?.full_name}
                </p>
                <p className="text-sm text-gray-600">
                  Freelancer: {selectedDispute.freelancer?.full_name}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="resolution">Resolution Action *</Label>
                <Select
                  value={resolutionAction}
                  onValueChange={setResolutionAction}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select resolution action" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="favor_client">
                      Favor Client (Refund & Cancel Order)
                    </SelectItem>
                    <SelectItem value="favor_freelancer">
                      Favor Freelancer (Complete Order)
                    </SelectItem>
                    <SelectItem value="partial_refund">
                      Partial Refund (Complete with Partial Refund)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Resolution Notes</Label>
                <Textarea
                  id="notes"
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="Add notes about the resolution decision..."
                  rows={4}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setResolveDialogOpen(false);
                setSelectedDispute(null);
                setResolutionAction("");
                setResolutionNotes("");
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleResolveDispute}
              disabled={!resolutionAction || resolving}
              className="bg-primary hover:bg-primary/90"
            >
              {resolving ? "Resolving..." : "Resolve Dispute"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}


