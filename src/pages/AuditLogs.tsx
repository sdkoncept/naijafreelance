import { useEffect, useState, Fragment } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router-dom";
import { Search, Shield, UserCheck, FileEdit, Trash2, LogIn, LogOut, UserPlus, Key, CreditCard, Download, ChevronDown, Calendar } from "lucide-react";
import { format } from "date-fns";

interface AuditLog {
  id: string;
  user_id: string | null;
  action: string;
  table_name: string;
  record_id: string | null;
  old_data: any;
  new_data: any;
  created_at: string;
  profiles?: {
    full_name: string;
    email: string;
  };
}

export default function AuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [userFilter, setUserFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [users, setUsers] = useState<Array<{ id: string; name: string; email: string }>>([]);
  const { userRole } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (userRole !== "admin") {
      toast.error("Access denied. Admin privileges required.");
      navigate("/");
      return;
    }
    fetchAuditLogs();
    fetchUsers();
  }, [userRole, navigate]);

  useEffect(() => {
    filterLogs();
  }, [searchTerm, actionFilter, userFilter, startDate, endDate, logs]);

  const fetchAuditLogs = async () => {
    try {
      const { data, error } = await supabase
        .from("audit_logs")
        .select(`
          *,
          profiles:user_id (
            full_name,
            email
          )
        `)
        .order("created_at", { ascending: false })
        .limit(1000);

      if (error) throw error;
      setLogs(data || []);
    } catch (error: any) {
      toast.error("Failed to load audit logs: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .order("full_name");

      if (error) throw error;
      setUsers(data?.map(u => ({ id: u.id, name: u.full_name, email: u.email })) || []);
    } catch (error: any) {
      console.error("Failed to load users:", error);
    }
  };

  const filterLogs = () => {
    let filtered = logs;

    // Filter by action
    if (actionFilter !== "all") {
      filtered = filtered.filter((log) => log.action === actionFilter);
    }

    // Filter by user
    if (userFilter !== "all") {
      filtered = filtered.filter((log) => log.user_id === userFilter);
    }

    // Filter by date range
    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      filtered = filtered.filter((log) => new Date(log.created_at) >= start);
    }

    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      filtered = filtered.filter((log) => new Date(log.created_at) <= end);
    }

    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (log) =>
          log.profiles?.full_name?.toLowerCase().includes(term) ||
          log.profiles?.email?.toLowerCase().includes(term) ||
          log.action.toLowerCase().includes(term) ||
          log.table_name.toLowerCase().includes(term) ||
          log.record_id?.toLowerCase().includes(term) ||
          JSON.stringify(log.new_data).toLowerCase().includes(term) ||
          JSON.stringify(log.old_data).toLowerCase().includes(term)
      );
    }

    setFilteredLogs(filtered);
  };

  const exportToCSV = () => {
    try {
      const headers = ["Timestamp", "User", "Email", "Action", "Table", "Record ID", "Old Data", "New Data"];
      const rows = filteredLogs.map(log => [
        new Date(log.created_at).toLocaleString(),
        log.action === "login_failed" 
          ? (log.new_data?.email || "Unknown")
          : (log.profiles?.full_name || "Unknown"),
        log.action === "login_failed" ? "" : (log.profiles?.email || ""),
        formatActionName(log.action),
        log.table_name,
        log.record_id || "",
        JSON.stringify(log.old_data || {}),
        JSON.stringify(log.new_data || {}),
      ]);

      const csvContent = [
        headers.join(","),
        ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      
      link.setAttribute("href", url);
      link.setAttribute("download", `audit-logs-${format(new Date(), "yyyy-MM-dd-HHmm")}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success("Audit logs exported successfully");
    } catch (error) {
      toast.error("Failed to export audit logs");
      console.error(error);
    }
  };

  const toggleRowExpansion = (logId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(logId)) {
      newExpanded.delete(logId);
    } else {
      newExpanded.add(logId);
    }
    setExpandedRows(newExpanded);
  };

  const getEnrolleeInfo = (data: any) => {
    if (!data) return null;
    
    // Extract enrollee information from the data
    const enrolleeFields = {
      cin: data.cin,
      name: [data.first_name, data.middle_name, data.last_name].filter(Boolean).join(" "),
      phone: data.phone_number,
      email: data.email,
      lga: data.lga,
      facility: data.facility,
      payment_status: data.payment_status,
      health_plan: data.health_plan,
    };

    return Object.entries(enrolleeFields)
      .filter(([_, value]) => value)
      .map(([key, value]) => `${key}: ${value}`)
      .join(", ");
  };

  const clearFilters = () => {
    setSearchTerm("");
    setActionFilter("all");
    setUserFilter("all");
    setStartDate("");
    setEndDate("");
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      // Authentication
      case "login":
        return <LogIn className="h-4 w-4" />;
      case "login_failed":
        return <LogIn className="h-4 w-4 text-destructive" />;
      case "logout":
        return <LogOut className="h-4 w-4" />;
      case "signup":
        return <UserPlus className="h-4 w-4" />;
      case "password_change":
      case "password_reset_request":
        return <Key className="h-4 w-4" />;
      // User Management
      case "user_update":
      case "profile_update":
        return <FileEdit className="h-4 w-4" />;
      case "user_type_change":
        return <Shield className="h-4 w-4" />;
      case "user_delete":
        return <Trash2 className="h-4 w-4" />;
      // Gigs
      case "gig_create":
        return <UserCheck className="h-4 w-4" />;
      case "gig_update":
      case "gig_activate":
        return <FileEdit className="h-4 w-4" />;
      case "gig_delete":
      case "gig_pause":
        return <Trash2 className="h-4 w-4" />;
      // Jobs
      case "job_create":
        return <UserCheck className="h-4 w-4" />;
      case "job_update":
        return <FileEdit className="h-4 w-4" />;
      case "job_close":
      case "job_cancel":
        return <Trash2 className="h-4 w-4" />;
      // Orders
      case "order_create":
        return <UserCheck className="h-4 w-4" />;
      case "order_update":
      case "order_status_change":
      case "order_complete":
        return <FileEdit className="h-4 w-4" />;
      case "order_cancel":
        return <Trash2 className="h-4 w-4" />;
      // Payments
      case "payment_initiated":
      case "payment_completed":
        return <CreditCard className="h-4 w-4" />;
      case "payment_failed":
        return <CreditCard className="h-4 w-4 text-destructive" />;
      case "payment_refunded":
        return <CreditCard className="h-4 w-4" />;
      // Legacy
      case "enrollee_create":
      case "dependant_create":
        return <UserCheck className="h-4 w-4" />;
      case "enrollee_update":
      case "dependant_update":
        return <FileEdit className="h-4 w-4" />;
      case "enrollee_delete":
      case "dependant_delete":
        return <Trash2 className="h-4 w-4" />;
      case "payment_verify":
        return <CreditCard className="h-4 w-4" />;
      case "role_change":
        return <Shield className="h-4 w-4" />;
      default:
        return <Shield className="h-4 w-4" />;
    }
  };

  const getActionVariant = (action: string): "default" | "secondary" | "destructive" | "outline" => {
    if (action === "login_failed" || action === "payment_failed") return "destructive";
    if (action.includes("delete") || action.includes("cancel")) return "destructive";
    if (action.includes("create") || action === "signup" || action === "payment_completed" || action === "order_complete") return "default";
    if (action.includes("update") || action.includes("login") || action.includes("change") || action.includes("status")) return "secondary";
    return "outline";
  };

  const formatActionName = (action: string) => {
    return action
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading audit logs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Audit Logs</h1>
        <p className="text-muted-foreground">
          Track all system activities for security and compliance
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Security & Activity Monitoring</CardTitle>
              <CardDescription>
                View authentication events, data changes, and administrative actions
              </CardDescription>
            </div>
            <Button onClick={exportToCSV} disabled={filteredLogs.length === 0} size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search by user, action, record, or data..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filters Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="action-filter">Action</Label>
                <Select value={actionFilter} onValueChange={setActionFilter}>
                  <SelectTrigger id="action-filter">
                    <SelectValue placeholder="Filter by action" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Actions</SelectItem>
                    <SelectItem value="login">Login</SelectItem>
                    <SelectItem value="logout">Logout</SelectItem>
                    <SelectItem value="signup">Signup</SelectItem>
                    <SelectItem value="password_change">Password Change</SelectItem>
                    <SelectItem value="enrollee_create">Enrollee Create</SelectItem>
                    <SelectItem value="enrollee_update">Enrollee Update</SelectItem>
                    <SelectItem value="enrollee_delete">Enrollee Delete</SelectItem>
                    <SelectItem value="dependant_create">Dependant Create</SelectItem>
                    <SelectItem value="dependant_update">Dependant Update</SelectItem>
                    <SelectItem value="dependant_delete">Dependant Delete</SelectItem>
                    <SelectItem value="payment_verify">Payment Verify</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="user-filter">User</Label>
                <Select value={userFilter} onValueChange={setUserFilter}>
                  <SelectTrigger id="user-filter">
                    <SelectValue placeholder="Filter by user" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    {users.map(user => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name} ({user.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="start-date">Start Date</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="end-date">End Date</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>

            {/* Clear Filters Button */}
            {(searchTerm || actionFilter !== "all" || userFilter !== "all" || startDate || endDate) && (
              <Button onClick={clearFilters} variant="outline" size="sm" className="w-fit">
                Clear All Filters
              </Button>
            )}
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]"></TableHead>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Table</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      {searchTerm || actionFilter !== "all" || userFilter !== "all" || startDate || endDate
                        ? "No matching audit logs found" 
                        : "No audit logs yet"}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLogs.map((log) => (
                    <Fragment key={log.id}>
                      <TableRow className="cursor-pointer hover:bg-muted/50" onClick={() => toggleRowExpansion(log.id)}>
                        <TableCell>
                          <ChevronDown 
                            className={`h-4 w-4 transition-transform ${expandedRows.has(log.id) ? "transform rotate-180" : ""}`}
                          />
                        </TableCell>
                        <TableCell className="text-sm">
                          {new Date(log.created_at).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium text-sm">
                              {log.action === "login_failed" 
                                ? (log.new_data?.email || "Unknown")
                                : (log.profiles?.full_name || "Unknown")}
                            </span>
                            {log.action !== "login_failed" && (
                              <span className="text-xs text-muted-foreground">{log.profiles?.email}</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getActionVariant(log.action)} className="gap-1">
                            {getActionIcon(log.action)}
                            {formatActionName(log.action)}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-sm">{log.table_name}</TableCell>
                        <TableCell className="text-sm">
                          {log.action === "login_failed" && log.new_data && (
                            <div className="text-destructive text-xs">
                              {log.new_data.error_message}
                            </div>
                          )}
                          {log.table_name === "enrollees" && log.new_data && (
                            <div className="text-muted-foreground truncate max-w-md">
                              {getEnrolleeInfo(log.new_data)}
                            </div>
                          )}
                          {log.table_name === "enrollees" && log.old_data && !log.new_data && (
                            <div className="text-muted-foreground truncate max-w-md">
                              {getEnrolleeInfo(log.old_data)}
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                      {expandedRows.has(log.id) && (
                        <TableRow>
                          <TableCell colSpan={6} className="bg-muted/30">
                            <div className="p-4 space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {log.record_id && (
                                  <div>
                                    <Label className="text-xs font-semibold">Record ID</Label>
                                    <p className="font-mono text-xs text-muted-foreground break-all">{log.record_id}</p>
                                  </div>
                                )}
                                {log.old_data && (
                                  <div>
                                    <Label className="text-xs font-semibold">Previous Data</Label>
                                    <pre className="mt-1 p-2 bg-background rounded text-xs overflow-auto max-h-40">
                                      {JSON.stringify(log.old_data, null, 2)}
                                    </pre>
                                  </div>
                                )}
                                {log.new_data && (
                                  <div>
                                    <Label className="text-xs font-semibold">New Data</Label>
                                    <pre className="mt-1 p-2 bg-background rounded text-xs overflow-auto max-h-40">
                                      {JSON.stringify(log.new_data, null, 2)}
                                    </pre>
                                  </div>
                                )}
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </Fragment>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="text-sm text-muted-foreground">
            Showing {filteredLogs.length} of {logs.length} audit logs
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
