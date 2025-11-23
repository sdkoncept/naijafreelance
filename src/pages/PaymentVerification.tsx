import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, CheckCircle2, Filter } from "lucide-react";
import { toast } from "sonner";
import PaymentVerificationDialog from "@/components/PaymentVerificationDialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Enrollee {
  id: string;
  cin: string | null;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  registration_date: string;
  health_plan: string;
  payment_status: string;
  facility: string;
}

export default function PaymentVerification() {
  const [enrollees, setEnrollees] = useState<Enrollee[]>([]);
  const [filteredEnrollees, setFilteredEnrollees] = useState<Enrollee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEnrollee, setSelectedEnrollee] = useState<Enrollee | null>(null);
  const [showVerificationDialog, setShowVerificationDialog] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [healthPlanFilter, setHealthPlanFilter] = useState<string>("all");

  useEffect(() => {
    fetchPendingEnrollees();
  }, []);

  useEffect(() => {
    filterEnrollees();
  }, [searchTerm, enrollees, healthPlanFilter]);

  const fetchPendingEnrollees = async () => {
    try {
      const { data, error } = await supabase
        .from("enrollees")
        .select("id, cin, first_name, middle_name, last_name, registration_date, health_plan, payment_status, facility")
        .eq("payment_status", "pending")
        .order("registration_date", { ascending: false });

      if (error) throw error;
      setEnrollees(data || []);
    } catch (error: any) {
      toast.error("Failed to load pending enrollees");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filterEnrollees = () => {
    let filtered = enrollees;

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter((enrollee) => {
        const fullName = getFullName(enrollee).toLowerCase();
        return (
          fullName.includes(search) ||
          enrollee.cin?.toLowerCase().includes(search) ||
          enrollee.facility.toLowerCase().includes(search)
        );
      });
    }

    if (healthPlanFilter !== "all") {
      filtered = filtered.filter((enrollee) => enrollee.health_plan === healthPlanFilter);
    }

    setFilteredEnrollees(filtered);
  };

  const getFullName = (enrollee: Enrollee) => {
    return [enrollee.first_name, enrollee.middle_name, enrollee.last_name]
      .filter(Boolean)
      .join(' ');
  };

  const handleVerifyClick = (enrollee: Enrollee) => {
    setSelectedEnrollee(enrollee);
    setShowVerificationDialog(true);
  };

  const handleToggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(filteredEnrollees.map(e => e.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleBulkVerify = async () => {
    if (selectedIds.size === 0) {
      toast.error("Please select enrollees to verify");
      return;
    }

    if (!confirm(`Verify payment for ${selectedIds.size} enrollee(s)?`)) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Update all selected enrollees
      const { error: updateError } = await supabase
        .from("enrollees")
        .update({
          payment_status: "confirmed",
          payment_date: new Date().toISOString(),
        })
        .in("id", Array.from(selectedIds));

      if (updateError) throw updateError;

      // Generate CINs for enrollees without one
      for (const id of Array.from(selectedIds)) {
        const enrollee = enrollees.find(e => e.id === id);
        if (enrollee && !enrollee.cin) {
          const { data: cinData, error: cinError } = await supabase.rpc("generate_cin");
          if (!cinError && cinData) {
            await supabase.from("enrollees").update({ cin: cinData }).eq("id", id);
          }
        }

        // Create audit log
        await supabase.from("audit_logs").insert({
          user_id: user.id,
          record_id: id,
          action: "bulk_payment_verified",
          table_name: "enrollees",
          old_data: { payment_status: "pending" },
          new_data: { payment_status: "confirmed", payment_date: new Date().toISOString() },
        });
      }

      toast.success(`Successfully verified ${selectedIds.size} payment(s)`);
      setSelectedIds(new Set());
      await fetchPendingEnrollees();
    } catch (error: any) {
      toast.error("Failed to verify payments");
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Payment Verification</h1>
        <p className="text-muted-foreground">Review and verify pending payments</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Pending Verifications</CardTitle>
              <CardDescription>
                {filteredEnrollees.length} enrollee(s) pending payment verification
              </CardDescription>
            </div>
            {selectedIds.size > 0 && (
              <Button onClick={handleBulkVerify}>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Verify {selectedIds.size} Selected
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, CIN, or facility..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={healthPlanFilter} onValueChange={setHealthPlanFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Health Plan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Plans</SelectItem>
                <SelectItem value="bronze">Bronze</SelectItem>
                <SelectItem value="silver">Silver</SelectItem>
                <SelectItem value="gold">Gold</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {filteredEnrollees.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle2 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium">No pending verifications</p>
              <p className="text-muted-foreground">All payments have been verified</p>
            </div>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedIds.size === filteredEnrollees.length}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>CIN</TableHead>
                    <TableHead>Registration Date</TableHead>
                    <TableHead>Health Plan</TableHead>
                    <TableHead>Facility</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEnrollees.map((enrollee) => (
                    <TableRow key={enrollee.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedIds.has(enrollee.id)}
                          onCheckedChange={() => handleToggleSelect(enrollee.id)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{getFullName(enrollee)}</TableCell>
                      <TableCell>
                        {enrollee.cin || (
                          <Badge variant="secondary" className="text-xs">
                            Pending
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {new Date(enrollee.registration_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {enrollee.health_plan}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {enrollee.facility}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => handleVerifyClick(enrollee)}
                        >
                          Verify Payment
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <PaymentVerificationDialog
        enrollee={selectedEnrollee}
        open={showVerificationDialog}
        onOpenChange={setShowVerificationDialog}
        onSuccess={fetchPendingEnrollees}
      />
    </div>
  );
}
