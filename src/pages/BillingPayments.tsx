import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function BillingPayments() {
  const { user, profile, userRole } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("billing-history");
  const [dateRange, setDateRange] = useState("");
  const [document, setDocument] = useState("");
  const [currency, setCurrency] = useState("");

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
            
            {/* Filters */}
            <div className="flex flex-wrap gap-4 mb-6">
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
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All currencies</SelectItem>
                  <SelectItem value="NGN">NGN (₦)</SelectItem>
                  <SelectItem value="USD">USD ($)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Billing History Content */}
            <Card>
              <CardContent className="p-6">
                <div className="text-center py-12">
                  <p className="text-gray-600">No billing history available yet</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Your payment history will appear here once you make your first order
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Billing Info Tab */}
        <TabsContent value="billing-info" className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Billing info</h2>
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Billing Name</label>
                    <p className="text-gray-900 mt-1">{profile?.full_name || "Not set"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Email</label>
                    <p className="text-gray-900 mt-1">{profile?.email || "Not set"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Billing Address</label>
                    <p className="text-gray-900 mt-1">Not set</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Balances Tab */}
        <TabsContent value="balances" className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Balances</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-gray-600">Available Balance</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-gray-900">₦0.00</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-gray-600">Pending</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-gray-900">₦0.00</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-gray-600">Total Spent</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-gray-900">₦0.00</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Payment Methods Tab */}
        <TabsContent value="payment-methods" className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Payment methods</h2>
            <Card>
              <CardContent className="p-6">
                <div className="text-center py-12">
                  <p className="text-gray-600">No payment methods saved</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Add a payment method to make checkout faster
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}


