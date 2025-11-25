import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/use-auth";
import Auth from "./pages/Auth";
import AuthCallback from "./pages/AuthCallback";
import ResetPassword from "./pages/ResetPassword";
import Home from "./pages/Home";
import Browse from "./pages/Browse";
import GigDetail from "./pages/GigDetail";
import OrderDetail from "./pages/OrderDetail";
import PaymentCallback from "./pages/PaymentCallback";
import Jobs from "./pages/Jobs";
import JobDetail from "./pages/JobDetail";
import JobApplications from "./pages/JobApplications";
import Profile from "./pages/Profile";
import CreateGig from "./pages/CreateGig";
import FreelancerDashboard from "./pages/FreelancerDashboard";
import ClientOrders from "./pages/ClientOrders";
import MyGigs from "./pages/MyGigs";
import PostJob from "./pages/PostJob";
import BillingPayments from "./pages/BillingPayments";
import Settings from "./pages/Settings";
import Messages from "./pages/Messages";
import Earnings from "./pages/Earnings";
import UserManagement from "./pages/UserManagement";
import AuditLogs from "./pages/AuditLogs";
import DisputeCenter from "./pages/DisputeCenter";
import PaystackTest from "./pages/PaystackTest";
import HowItWorks from "./pages/HowItWorks";
import HelpCenter from "./pages/HelpCenter";
import ContactUs from "./pages/ContactUs";
import TermsOfService from "./pages/TermsOfService";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Community from "./pages/Community";
import Notifications from "./pages/Notifications";
import LogoCreator from "./pages/LogoCreator";
import ProtectedRoute from "./components/ProtectedRoute";
import MarketplaceLayout from "./components/MarketplaceLayout";
import NotFound from "./pages/NotFound";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const queryClient = new QueryClient();

// Check for missing environment variables
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const hasMissingEnvVars = !SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY;

const EnvErrorBanner = () => {
  if (!hasMissingEnvVars) return null;
  
  return (
    <div className="fixed top-0 left-0 right-0 z-50 p-4">
      <Alert variant="destructive" className="max-w-4xl mx-auto">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Missing Environment Variables</AlertTitle>
        <AlertDescription>
          <p className="mb-2">The following Supabase environment variables are missing:</p>
          <ul className="list-disc list-inside mb-2">
            {!SUPABASE_URL && <li>VITE_SUPABASE_URL</li>}
            {!SUPABASE_PUBLISHABLE_KEY && <li>VITE_SUPABASE_PUBLISHABLE_KEY</li>}
          </ul>
          <p className="text-sm">
            Please create a <code className="bg-gray-800 px-1 rounded">.env</code> file in the project root with these variables.
          </p>
        </AlertDescription>
      </Alert>
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <EnvErrorBanner />
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <AuthProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<MarketplaceLayout><Home /></MarketplaceLayout>} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/browse" element={<MarketplaceLayout><Browse /></MarketplaceLayout>} />
            <Route path="/gig/:slug" element={<MarketplaceLayout><GigDetail /></MarketplaceLayout>} />
            <Route path="/jobs" element={<MarketplaceLayout><Jobs /></MarketplaceLayout>} />
            <Route path="/job/:slug" element={<MarketplaceLayout><JobDetail /></MarketplaceLayout>} />
            <Route
              path="/job/:slug/applications"
              element={
                <ProtectedRoute>
                  <MarketplaceLayout>
                    <JobApplications />
                  </MarketplaceLayout>
                </ProtectedRoute>
              }
            />
            <Route path="/payment/callback" element={<PaymentCallback />} />
            <Route path="/paystack-test" element={<MarketplaceLayout><PaystackTest /></MarketplaceLayout>} />
            
            {/* Public Information Pages */}
            <Route path="/how-it-works" element={<MarketplaceLayout><HowItWorks /></MarketplaceLayout>} />
            <Route path="/help" element={<MarketplaceLayout><HelpCenter /></MarketplaceLayout>} />
            <Route path="/contact" element={<MarketplaceLayout><ContactUs /></MarketplaceLayout>} />
            <Route path="/terms" element={<MarketplaceLayout><TermsOfService /></MarketplaceLayout>} />
            <Route path="/privacy" element={<MarketplaceLayout><PrivacyPolicy /></MarketplaceLayout>} />
            
            {/* Protected Routes */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <MarketplaceLayout>
                    <Profile />
                  </MarketplaceLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <MarketplaceLayout>
                    <Settings />
                  </MarketplaceLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/messages"
              element={
                <ProtectedRoute>
                  <MarketplaceLayout>
                    <Messages />
                  </MarketplaceLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/notifications"
              element={
                <ProtectedRoute>
                  <MarketplaceLayout>
                    <Notifications />
                  </MarketplaceLayout>
                </ProtectedRoute>
              }
            />
            
            {/* Freelancer Routes */}
            <Route
              path="/freelancer/dashboard"
              element={
                <ProtectedRoute>
                  <MarketplaceLayout>
                    <FreelancerDashboard />
                  </MarketplaceLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/freelancer/gigs/create"
              element={
                <ProtectedRoute>
                  <MarketplaceLayout>
                    <CreateGig />
                  </MarketplaceLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/freelancer/earnings"
              element={
                <ProtectedRoute>
                  <MarketplaceLayout>
                    <Earnings />
                  </MarketplaceLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/community"
              element={
                <ProtectedRoute>
                  <MarketplaceLayout>
                    <Community />
                  </MarketplaceLayout>
                </ProtectedRoute>
              }
            />
            
            {/* Client Routes */}
            <Route
              path="/client/orders"
              element={
                <ProtectedRoute>
                  <MarketplaceLayout>
                    <ClientOrders />
                  </MarketplaceLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-gigs"
              element={
                <ProtectedRoute>
                  <MarketplaceLayout>
                    <MyGigs />
                  </MarketplaceLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/order/:id"
              element={
                <ProtectedRoute>
                  <MarketplaceLayout>
                    <OrderDetail />
                  </MarketplaceLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/post-job"
              element={
                <ProtectedRoute>
                  <MarketplaceLayout>
                    <PostJob />
                  </MarketplaceLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/client/billing"
              element={
                <ProtectedRoute>
                  <MarketplaceLayout>
                    <BillingPayments />
                  </MarketplaceLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/logo-creator"
              element={
                <ProtectedRoute>
                  <MarketplaceLayout>
                    <LogoCreator />
                  </MarketplaceLayout>
                </ProtectedRoute>
              }
            />
            
            {/* Admin Routes */}
            <Route
              path="/users"
              element={
                <ProtectedRoute>
                  <MarketplaceLayout>
                    <UserManagement />
                  </MarketplaceLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/audit-logs"
              element={
                <ProtectedRoute>
                  <MarketplaceLayout>
                    <AuditLogs />
                  </MarketplaceLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/disputes"
              element={
                <ProtectedRoute>
                  <MarketplaceLayout>
                    <DisputeCenter />
                  </MarketplaceLayout>
                </ProtectedRoute>
              }
            />
            
            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
