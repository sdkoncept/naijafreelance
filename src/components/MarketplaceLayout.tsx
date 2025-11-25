import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Search, Menu, User, LogOut, Settings, Briefcase, ShoppingBag, Users, Shield, AlertTriangle } from "lucide-react";
import NotificationBell from "@/components/NotificationBell";
import ChatbotButton from "./ChatbotButton";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface MarketplaceLayoutProps {
  children: React.ReactNode;
}

export default function MarketplaceLayout({ children }: MarketplaceLayoutProps) {
  const { user, profile, userRole, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const userInitials = profile?.full_name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U";

  const isFreelancer = profile?.user_type === "freelancer";
  const isClient = profile?.user_type === "client";
  const isAdmin = userRole === "admin";

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16 sm:h-18">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
              <div className="w-9 h-9 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-sm">
                <Briefcase className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl sm:text-2xl text-gray-900">NaijaFreelance</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              <Link
                to="/"
                className="px-4 py-2 text-gray-700 hover:text-primary font-medium transition-colors rounded-lg hover:bg-gray-50"
              >
                Home
              </Link>
              {isAdmin ? (
                <Link
                  to="/disputes"
                  className="px-4 py-2 text-gray-700 hover:text-primary font-medium transition-colors rounded-lg hover:bg-gray-50"
                >
                  Disputes
                </Link>
              ) : (
                <>
                  <Link
                    to="/browse"
                    className="px-4 py-2 text-gray-700 hover:text-primary font-medium transition-colors rounded-lg hover:bg-gray-50"
                  >
                    Find Freelancers
                  </Link>
                  <Link
                    to="/how-it-works"
                    className="px-4 py-2 text-gray-700 hover:text-primary font-medium transition-colors rounded-lg hover:bg-gray-50"
                  >
                    How It Works
                  </Link>
                </>
              )}
              {user && (
                <>
                  {isFreelancer && (
                    <>
                      <Link
                        to="/jobs"
                        className="px-4 py-2 text-gray-700 hover:text-primary font-medium transition-colors rounded-lg hover:bg-gray-50"
                      >
                        Jobs
                      </Link>
                      <Link
                        to="/community"
                        className="px-4 py-2 text-gray-700 hover:text-primary font-medium transition-colors rounded-lg hover:bg-gray-50"
                      >
                        Community
                      </Link>
                    </>
                  )}
                  {isAdmin && (
                    <>
                      <Link
                        to="/users"
                        className="px-4 py-2 text-gray-700 hover:text-primary font-medium transition-colors rounded-lg hover:bg-gray-50"
                      >
                        User Management
                      </Link>
                      <Link
                        to="/audit-logs"
                        className="px-4 py-2 text-gray-700 hover:text-primary font-medium transition-colors rounded-lg hover:bg-gray-50"
                      >
                        Audit Logs
                      </Link>
                    </>
                  )}
                  {isFreelancer && (
                    <Link
                      to="/freelancer/dashboard"
                      className="px-4 py-2 text-gray-700 hover:text-primary font-medium transition-colors rounded-lg hover:bg-gray-50"
                    >
                      Dashboard
                    </Link>
                  )}
                  {isClient && (
                    <>
                      <Link
                        to="/client/orders"
                        className="px-4 py-2 text-gray-700 hover:text-primary font-medium transition-colors rounded-lg hover:bg-gray-50"
                      >
                        My Orders
                      </Link>
                      <Link
                        to="/logo-creator"
                        className="px-4 py-2 text-gray-700 hover:text-primary font-medium transition-colors rounded-lg hover:bg-gray-50"
                      >
                        Logo Creator
                      </Link>
                    </>
                  )}
                  <Link
                    to="/messages"
                    className="px-4 py-2 text-gray-700 hover:text-primary font-medium transition-colors rounded-lg hover:bg-gray-50"
                  >
                    Messages
                  </Link>
                </>
              )}
            </nav>

            {/* Right Side */}
            <div className="flex items-center gap-3">
              {user ? (
                <>
                  <NotificationBell />
                  {isAdmin && (
                    <>
                      <Button asChild variant="outline" className="hidden md:flex border-gray-300 hover:bg-gray-50">
                        <Link to="/freelancer/gigs/create">Create Gig</Link>
                      </Button>
                      <Button asChild className="hidden md:flex bg-primary hover:bg-primary/90">
                        <Link to="/post-job">Post a Job</Link>
                      </Button>
                    </>
                  )}
                  {isFreelancer && (
                    <Button asChild className="hidden md:flex bg-primary hover:bg-primary/90">
                      <Link to="/freelancer/gigs/create">Create Gig</Link>
                    </Button>
                  )}
                  {isClient && (
                    <Button asChild className="hidden md:flex bg-primary hover:bg-primary/90">
                      <Link to="/post-job">Post a Job</Link>
                    </Button>
                  )}

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={profile?.avatar_url} alt={profile?.full_name} />
                          <AvatarFallback>{userInitials}</AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel>
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium">{profile?.full_name}</p>
                          <p className="text-xs text-gray-500">{profile?.email}</p>
                          <div className="flex gap-2 mt-1">
                            {userRole && (
                              <Badge variant="default" className="w-fit">
                                {userRole}
                              </Badge>
                            )}
                            {profile?.user_type && profile.user_type !== 'admin' && (
                              <Badge variant="secondary" className="w-fit">
                                {profile.user_type}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {isAdmin && (
                        <>
                          <DropdownMenuItem asChild>
                            <Link to="/users">
                              <Users className="mr-2 h-4 w-4" />
                              User Management
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link to="/audit-logs">
                              <Shield className="mr-2 h-4 w-4" />
                              Audit Logs
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link to="/disputes">
                              <AlertTriangle className="mr-2 h-4 w-4" />
                              Disputes
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                        </>
                      )}
                      <DropdownMenuItem asChild>
                        <Link to="/profile">
                          <User className="mr-2 h-4 w-4" />
                          Profile
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/settings">
                          <Settings className="mr-2 h-4 w-4" />
                          Settings
                        </Link>
                      </DropdownMenuItem>
                      {isFreelancer && (
                        <DropdownMenuItem asChild>
                          <Link to="/freelancer/earnings">
                            <Briefcase className="mr-2 h-4 w-4" />
                            Earnings
                          </Link>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleSignOut}>
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign Out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <Button asChild variant="ghost" size="sm" className="hidden sm:flex">
                    <Link to="/auth">Login</Link>
                  </Button>
                  <Button asChild size="sm" className="bg-primary hover:bg-primary/90 text-white">
                    <Link to="/auth">Sign Up</Link>
                  </Button>
                </div>
              )}

              {/* Mobile Menu */}
              <Sheet>
                <SheetTrigger asChild className="md:hidden">
                  <Button variant="ghost" size="icon">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <nav className="flex flex-col gap-4 mt-8">
                    <Link
                      to="/"
                      className="text-gray-700 hover:text-slate-700 transition-colors"
                    >
                      Home
                    </Link>
                    {isAdmin ? (
                      <Link
                        to="/disputes"
                        className="text-gray-700 hover:text-slate-700 transition-colors"
                      >
                        Disputes
                      </Link>
                    ) : (
                      <>
                        <Link
                          to="/browse"
                          className="text-gray-700 hover:text-slate-700 transition-colors"
                        >
                          Browse
                        </Link>
                        <Link
                          to="/how-it-works"
                          className="text-gray-700 hover:text-slate-700 transition-colors"
                        >
                          How It Works
                        </Link>
                      </>
                    )}
                    {user && (
                      <>
                        {isAdmin && (
                          <>
                            <Link
                              to="/users"
                              className="text-gray-700 hover:text-slate-700 transition-colors"
                            >
                              User Management
                            </Link>
                            <Link
                              to="/audit-logs"
                              className="text-gray-700 hover:text-slate-700 transition-colors"
                            >
                              Audit Logs
                            </Link>
                            <Link
                              to="/freelancer/gigs/create"
                              className="text-gray-700 hover:text-slate-700 transition-colors"
                            >
                              Create Gig
                            </Link>
                            <Link
                              to="/post-job"
                              className="text-gray-700 hover:text-slate-700 transition-colors"
                            >
                              Post a Job
                            </Link>
                          </>
                        )}
                        {isFreelancer && (
                          <>
                            <Link
                              to="/freelancer/dashboard"
                              className="text-gray-700 hover:text-slate-700 transition-colors"
                            >
                              Dashboard
                            </Link>
                            <Link
                              to="/jobs"
                              className="text-gray-700 hover:text-slate-700 transition-colors"
                            >
                              Browse Jobs
                            </Link>
                            <Link
                              to="/community"
                              className="text-gray-700 hover:text-slate-700 transition-colors"
                            >
                              Community
                            </Link>
                            <Link
                              to="/freelancer/gigs/create"
                              className="text-gray-700 hover:text-slate-700 transition-colors"
                            >
                              Create Gig
                            </Link>
                          </>
                        )}
                        {isClient && (
                          <>
                            <Link
                              to="/my-gigs"
                              className="text-gray-700 hover:text-slate-700 transition-colors"
                            >
                              My Gigs
                            </Link>
                            <Link
                              to="/logo-creator"
                              className="text-gray-700 hover:text-slate-700 transition-colors"
                            >
                              Logo Creator
                            </Link>
                            <Link
                              to="/post-job"
                              className="text-gray-700 hover:text-slate-700 transition-colors"
                            >
                              Post a Job
                            </Link>
                          </>
                        )}
                        {isFreelancer && (
                          <>
                            <Link
                              to="/my-gigs"
                              className="text-gray-700 hover:text-slate-700 transition-colors"
                            >
                              My Gigs
                            </Link>
                          </>
                        )}
                        <Link
                          to="/messages"
                          className="text-gray-700 hover:text-slate-700 transition-colors"
                        >
                          Messages
                        </Link>
                        <Link
                          to="/profile"
                          className="text-gray-700 hover:text-slate-700 transition-colors"
                        >
                          Profile
                        </Link>
                      </>
                    )}
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>{children}</main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 mt-24">
        <div className="container mx-auto px-4 py-16">
          <div className="grid md:grid-cols-4 gap-8 lg:gap-12">
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-9 h-9 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-white text-lg">NaijaFreelance</span>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed">
                Nigeria's premier freelancer marketplace. Connect, collaborate, and grow your business.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-4 text-base">For Freelancers</h3>
              <ul className="space-y-3 text-sm">
                <li><Link to="/browse" className="hover:text-white transition-colors">Browse Jobs</Link></li>
                <li><Link to="/freelancer/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
                <li><Link to="/how-it-works" className="hover:text-white transition-colors">How It Works</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-4 text-base">For Clients</h3>
              <ul className="space-y-3 text-sm">
                <li><Link to="/browse" className="hover:text-white transition-colors">Find Freelancers</Link></li>
                <li><Link to="/post-job" className="hover:text-white transition-colors">Post a Job</Link></li>
                <li><Link to="/how-it-works" className="hover:text-white transition-colors">How It Works</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-4 text-base">Support</h3>
              <ul className="space-y-3 text-sm">
                <li><Link to="/help" className="hover:text-white transition-colors">Help Center</Link></li>
                <li><Link to="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
                <li><Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-sm text-gray-400">
            <p>&copy; {new Date().getFullYear()} NaijaFreelance. All rights reserved.</p>
          </div>
        </div>
      </footer>
      <ChatbotButton />
    </div>
  );
}

