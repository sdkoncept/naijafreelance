import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (error) throw error;

        if (data.session?.user) {
          const user = data.session.user;
          const pendingUserType = sessionStorage.getItem("pending_user_type");
          const pendingFullName = sessionStorage.getItem("pending_full_name");

          // Check if profile exists
          const { data: existingProfile } = await supabase
            .from("profiles")
            .select("id, user_type")
            .eq("id", user.id)
            .single();

          if (!existingProfile) {
            // Create profile for new user
            const profileData: any = {
              id: user.id,
              email: user.email || "",
              full_name: pendingFullName || user.user_metadata?.full_name || user.email?.split("@")[0] || "User",
            };

            if (pendingUserType) {
              profileData.user_type = pendingUserType;
            }

            const { error: profileError } = await supabase
              .from("profiles")
              .insert(profileData);

            if (profileError) {
              console.error("Error creating profile:", profileError);
              toast.error("Account created but profile setup failed. Please complete your profile.");
            } else {
              toast.success("Account created successfully!");
            }
          } else if (pendingUserType && !existingProfile.user_type) {
            // Update user type if it was set during signup
            await supabase
              .from("profiles")
              .update({ user_type: pendingUserType })
              .eq("id", user.id);
          }

          // Clean up session storage
          sessionStorage.removeItem("pending_user_type");
          sessionStorage.removeItem("pending_full_name");

          toast.success("Signed in successfully!");
          navigate("/");
        } else {
          navigate("/auth");
        }
      } catch (error: any) {
        console.error("Error handling auth callback:", error);
        toast.error("Authentication failed: " + error.message);
        navigate("/auth");
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-4"></div>
        <p className="text-gray-600">Completing sign in...</p>
      </div>
    </div>
  );
}

