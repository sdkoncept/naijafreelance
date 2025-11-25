import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { DollarSign, TrendingUp, Wallet, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import WithdrawalRequestForm from "@/components/WithdrawalRequestForm";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface EarningsData {
  total_earnings: number;
  pending_withdrawal: number;
  available_balance: number;
  completed_orders: number;
}

interface Withdrawal {
  id: string;
  amount: number;
  status: string;
  created_at: string;
  processed_at: string | null;
}

export default function Earnings() {
  const { user, profile, userRole } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [earnings, setEarnings] = useState<EarningsData>({
    total_earnings: 0,
    pending_withdrawal: 0,
    available_balance: 0,
    completed_orders: 0,
  });
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [showWithdrawalDialog, setShowWithdrawalDialog] = useState(false);

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

    fetchEarnings();
    fetchWithdrawals();
  }, [user, profile, userRole, navigate]);

  const fetchEarnings = async () => {
    try {
      if (!user?.id) return;

      // Fetch completed orders to calculate earnings
      try {
        const { data: ordersData, error: ordersError } = await supabase
          .from("orders")
          .select("freelancer_earnings, status")
          .eq("freelancer_id", user.id);

        if (ordersError && ordersError.code !== "PGRST205") throw ordersError;

        if (ordersData) {
          const completedOrders = ordersData.filter((o) => o.status === "completed");
          const totalEarnings = completedOrders.reduce(
            (sum, o) => sum + (parseFloat(String(o.freelancer_earnings || 0))),
            0
          );

          setEarnings({
            total_earnings: totalEarnings,
            pending_withdrawal: 0, // Would need withdrawals table
            available_balance: totalEarnings,
            completed_orders: completedOrders.length,
          });
        }
      } catch (error: any) {
        if (error.code === "PGRST205") {
          // Orders table doesn't exist
          console.log("Orders table not available");
        }
      }
    } catch (error: any) {
      console.error("Error fetching earnings:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWithdrawals = async () => {
    try {
      if (!user?.id) return;

      try {
        const { data, error } = await supabase
          .from("withdrawals")
          .select("*")
          .eq("freelancer_id", user.id)
          .order("created_at", { ascending: false })
          .limit(20);

        if (error && error.code !== "PGRST205") throw error;
        if (data) {
          setWithdrawals(data);
        }
      } catch (error: any) {
        if (error.code === "PGRST205") {
          // Withdrawals table doesn't exist
          console.log("Withdrawals table not available");
        }
      }
    } catch (error: any) {
      console.error("Error fetching withdrawals:", error);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
      pending: "outline",
      processing: "secondary",
      completed: "default",
      failed: "destructive",
    };

    return (
      <Badge variant={variants[status] || "outline"}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-slate-700"></div>
          <p className="mt-4 text-gray-600">Loading earnings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Earnings</h1>
        <p className="text-gray-600">Track your earnings and withdrawals</p>
      </div>

      {/* Earnings Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₦{earnings.total_earnings.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₦{earnings.available_balance.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Ready to withdraw</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Orders</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{earnings.completed_orders}</div>
            <p className="text-xs text-muted-foreground">Total completed</p>
          </CardContent>
        </Card>
      </div>

      {/* Withdrawals */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Withdrawal History</CardTitle>
              <CardDescription>View your withdrawal requests</CardDescription>
            </div>
            <Button onClick={() => setShowWithdrawalDialog(true)}>
              <Download className="mr-2 h-4 w-4" />
              Request Withdrawal
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {withdrawals.length === 0 ? (
            <div className="text-center py-12">
              <Wallet className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No withdrawals yet</h3>
              <p className="text-gray-600">
                Withdrawal feature coming soon. You'll be able to withdraw your earnings to your bank account.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Processed Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {withdrawals.map((withdrawal) => (
                  <TableRow key={withdrawal.id}>
                    <TableCell>
                      {new Date(withdrawal.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="font-medium">
                      ₦{withdrawal.amount.toLocaleString()}
                    </TableCell>
                    <TableCell>{getStatusBadge(withdrawal.status)}</TableCell>
                    <TableCell>
                      {withdrawal.processed_at
                        ? new Date(withdrawal.processed_at).toLocaleDateString()
                        : "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Withdrawal Request Dialog */}
      <Dialog open={showWithdrawalDialog} onOpenChange={setShowWithdrawalDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Request Withdrawal</DialogTitle>
            <DialogDescription>
              Withdraw your earnings to your Nigerian bank account
            </DialogDescription>
          </DialogHeader>
          <WithdrawalRequestForm
            availableBalance={earnings.available_balance}
            onSuccess={() => {
              setShowWithdrawalDialog(false);
              fetchWithdrawals();
            }}
            onCancel={() => setShowWithdrawalDialog(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

