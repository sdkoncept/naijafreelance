import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, Briefcase, MessageSquare, CheckCircle, DollarSign, Shield, Users, FileText } from "lucide-react";
import { Link } from "react-router-dom";

export default function HowItWorks() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">How It Works</h1>
          <p className="text-xl text-gray-600">
            Connect with talented freelancers or find exciting projects. Simple, secure, and efficient.
          </p>
        </div>

        {/* For Clients */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-blue-500" />
              <div>
                <CardTitle className="text-2xl">For Clients</CardTitle>
                <CardDescription>Find the perfect freelancer for your project</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Search className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2">1. Browse & Search</h3>
                <p className="text-sm text-gray-600">
                  Explore our marketplace of talented freelancers. Use filters to find the perfect match for your project.
                </p>
              </div>
              <div className="text-center">
                <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2">2. Connect & Discuss</h3>
                <p className="text-sm text-gray-600">
                  Message freelancers directly to discuss your project requirements, timeline, and budget.
                </p>
              </div>
              <div className="text-center">
                <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2">3. Place Order</h3>
                <p className="text-sm text-gray-600">
                  Create an order with clear requirements. Payment is held securely until work is completed.
                </p>
              </div>
            </div>
            <div className="pt-4 border-t">
              <Button asChild className="w-full md:w-auto">
                <Link to="/browse">Browse Freelancers</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* For Freelancers */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Briefcase className="h-8 w-8 text-green-500" />
              <div>
                <CardTitle className="text-2xl">For Freelancers</CardTitle>
                <CardDescription>Showcase your skills and grow your business</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="font-semibold mb-2">1. Create Your Gig</h3>
                <p className="text-sm text-gray-600">
                  Set up your service profile with packages, pricing, and portfolio. Show clients what you can do.
                </p>
              </div>
              <div className="text-center">
                <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="font-semibold mb-2">2. Get Orders</h3>
                <p className="text-sm text-gray-600">
                  Receive orders from clients. Communicate clearly and deliver quality work on time.
                </p>
              </div>
              <div className="text-center">
                <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <DollarSign className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="font-semibold mb-2">3. Get Paid</h3>
                <p className="text-sm text-gray-600">
                  Once work is completed and approved, receive your earnings securely. Build your reputation with reviews.
                </p>
              </div>
            </div>
            <div className="pt-4 border-t">
              <Button asChild variant="outline" className="w-full md:w-auto">
                <Link to="/freelancer/gigs/create">Create Your First Gig</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Security & Trust */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-purple-500" />
              <div>
                <CardTitle className="text-2xl">Security & Trust</CardTitle>
                <CardDescription>Your safety and security are our priority</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">Secure Payments</h3>
                <p className="text-sm text-gray-600 mb-4">
                  All payments are processed securely through trusted payment gateways. Funds are held in escrow until work is completed.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Dispute Resolution</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Our support team is available to help resolve any issues between clients and freelancers fairly.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Verified Profiles</h3>
                <p className="text-sm text-gray-600 mb-4">
                  We verify freelancer profiles and portfolios to ensure quality and authenticity.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Rating System</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Build trust through our transparent rating and review system. See what others say before you work together.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="text-center mt-12">
          <h2 className="text-2xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-gray-600 mb-6">
            Join thousands of clients and freelancers already using NaijaFreelance
          </p>
          <div className="flex gap-4 justify-center">
            <Button asChild size="lg">
              <Link to="/browse">Browse Services</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/auth">Sign Up</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

