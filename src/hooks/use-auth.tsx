import { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

type UserRole = "admin" | "staff" | "viewer";
type UserType = "freelancer" | "client" | "admin";

interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  avatar_url?: string;
  bio?: string;
  location?: { city?: string; state?: string };
  verification_status?: "verified" | "pending" | "unverified";
  user_type?: UserType;
  created_at?: string;
  updated_at?: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userRole: UserRole | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  hasRole: (role: string) => boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if Supabase is properly configured
    const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
    if (!SUPABASE_URL) {
      console.warn("Supabase not configured. Authentication features will be disabled.");
      setLoading(false);
      return;
    }

    let subscription: { unsubscribe: () => void } | null = null;
    
    try {
      const { data: { subscription: sub } } = supabase.auth.onAuthStateChange(
        (event, session) => {
          setSession(session);
          setUser(session?.user ?? null);
          
          if (session?.user) {
            // Log authentication events
            if (event === "SIGNED_IN") {
              setTimeout(async () => {
                try {
                  const { error } = await supabase.from("audit_logs").insert([{
                    user_id: session.user.id,
                    action: "login",
                    table_name: "auth",
                    record_id: null,
                  }]);
                  if (error) console.error("Failed to log login:", error);
                } catch (error) {
                  console.error("Error logging login:", error);
                }
              }, 0);
            }

            setTimeout(() => {
              fetchUserRole(session.user.id);
              fetchProfile(session.user.id);
            }, 0);
          } else {
            setUserRole(null);
            setProfile(null);
          }
        }
      );
      subscription = sub;

      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          fetchUserRole(session.user.id);
          fetchProfile(session.user.id);
        } else {
          setLoading(false);
        }
      }).catch((error) => {
        console.error("Error getting session:", error);
        setLoading(false);
      });
    } catch (error) {
      console.error("Error initializing auth:", error);
      setLoading(false);
    }

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  const fetchUserRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
      setUserRole(data?.role as UserRole || null);
    } catch (error) {
      console.error("Error fetching user role:", error);
      setUserRole(null);
    }
  };

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setProfile(data as Profile);
      } else {
        // Profile doesn't exist yet - create a basic one
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: newProfile, error: insertError } = await supabase
            .from("profiles")
            .insert([{
              id: user.id,
              full_name: user.email?.split("@")[0] || "User",
              email: user.email,
            }])
            .select()
            .single();
          
          if (!insertError && newProfile) {
            setProfile(newProfile as Profile);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  const signOut = async () => {
    // Log logout action
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("audit_logs").insert([{
          user_id: user.id,
          action: "logout",
          table_name: "auth",
          record_id: null,
        }]);
      }
    } catch (error) {
      console.error("Failed to log logout action:", error);
    }

    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setUserRole(null);
    setProfile(null);
    navigate("/");
  };

  const hasRole = (role: string) => {
    return userRole === role;
  };

  return (
    <AuthContext.Provider value={{ user, session, userRole, profile, loading, signOut, hasRole, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
