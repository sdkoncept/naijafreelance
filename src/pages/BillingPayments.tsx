import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { X, ChevronDown, Search, Download, FileText, Check } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";

interface BillingInfo {
  full_name: string;
  company_name: string;
  country: string;
  state_region: string;
  address: string;
  city: string;
  postal_code: string;
  tax_id: string;
}

export default function BillingPayments() {
  const { user, profile, userRole } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("billing-history");
  const [dateRange, setDateRange] = useState("");
  const [document, setDocument] = useState("");
  const [currency, setCurrency] = useState("");
  const [billingInfo, setBillingInfo] = useState<BillingInfo>({
    full_name: "",
    company_name: "",
    country: "Nigeria",
    state_region: "",
    address: "",
    city: "",
    postal_code: "",
    tax_id: "",
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

  // Load billing info
  useEffect(() => {
    if (user?.id && activeTab === "billing-info") {
      fetchBillingInfo();
    }
  }, [user?.id, activeTab]);

  const fetchBillingInfo = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("billing_info")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setBillingInfo({
          full_name: data.full_name || "",
          company_name: data.company_name || "",
          country: data.country || "Nigeria",
          state_region: data.state_region || "",
          address: data.address || "",
          city: data.city || "",
          postal_code: data.postal_code || "",
          tax_id: data.tax_id || "",
        });
      } else {
        // Initialize with profile data
        setBillingInfo({
          full_name: profile?.full_name || "",
          company_name: "",
          country: "Nigeria",
          state_region: "",
          address: "",
          city: "",
          postal_code: "",
          tax_id: "",
        });
      }
    } catch (error: any) {
      console.error("Error fetching billing info:", error);
      toast.error("Failed to load billing information");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user?.id) return;

    if (!billingInfo.full_name.trim()) {
      toast.error("Full name is required");
      return;
    }

    if (!billingInfo.country.trim()) {
      toast.error("Country is required");
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from("billing_info")
        .upsert({
          user_id: user.id,
          full_name: billingInfo.full_name.trim(),
          company_name: billingInfo.company_name.trim() || null,
          country: billingInfo.country.trim(),
          state_region: billingInfo.state_region.trim() || null,
          address: billingInfo.address.trim() || null,
          city: billingInfo.city.trim() || null,
          postal_code: billingInfo.postal_code.trim() || null,
          tax_id: billingInfo.tax_id.trim() || null,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: "user_id",
        });

      if (error) throw error;

      toast.success("Billing information saved successfully");
    } catch (error: any) {
      console.error("Error saving billing info:", error);
      toast.error("Failed to save billing information: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  // Check if user is client or admin
  if (!user) {
    navigate("/auth");
    return null;
  }

  const isClient = profile?.user_type === "client";
  const isAdmin = userRole === "admin";

  if (!isClient && !isAdmin) {
    toast.error("This page is for clients only");
    navigate("/");
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
          Billing and payments
        </h1>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto bg-gray-100">
          <TabsTrigger 
            value="billing-history" 
            className="data-[state=active]:bg-gray-800 data-[state=active]:text-white"
          >
            Billing history
          </TabsTrigger>
          <TabsTrigger 
            value="billing-info"
            className="data-[state=active]:bg-gray-800 data-[state=active]:text-white"
          >
            Billing info
          </TabsTrigger>
          <TabsTrigger 
            value="balances"
            className="data-[state=active]:bg-gray-800 data-[state=active]:text-white"
          >
            Balances
          </TabsTrigger>
          <TabsTrigger 
            value="payment-methods"
            className="data-[state=active]:bg-gray-800 data-[state=active]:text-white"
          >
            Payment methods
          </TabsTrigger>
        </TabsList>

        {/* Billing History Tab */}
        <TabsContent value="billing-history" className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Billing history</h2>
            
            {/* Filters and Search Section */}
            <div className="flex flex-col lg:flex-row gap-4 mb-4">
              {/* Left side - Filters */}
              <div className="flex flex-wrap gap-4 flex-1">
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger className="w-full sm:w-[180px] h-11 bg-white border-gray-300">
                    <SelectValue placeholder="Date range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">This week</SelectItem>
                    <SelectItem value="month">This month</SelectItem>
                    <SelectItem value="quarter">This quarter</SelectItem>
                    <SelectItem value="year">This year</SelectItem>
                    <SelectItem value="custom">Custom range</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={document} onValueChange={setDocument}>
                  <SelectTrigger className="w-full sm:w-[180px] h-11 bg-white border-gray-300">
                    <SelectValue placeholder="Document" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All documents</SelectItem>
                    <SelectItem value="invoice">Invoices</SelectItem>
                    <SelectItem value="receipt">Receipts</SelectItem>
                    <SelectItem value="statement">Statements</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger className="w-full sm:w-[180px] h-11 bg-white border-gray-300">
                    <SelectValue placeholder="Currency" />
                    {currency && currency !== "all" && (
                      <Check className="h-4 w-4 ml-2 text-primary" />
                    )}
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All currencies</SelectItem>
                    <SelectItem value="NGN">NGN (₦)</SelectItem>
                    <SelectItem value="USD">USD ($)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Right side - Search and Download */}
              <div className="flex flex-col gap-3 lg:items-end">
                <div className="relative w-full lg:w-[300px]">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search by invoice or order number"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-11 bg-white border-gray-300"
                  />
                </div>
                <button
                  onClick={() => toast.info("Download report feature coming soon")}
                  className="flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900 transition-colors self-start lg:self-auto"
                >
                  <Download className="h-4 w-4" />
                  Download report
                </button>
              </div>
            </div>

            {/* Results Count */}
            <p className="text-sm text-gray-600 mb-4">Showing 0 results.</p>

            {/* Divider */}
            <div className="border-t border-gray-200 mb-4"></div>

            {/* Table */}
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={selectedRows.size > 0}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              // Select all (when we have data)
                              setSelectedRows(new Set());
                            } else {
                              setSelectedRows(new Set());
                            }
                          }}
                        />
                      </TableHead>
                      <TableHead className="font-semibold text-gray-900">Date</TableHead>
                      <TableHead className="font-semibold text-gray-900">Document</TableHead>
                      <TableHead className="font-semibold text-gray-900">Service</TableHead>
                      <TableHead className="font-semibold text-gray-900">Order</TableHead>
                      <TableHead className="font-semibold text-gray-900">Currency</TableHead>
                      <TableHead className="font-semibold text-gray-900">Total</TableHead>
                      <TableHead className="font-semibold text-gray-900">PDF</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {/* Empty state - will show when no data */}
                  </TableBody>
                </Table>

                {/* Empty State */}
                <div className="py-16 px-6 text-center">
                  <div className="max-w-md mx-auto">
                    {/* Illustration - minimalist design matching screenshot */}
                    <div className="mb-8 flex items-center justify-center">
                      <div className="relative w-72 h-56 flex items-center justify-center">
                        {/* Person on left */}
                        <div className="absolute left-0 flex flex-col items-center">
                          {/* Head */}
                          <div className="w-12 h-12 rounded-full bg-gray-800 mb-2"></div>
                          {/* Torso */}
                          <div className="w-16 h-20 bg-gray-800 rounded-t-lg"></div>
                          {/* Arms raised */}
                          <div className="absolute -top-2 left-0 right-0 flex justify-between">
                            <div className="w-2 h-8 bg-gray-800 rounded-full rotate-45 origin-bottom"></div>
                            <div className="w-2 h-8 bg-gray-800 rounded-full -rotate-45 origin-bottom"></div>
                          </div>
                        </div>
                        
                        {/* Documents floating */}
                        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                          <div className="w-6 h-8 bg-gray-300 rounded-sm rotate-12"></div>
                          <div className="w-6 h-8 bg-gray-300 rounded-sm -rotate-12"></div>
                          <div className="w-6 h-8 bg-gray-300 rounded-sm rotate-6"></div>
                        </div>
                        
                        {/* Purple dot */}
                        <div className="absolute top-8 right-20 w-3 h-3 bg-purple-500 rounded-full"></div>
                        
                        {/* Computer on right */}
                        <div className="absolute right-0 flex flex-col items-center">
                          {/* Monitor */}
                          <div className="w-20 h-16 bg-gray-800 rounded-lg mb-2 relative">
                            {/* Screen */}
                            <div className="w-16 h-12 bg-gray-100 rounded absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                              {/* Hand reaching out */}
                              <div className="absolute -right-2 top-1/2 transform -translate-y-1/2">
                                <div className="w-3 h-6 bg-gray-800 rounded-full"></div>
                              </div>
                            </div>
                          </div>
                          {/* Stand */}
                          <div className="w-12 h-2 bg-gray-800 rounded"></div>
                          {/* Base */}
                          <div className="w-16 h-1 bg-gray-800 rounded mt-1"></div>
                        </div>
                        
                        {/* Plant */}
                        <div className="absolute right-8 bottom-0">
                          <div className="w-4 h-6 bg-green-600 rounded-t-full"></div>
                          <div className="w-6 h-2 bg-gray-700 rounded-full mx-auto -mt-1"></div>
                        </div>
                      </div>
                    </div>
                    
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">No invoices yet...</h3>
                    <p className="text-gray-600 mb-6">
                      Ready to place an order? Make sure{" "}
                      <button
                        onClick={() => setActiveTab("billing-info")}
                        className="underline font-medium text-gray-900 hover:text-primary"
                      >
                        your billing info
                      </button>{" "}
                      is up to date.
                    </p>
                    <Button
                      onClick={() => navigate("/browse")}
                      className="bg-primary hover:bg-primary/90 text-white px-8"
                    >
                      Explore
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Billing Info Tab */}
        <TabsContent value="billing-info" className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Billing information</h2>
            <Card>
              <CardContent className="p-6">
                {loading ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600">Loading billing information...</p>
                  </div>
                ) : (
                  <div className="space-y-6 max-w-2xl">
                    {/* Full name */}
                    <div className="space-y-2">
                      <Label htmlFor="full_name" className="text-sm font-medium text-gray-700">
                        Full name
                      </Label>
                      <Input
                        id="full_name"
                        value={billingInfo.full_name}
                        onChange={(e) => setBillingInfo({ ...billingInfo, full_name: e.target.value })}
                        className="h-11 bg-white border-gray-300"
                        placeholder="Enter your full name"
                      />
                    </div>

                    {/* Company name */}
                    <div className="space-y-2">
                      <Label htmlFor="company_name" className="text-sm font-medium text-gray-700">
                        Company name
                      </Label>
                      <Input
                        id="company_name"
                        value={billingInfo.company_name}
                        onChange={(e) => setBillingInfo({ ...billingInfo, company_name: e.target.value })}
                        className="h-11 bg-white border-gray-300"
                        placeholder="Enter company name (optional)"
                      />
                    </div>

                    {/* Country */}
                    <div className="space-y-2">
                      <Label htmlFor="country" className="text-sm font-medium text-gray-700">
                        Country
                      </Label>
                      <Select
                        value={billingInfo.country}
                        onValueChange={(value) => setBillingInfo({ ...billingInfo, country: value })}
                      >
                        <SelectTrigger className="h-11 bg-white border-gray-300">
                          <SelectValue placeholder="Select country" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Nigeria">Nigeria</SelectItem>
                          <SelectItem value="Ghana">Ghana</SelectItem>
                          <SelectItem value="Kenya">Kenya</SelectItem>
                          <SelectItem value="South Africa">South Africa</SelectItem>
                          <SelectItem value="United States">United States</SelectItem>
                          <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                          <SelectItem value="Canada">Canada</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* State/Region */}
                    <div className="space-y-2">
                      <Label htmlFor="state_region" className="text-sm font-medium text-gray-700">
                        State/Region
                      </Label>
                      <Input
                        id="state_region"
                        value={billingInfo.state_region}
                        onChange={(e) => setBillingInfo({ ...billingInfo, state_region: e.target.value })}
                        className="h-11 bg-white border-gray-300"
                        placeholder="Enter state or region"
                      />
                    </div>

                    {/* Address */}
                    <div className="space-y-2">
                      <Label htmlFor="address" className="text-sm font-medium text-gray-700">
                        Address
                      </Label>
                      <Input
                        id="address"
                        value={billingInfo.address}
                        onChange={(e) => setBillingInfo({ ...billingInfo, address: e.target.value })}
                        className="h-11 bg-white border-gray-300"
                        placeholder="Street or POB"
                      />
                    </div>

                    {/* City */}
                    <div className="space-y-2">
                      <Label htmlFor="city" className="text-sm font-medium text-gray-700">
                        City
                      </Label>
                      <Input
                        id="city"
                        value={billingInfo.city}
                        onChange={(e) => setBillingInfo({ ...billingInfo, city: e.target.value })}
                        className="h-11 bg-white border-gray-300"
                        placeholder="Enter city"
                      />
                    </div>

                    {/* Postal code */}
                    <div className="space-y-2">
                      <Label htmlFor="postal_code" className="text-sm font-medium text-gray-700">
                        Postal code
                      </Label>
                      <Input
                        id="postal_code"
                        value={billingInfo.postal_code}
                        onChange={(e) => setBillingInfo({ ...billingInfo, postal_code: e.target.value })}
                        className="h-11 bg-white border-gray-300"
                        placeholder="Enter postal code"
                      />
                    </div>

                    {/* Tax ID */}
                    <div className="space-y-2">
                      <Label htmlFor="tax_id" className="text-sm font-medium text-gray-700">
                        Tax ID
                      </Label>
                      <Input
                        id="tax_id"
                        value={billingInfo.tax_id}
                        onChange={(e) => setBillingInfo({ ...billingInfo, tax_id: e.target.value })}
                        className="h-11 bg-white border-gray-300"
                        placeholder="Enter tax ID (optional)"
                      />
                    </div>

                    {/* Save Button */}
                    <div className="pt-4">
                      <Button
                        onClick={handleSave}
                        disabled={saving}
                        className="bg-primary hover:bg-primary/90"
                      >
                        {saving ? "Saving..." : "Save Billing Information"}
                      </Button>
                    </div>

                    {/* Invoices Section */}
                    <div className="pt-6 border-t border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Invoices</h3>
                      <p className="text-sm text-gray-600">
                        You will find your invoices under the{" "}
                        <button
                          onClick={() => setActiveTab("billing-history")}
                          className="font-semibold text-gray-900 hover:underline"
                        >
                          Billing history tab.
                        </button>
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Balances Tab */}
        <TabsContent value="balances" className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Balances</h2>
            
            {/* Balance Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-gray-600">Available Credits</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-gray-900">₦0.00</p>
                  <p className="text-xs text-gray-500 mt-1">Referral credits & refunds</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-gray-600">Referral Credits</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-green-600">₦0.00</p>
                  <p className="text-xs text-gray-500 mt-1">From referrals</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-gray-600">Refunds</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-blue-600">₦0.00</p>
                  <p className="text-xs text-gray-500 mt-1">From cancelled orders</p>
                </CardContent>
              </Card>
            </div>

            {/* Balance History */}
            <Card>
              <CardHeader>
                <CardTitle>Balance History</CardTitle>
                <CardDescription>Track your referral credits and refunds</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <p className="text-gray-600 mb-2">No balance history yet</p>
                  <p className="text-sm text-gray-500">
                    Refer friends to earn credits, or receive refunds from cancelled orders
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Referral Info */}
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-2">💰 Earn Referral Credits</h3>
                <p className="text-sm text-gray-700 mb-4">
                  Share your referral link and earn credits when friends sign up and make their first purchase!
                </p>
                <div className="flex items-center gap-4">
                  <Input
                    value={`${window.location.origin}/signup?ref=${user?.id}`}
                    readOnly
                    className="flex-1 bg-white"
                  />
                  <Button
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/signup?ref=${user?.id}`);
                      toast.success("Referral link copied!");
                    }}
                    variant="outline"
                  >
                    Copy Link
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Payment Methods Tab */}
        <TabsContent value="payment-methods" className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Payment methods</h2>
            
            {/* Saved Payment Methods */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="text-center py-12">
                  <p className="text-gray-600 mb-4">No payment methods saved</p>
                  <p className="text-sm text-gray-500 mb-6">
                    Add a payment method to make checkout faster and more secure
                  </p>
                  <Button
                    onClick={() => {
                      // This will open Paystack inline form
                      toast.info("Payment method saving will be integrated with Paystack. For security, card details are tokenized and never stored on our servers.");
                    }}
                    className="bg-primary hover:bg-primary/90"
                  >
                    Add Payment Method
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Security Notice */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-2">🔒 Security & Privacy</h3>
                <ul className="text-sm text-gray-700 space-y-2 list-disc list-inside">
                  <li>Card details are <strong>never stored</strong> on our servers</li>
                  <li>All payment data is <strong>tokenized</strong> by Paystack (PCI DSS compliant)</li>
                  <li>Only the last 4 digits and card brand are stored for display</li>
                  <li>Your payment information is encrypted and secure</li>
                  <li>You can remove saved payment methods at any time</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}



