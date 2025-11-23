import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LogOut, Users, UserPlus, CreditCard, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import hicLogo from "@/assets/hic-logo.png";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, userRole, signOut } = useAuth();
  const navigate = useNavigate();
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    fetchPendingCount();
    const interval = setInterval(fetchPendingCount, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchPendingCount = async () => {
    try {
      const { count, error } = await supabase
        .from("enrollees")
        .select("*", { count: "exact", head: true })
        .eq("payment_status", "pending");

      if (!error && count !== null) {
        setPendingCount(count);
      }
    } catch (error) {
      console.error("Error fetching pending count:", error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img 
                src={hicLogo} 
                alt="Health Insurance Commission Logo" 
                className="h-12 w-auto object-contain"
              />
              <div>
                <h1 className="text-xl font-bold text-foreground">
                  Health Insurance Commission
                </h1>
                <p className="text-xs text-muted-foreground">
                  Enrollee Management System
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {user && (
                <>
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-medium">{user.email}</p>
                    <p className="text-xs text-muted-foreground capitalize">{userRole}</p>
                  </div>
                  <Button onClick={() => signOut()} variant="outline" size="sm">
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>
      
      <nav className="border-b bg-card">
        <div className="container mx-auto px-4">
          <div className="flex gap-1">
            <Button
              variant="ghost"
              onClick={() => navigate("/")}
              className="rounded-none border-b-2 border-transparent hover:border-primary"
            >
              <Users className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
            {user && userRole !== "viewer" && (
              <>
                <Button
                  variant="ghost"
                  onClick={() => navigate("/enroll")}
                  className="rounded-none border-b-2 border-transparent hover:border-primary"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  New Enrollee
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => navigate("/payment-verification")}
                  className="rounded-none border-b-2 border-transparent hover:border-primary relative"
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Payment Verification
                  {pendingCount > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="ml-2 h-5 min-w-5 flex items-center justify-center rounded-full px-1 text-xs"
                    >
                      {pendingCount}
                    </Badge>
                  )}
                </Button>
              </>
            )}
            {userRole === "admin" && (
              <>
                <Button
                  variant="ghost"
                  onClick={() => navigate("/users")}
                  className="rounded-none border-b-2 border-transparent hover:border-primary"
                >
                  <Users className="h-4 w-4 mr-2" />
                  User Management
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => navigate("/audit-logs")}
                  className="rounded-none border-b-2 border-transparent hover:border-primary"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Audit Logs
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
}
