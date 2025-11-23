import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Upload, Users, TrendingUp, CreditCard, Hash, CheckCircle, XCircle, Clock, Filter, Search, Eye, UserCheck, RefreshCw, Building2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { FACILITIES } from "@/constants/facilities";
import PaymentVerificationDialog from "@/components/PaymentVerificationDialog";

interface Enrollee {
  id: string;
  cin: string | null;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  phone_number: string;
  lga: string;
  registration_date: string;
  facility: string;
  payment_status: string;
  health_plan: string;
}

export default function Dashboard() {
  const [enrollees, setEnrollees] = useState<Enrollee[]>([]);
  const [filteredEnrollees, setFilteredEnrollees] = useState<Enrollee[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, thisMonth: 0 });
  const [uploadingCSV, setUploadingCSV] = useState(false);
  const [generatingCIN, setGeneratingCIN] = useState<string | null>(null);
  const [editingFacility, setEditingFacility] = useState<Enrollee | null>(null);
  const [newFacility, setNewFacility] = useState("");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>("all");
  const [selectedEnrollee, setSelectedEnrollee] = useState<Enrollee | null>(null);
  const [showVerificationDialog, setShowVerificationDialog] = useState(false);
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  const canUploadCSV = hasRole('admin') || hasRole('staff');

  useEffect(() => {
    fetchEnrollees();
  }, []);

  useEffect(() => {
    filterEnrollees();
  }, [searchTerm, enrollees, paymentStatusFilter]);

  const fetchEnrollees = async () => {
    try {
      const { data, error } = await supabase
        .from("enrollees")
        .select("id, cin, first_name, middle_name, last_name, phone_number, lga, registration_date, facility, payment_status, health_plan")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setEnrollees(data || []);
      calculateStats(data || []);
    } catch (error: any) {
      toast.error("Failed to load enrollees: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data: Enrollee[]) => {
    const now = new Date();
    const thisMonth = data.filter((e) => {
      const regDate = new Date(e.registration_date);
      return (
        regDate.getMonth() === now.getMonth() &&
        regDate.getFullYear() === now.getFullYear()
      );
    });

    setStats({
      total: data.length,
      thisMonth: thisMonth.length,
    });
  };

  const filterEnrollees = () => {
    let filtered = enrollees;

    // Filter by payment status
    if (paymentStatusFilter !== "all") {
      filtered = filtered.filter((enrollee) => enrollee.payment_status === paymentStatusFilter);
    }

    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (e) =>
          (e.cin && e.cin.toLowerCase().includes(term)) ||
          e.first_name.toLowerCase().includes(term) ||
          e.last_name.toLowerCase().includes(term) ||
          (e.middle_name && e.middle_name.toLowerCase().includes(term)) ||
          e.phone_number.includes(term) ||
          e.lga.toLowerCase().includes(term) ||
          e.facility.toLowerCase().includes(term) ||
          e.payment_status.toLowerCase().includes(term)
      );
    }

    setFilteredEnrollees(filtered);
  };

  const getPaymentStatusBadge = (status: string) => {
    const statusConfig = {
      confirmed: { variant: "default" as const, icon: UserCheck, label: "Confirmed" },
      pending: { variant: "secondary" as const, icon: RefreshCw, label: "Pending" },
      failed: { variant: "destructive" as const, icon: Users, label: "Failed" },
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return config;
  };

  const handleQuickVerify = (enrollee: Enrollee) => {
    setSelectedEnrollee(enrollee);
    setShowVerificationDialog(true);
  };

  const downloadCSVTemplate = () => {
    const headers = ['first_name', 'middle_name', 'last_name', 'phone_number', 'email', 'date_of_birth', 'gender', 'lga', 'home_address', 'facility', 'genotype', 'blood_group', 'health_plan', 'payment_status', 'allergies'];
    const exampleRow = ['John', 'Michael', 'Doe', '08012345678', 'john.doe@example.com', '1990-01-15', 'Male', 'Oredo', '123 Main Street Benin City', 'UNIVERSITY OF BENIN TEACHING HOSPITAL', 'AS', 'A+', 'silver', 'confirmed', 'Peanuts'];
    
    // Properly quote all values to handle commas and special characters
    const quotedHeaders = headers.map(h => `"${h}"`);
    const quotedExampleRow = exampleRow.map(v => `"${String(v).replace(/"/g, '""')}"`);
    
    const csvContent = [
      quotedHeaders.join(','),
      quotedExampleRow.join(',')
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', 'enrollee_template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('CSV template downloaded');
  };

  const handleCSVUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingCSV(true);
    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      // Parse CSV with proper quote handling
      const parseCSVLine = (line: string) => {
        const result = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
          const char = line[i];
          if (char === '"') {
            if (inQuotes && line[i + 1] === '"') {
              current += '"';
              i++;
            } else {
              inQuotes = !inQuotes;
            }
          } else if (char === ',' && !inQuotes) {
            result.push(current.trim());
            current = '';
          } else {
            current += char;
          }
        }
        result.push(current.trim());
        return result;
      };
      
      const headers = parseCSVLine(lines[0]);
      
      const requiredHeaders = ['first_name', 'last_name', 'lga', 'facility', 'health_plan', 'date_of_birth', 'gender', 'home_address', 'phone_number', 'genotype', 'blood_group', 'payment_status'];
      const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
      if (missingHeaders.length > 0) {
        toast.error(`Missing required columns: ${missingHeaders.join(', ')}`);
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const records = [];
      for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);
        if (values.length !== headers.length) continue;
        
        const record: any = {};
        headers.forEach((header, index) => {
          record[header] = values[index] || null;
        });

        // Generate CIN for each enrollee
        const { data: cin, error: cinError } = await supabase.rpc("generate_enrollee_cin", {
          plan: record.health_plan,
          lga: record.lga
        });

        if (cinError) {
          toast.error(`Failed to generate CIN for row ${i + 1}: ${cinError.message}`);
          continue;
        }

        record.cin = cin;
        record.created_by = user.id;
        records.push(record);
      }

      if (records.length === 0) {
        toast.error('No valid records to import');
        return;
      }

      const { error } = await supabase.from('enrollees').insert(records);
      if (error) throw error;

      toast.success(`Successfully imported ${records.length} enrollees`);
      fetchEnrollees();
    } catch (error: any) {
      toast.error('Failed to import CSV: ' + error.message);
    } finally {
      setUploadingCSV(false);
      event.target.value = '';
    }
  };

  const handleGenerateCIN = async (enrolleeId: string) => {
    setGeneratingCIN(enrolleeId);
    try {
      const { data: newCIN, error: cinError } = await supabase.rpc('generate_cin');
      if (cinError) throw cinError;

      const { error: updateError } = await supabase
        .from('enrollees')
        .update({ cin: newCIN })
        .eq('id', enrolleeId);

      if (updateError) throw updateError;

      toast.success('CIN generated successfully');
      await fetchEnrollees();
    } catch (error: any) {
      toast.error('Failed to generate CIN: ' + error.message);
    } finally {
      setGeneratingCIN(null);
    }
  };

  const handleUpdateFacility = async () => {
    if (!editingFacility) {
      toast.error("No enrollee selected for facility update");
      return;
    }

    if (!newFacility) {
      toast.error("Please select a facility before updating");
      return;
    }

    if (newFacility === editingFacility.facility) {
      toast.info("The selected facility is the same as the current one");
      setEditingFacility(null);
      setNewFacility("");
      return;
    }

    try {
      const { error } = await supabase
        .from('enrollees')
        .update({ facility: newFacility })
        .eq('id', editingFacility.id);

      if (error) {
        // Provide specific error messages based on error code
        if (error.code === 'PGRST116') {
          throw new Error("Enrollee not found. The record may have been deleted.");
        } else if (error.code === '42501') {
          throw new Error("You don't have permission to update this enrollee's facility.");
        } else if (error.message.includes('violates check constraint')) {
          throw new Error("Invalid facility value. Please select a valid facility from the list.");
        } else {
          throw new Error(`Database error: ${error.message}`);
        }
      }

      toast.success(`Facility updated successfully to ${newFacility}`);
      setEditingFacility(null);
      setNewFacility("");
      await fetchEnrollees();
    } catch (error: any) {
      console.error("Facility update error:", error);
      toast.error(error.message || 'Failed to update facility. Please try again.');
    }
  };

  const handleExportAllEnrollees = async () => {
    try {
      toast.info("Generating export...");
      
      const { data: enrolleesData, error } = await supabase
        .from("enrollees")
        .select(`
          id, cin, first_name, middle_name, last_name, 
          facility, health_plan,
          dependants (first_name, middle_name, last_name, relationship)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Format data for CSV
      const csvRows = [
        ["Full Name", "Facility", "Health Plan", "CIN", "Dependants"]
      ];

      enrolleesData?.forEach((enrollee: any) => {
        const fullName = [enrollee.first_name, enrollee.middle_name, enrollee.last_name]
          .filter(Boolean)
          .join(" ");
        
        const dependantsList = enrollee.dependants?.length > 0
          ? enrollee.dependants.map((dep: any) => {
              const depName = [dep.first_name, dep.middle_name, dep.last_name]
                .filter(Boolean)
                .join(" ");
              return `${depName} (${dep.relationship})`;
            }).join(", ")
          : "None";

        csvRows.push([
          fullName,
          enrollee.facility,
          enrollee.health_plan,
          enrollee.cin,
          dependantsList
        ]);
      });

      // Generate CSV content
      const csvContent = csvRows.map(row => 
        row.map(cell => `"${cell.toString().replace(/"/g, '""')}"`).join(",")
      ).join("\n");

      // Create and download file
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, -5);
      
      link.setAttribute("href", url);
      link.setAttribute("download", `enrollees_export_${timestamp}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success(`Successfully exported ${enrolleesData?.length} enrollees`);
    } catch (error: any) {
      toast.error(`Export failed: ${error.message}`);
    }
  };

  const getFullName = (enrollee: Enrollee) => {
    return [enrollee.first_name, enrollee.middle_name, enrollee.last_name]
      .filter(Boolean)
      .join(' ');
  };

  const enrolleesWithoutCIN = filteredEnrollees.filter(
    e => !e.cin && e.payment_status === 'confirmed'
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Manage and search enrollee records
          </p>
        </div>
        {canUploadCSV && (
          <div className="flex gap-2">
            {hasRole("admin") && (
              <Button variant="outline" onClick={handleExportAllEnrollees}>
                <Download className="w-4 h-4 mr-2" />
                Facility List
              </Button>
            )}
            <Button variant="outline" onClick={downloadCSVTemplate}>
              Download Template
            </Button>
            <div className="relative">
              <input
                type="file"
                accept=".csv"
                onChange={handleCSVUpload}
                disabled={uploadingCSV}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Button disabled={uploadingCSV}>
                <Upload className="mr-2 h-4 w-4" />
                {uploadingCSV ? 'Uploading...' : 'Upload CSV'}
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Enrollees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              All registered enrollees
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.thisMonth}</div>
            <p className="text-xs text-muted-foreground">
              New enrollments this month
            </p>
          </CardContent>
        </Card>

        {canUploadCSV && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending CIN</CardTitle>
              <RefreshCw className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{enrolleesWithoutCIN.length}</div>
              <p className="text-xs text-muted-foreground">
                Confirmed payments awaiting CIN
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <CardTitle>Search Enrollees</CardTitle>
              <CardDescription>
                Search by CIN, name, phone number, LGA, or facility
              </CardDescription>
            </div>
            <Select value={paymentStatusFilter} onValueChange={setPaymentStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Payment Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {filteredEnrollees.length > 0 ? (
            <div className="mt-4 space-y-2">
              {filteredEnrollees.map((enrollee) => {
                const statusConfig = getPaymentStatusBadge(enrollee.payment_status);
                const StatusIcon = statusConfig.icon;
                return (
                  <div
                    key={enrollee.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium">{getFullName(enrollee)}</p>
                        <Badge variant={statusConfig.variant} className="gap-1 text-xs">
                          <StatusIcon className="h-3 w-3" />
                          {statusConfig.label}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        CIN: {enrollee.cin || 'Not assigned'} | LGA: {enrollee.lga} | Phone: {enrollee.phone_number}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Facility: {enrollee.facility}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {enrollee.payment_status === "pending" && canUploadCSV && (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleQuickVerify(enrollee)}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Verify Payment
                        </Button>
                      )}
                      {canUploadCSV && !enrollee.cin && enrollee.payment_status === 'confirmed' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleGenerateCIN(enrollee.id)}
                          disabled={generatingCIN === enrollee.id}
                        >
                          <RefreshCw className={`h-4 w-4 mr-2 ${generatingCIN === enrollee.id ? 'animate-spin' : ''}`} />
                          Generate CIN
                        </Button>
                      )}
                      {canUploadCSV && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingFacility(enrollee);
                            setNewFacility(enrollee.facility);
                          }}
                        >
                          <Building2 className="h-4 w-4 mr-2" />
                          Change Facility
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/enrollee/${enrollee.id}`)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : searchTerm ? (
            <p className="text-center text-muted-foreground mt-4">
              No enrollees found matching your search
            </p>
          ) : (
            <p className="text-center text-muted-foreground mt-4">
              Start typing to search for enrollees
            </p>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!editingFacility} onOpenChange={(open) => !open && setEditingFacility(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Facility</DialogTitle>
            <DialogDescription>
              Update the facility assigned to {editingFacility?.first_name} {editingFacility?.last_name}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select value={newFacility} onValueChange={setNewFacility}>
              <SelectTrigger>
                <SelectValue placeholder="Select facility" />
              </SelectTrigger>
              <SelectContent>
                {FACILITIES.map((facility) => (
                  <SelectItem key={facility} value={facility}>
                    {facility}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingFacility(null)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateFacility}>
              Update Facility
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <PaymentVerificationDialog
        enrollee={selectedEnrollee}
        open={showVerificationDialog}
        onOpenChange={setShowVerificationDialog}
        onSuccess={fetchEnrollees}
      />
    </div>
  );
}
