import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { z } from "zod";
import { PasswordStrengthMeter } from "@/components/PasswordStrengthMeter";
import { Briefcase, ShoppingBag } from "lucide-react";

const strongPasswordSchema = z.string()
  .min(8, { message: "Password must be at least 8 characters" })
  .max(72)
  .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
  .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
  .regex(/[0-9]/, { message: "Password must contain at least one number" })
  .regex(/[^A-Za-z0-9]/, { message: "Password must contain at least one special character" });

const authSchema = z.object({
  email: z.string().trim().email({ message: "Please enter a valid email address" }).max(255),
  password: z.string(),
  confirmPassword: z.string().optional(),
  fullName: z.string().trim().min(2, { message: "Full name is required" }).max(100).optional(),
}).refine((data) => {
  if (!data.confirmPassword) return true;
  return data.password === data.confirmPassword;
}, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [userType, setUserType] = useState<"freelancer" | "client" | "">("");
  const [resetEmail, setResetEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [isPasswordStrong, setIsPasswordStrong] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/");
      }
    });
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate strong password for signup
      if (!isLogin) {
        try {
          strongPasswordSchema.parse(password);
        } catch (err) {
          if (err instanceof z.ZodError) {
            toast.error(err.errors[0].message);
            return;
          }
        }

        if (!isPasswordStrong) {
          toast.error("Please choose a stronger password");
          return;
        }
      }

      const validatedData = authSchema.parse({
        email,
        password,
        confirmPassword: isLogin ? undefined : confirmPassword,
        fullName: isLogin ? undefined : fullName,
      });

      // Validate user type for signup
      if (!isLogin && !userType) {
        toast.error("Please select whether you want to offer services or hire freelancers");
        setLoading(false);
        return;
      }

      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email: validatedData.email,
          password: validatedData.password,
        });

        if (error) {
          // Log failed login attempt to audit logs with masked email for security
          const emailDomain = validatedData.email.split('@')[1] || 'unknown';
          await supabase.from('audit_logs').insert({
            user_id: null,
            action: 'login_failed',
            table_name: 'auth',
            new_data: {
              email_domain: emailDomain, // Only log domain, not full email
              error_message: error.message,
              timestamp: new Date().toISOString(),
            },
          });

          if (error.message.includes("Invalid login credentials")) {
            toast.error("Invalid email or password");
          } else {
            toast.error(error.message);
          }
          return;
        }

        toast.success("Logged in successfully");
        navigate("/");
      } else {
        const { data: signUpData, error } = await supabase.auth.signUp({
          email: validatedData.email,
          password: validatedData.password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: {
              full_name: validatedData.fullName,
            },
          },
        });

        if (error) {
          if (error.message.includes("already registered")) {
            toast.error("This email is already registered. Please log in instead.");
          } else {
            toast.error(error.message);
          }
          return;
        }

        // Update profile with user type
        if (signUpData.user) {
          const { error: profileError } = await supabase
            .from("profiles")
            .update({ user_type: userType } as any)
            .eq("id", signUpData.user.id);

          if (profileError) {
            console.error("Error updating profile with user type:", profileError);
            // Continue anyway - user can set it in profile later
          }

          // Log signup action
          try {
            await supabase.from("audit_logs").insert([{
              user_id: signUpData.user.id,
              action: "signup",
              table_name: "auth",
              record_id: null,
              new_data: { 
                email: validatedData.email, 
                full_name: validatedData.fullName,
                user_type: userType 
              },
            }]);
          } catch (logError) {
            // Audit log might fail, but don't block signup
            console.error("Error logging signup:", logError);
          }
        }

        toast.success("Account created successfully! You can now log in.");
        setIsLogin(true);
        // Reset form
        setFullName("");
        setUserType("");
        setPassword("");
        setConfirmPassword("");
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        toast.error("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetLoading(true);

    try {
      const emailSchema = z.string().trim().email({ message: "Please enter a valid email address" });
      const validatedEmail = emailSchema.parse(resetEmail);

      const { error } = await supabase.auth.resetPasswordForEmail(validatedEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success("Password reset email sent! Please check your inbox.");
      setShowForgotPassword(false);
      setResetEmail("");
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        toast.error("An unexpected error occurred");
      }
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-gray-50 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-slate-600 to-slate-700 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <CardTitle className="text-xl sm:text-2xl font-bold text-center">
              NaijaFreelance
            </CardTitle>
          </div>
          <CardDescription className="text-center">
            {isLogin ? "Sign in to your account" : "Create a new account to get started"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {showForgotPassword ? (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="resetEmail">Email</Label>
                <Input
                  id="resetEmail"
                  type="email"
                  placeholder="you@example.com"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  required
                  maxLength={255}
                />
              </div>
              <Button type="submit" className="w-full" disabled={resetLoading}>
                {resetLoading ? "Sending..." : "Send Reset Email"}
              </Button>
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotPassword(false);
                    setResetEmail("");
                  }}
                  className="text-sm text-muted-foreground hover:text-primary"
                >
                  Back to login
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="John Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required={!isLogin}
                      maxLength={100}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="userType">I want to *</Label>
                    <div className="grid grid-cols-2 gap-2 sm:gap-3">
                      <button
                        type="button"
                        onClick={() => setUserType("freelancer")}
                        className={`p-3 sm:p-4 border-2 rounded-lg transition-all text-left ${
                          userType === "freelancer"
                            ? "border-slate-600 bg-slate-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <Briefcase className={`h-4 w-4 sm:h-5 sm:w-5 mb-1 sm:mb-2 ${userType === "freelancer" ? "text-slate-600" : "text-gray-400"}`} />
                        <div className="font-medium text-sm sm:text-base">Offer Services</div>
                        <div className="text-xs text-gray-500 mt-1">I'm a freelancer</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setUserType("client")}
                        className={`p-3 sm:p-4 border-2 rounded-lg transition-all text-left ${
                          userType === "client"
                            ? "border-slate-600 bg-slate-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <ShoppingBag className={`h-4 w-4 sm:h-5 sm:w-5 mb-1 sm:mb-2 ${userType === "client" ? "text-slate-600" : "text-gray-400"}`} />
                        <div className="font-medium text-sm sm:text-base">Hire Freelancers</div>
                        <div className="text-xs text-gray-500 mt-1">I'm a client</div>
                      </button>
                    </div>
                    {!userType && (
                      <p className="text-xs text-red-500 mt-1">Please select an option</p>
                    )}
                  </div>
                </>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  maxLength={255}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  maxLength={72}
                />
                {!isLogin && (
                  <PasswordStrengthMeter 
                    password={password} 
                    onStrengthChange={setIsPasswordStrong}
                  />
                )}
              </div>
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required={!isLogin}
                    minLength={8}
                    maxLength={72}
                  />
                </div>
              )}
              {isLogin && (
                <div className="text-right">
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-sm text-muted-foreground hover:text-primary"
                  >
                    Forgot password?
                  </button>
                </div>
              )}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Please wait..." : isLogin ? "Sign In" : "Sign Up"}
              </Button>
            </form>
          )}
          {!showForgotPassword && (
            <div className="mt-4 text-center text-sm">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-primary hover:underline font-medium"
              >
                {isLogin ? "Sign up" : "Sign in"}
              </button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
