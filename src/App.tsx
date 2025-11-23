import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/use-auth";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import Home from "./pages/Home";
import Browse from "./pages/Browse";
import GigDetail from "./pages/GigDetail";
import Profile from "./pages/Profile";
import CreateGig from "./pages/CreateGig";
import FreelancerDashboard from "./pages/FreelancerDashboard";
import ClientOrders from "./pages/ClientOrders";
import PostJob from "./pages/PostJob";
import Settings from "./pages/Settings";
import Messages from "./pages/Messages";
import Earnings from "./pages/Earnings";
import UserManagement from "./pages/UserManagement";
import AuditLogs from "./pages/AuditLogs";
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
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/browse" element={<MarketplaceLayout><Browse /></MarketplaceLayout>} />
            <Route path="/gig/:slug" element={<MarketplaceLayout><GigDetail /></MarketplaceLayout>} />
            
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
              path="/post-job"
              element={
                <ProtectedRoute>
                  <MarketplaceLayout>
                    <PostJob />
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
            
            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
