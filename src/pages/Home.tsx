import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import TestimonialCard from "@/components/TestimonialCard";
import { 
  Search, 
  TrendingUp, 
  Shield, 
  Users, 
  Star, 
  ArrowRight,
  Code,
  Palette,
  PenTool,
  Video,
  Music,
  Briefcase,
  Smartphone,
  CheckCircle2,
  MessageSquare,
  CreditCard
} from "lucide-react";

const categories = [
  { name: "Graphics & Design", icon: Palette, slug: "graphics-design", color: "bg-primary/10 text-primary" },
  { name: "Digital Marketing", icon: TrendingUp, slug: "digital-marketing", color: "bg-blue-100 text-blue-700" },
  { name: "Writing & Translation", icon: PenTool, slug: "writing-translation", color: "bg-purple-100 text-purple-700" },
  { name: "Video & Animation", icon: Video, slug: "video-animation", color: "bg-red-100 text-red-700" },
  { name: "Music & Audio", icon: Music, slug: "music-audio", color: "bg-pink-100 text-pink-700" },
  { name: "Programming & Tech", icon: Code, slug: "programming-tech", color: "bg-indigo-100 text-indigo-700" },
  { name: "Business", icon: Briefcase, slug: "business", color: "bg-amber-100 text-amber-700" },
  { name: "Mobile Apps", icon: Smartphone, slug: "mobile-apps", color: "bg-cyan-100 text-cyan-700" },
];

const testimonials = [
  {
    name: "Adebayo Ogunleye",
    role: "Client",
    rating: 5,
    comment: "Found an amazing graphic designer who delivered exactly what I needed. The platform made it so easy to communicate and manage the project.",
    location: "Lagos, Nigeria"
  },
  {
    name: "Chioma Nwosu",
    role: "Freelancer",
    rating: 5,
    comment: "NaijaFreelance has transformed my freelance career. I've connected with great clients and the payment system is secure and reliable.",
    location: "Abuja, Nigeria"
  },
  {
    name: "Emeka Okoro",
    role: "Client",
    rating: 5,
    comment: "The quality of freelancers here is outstanding. I've hired multiple developers and each project exceeded my expectations.",
    location: "Port Harcourt, Nigeria"
  },
  {
    name: "Fatima Ibrahim",
    role: "Freelancer",
    rating: 5,
    comment: "As a content writer, I've found consistent work through this platform. The interface is user-friendly and payments are always on time.",
    location: "Kano, Nigeria"
  }
];

const features = [
  {
    icon: Shield,
    title: "Payment Protection",
    description: "Your payments are held securely in escrow until work is completed and approved."
  },
  {
    icon: Users,
    title: "Verified Freelancers",
    description: "All freelancers are verified to ensure quality and trustworthiness."
  },
  {
    icon: Star,
    title: "Quality Guaranteed",
    description: "Browse reviews and ratings to find the perfect freelancer for your project."
  },
  {
    icon: TrendingUp,
    title: "Grow Your Business",
    description: "Access thousands of clients and build your freelance career with us."
  }
];

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]"></div>
        <div className="container mx-auto px-4 py-20 md:py-32 relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 md:mb-8 leading-tight">
              Find Talented Nigerian Freelancers
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl mb-8 md:mb-10 text-white/90 px-2 max-w-3xl mx-auto">
              Connect with skilled professionals or start offering your services today. Nigeria's premier freelancer marketplace.
            </p>
            
            {/* Search Bar */}
            <div className="max-w-3xl mx-auto mb-8 md:mb-10 px-2">
              <div className="flex flex-col sm:flex-row gap-2 bg-white rounded-xl p-2 shadow-2xl">
                <div className="flex-1 flex items-center gap-3 px-4 py-3">
                  <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  <Input
                    type="text"
                    placeholder="Search for services, skills, or freelancers..."
                    className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-base h-auto p-0"
                  />
                </div>
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-white px-8">
                  Search
                </Button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center px-2">
              <Button asChild size="lg" className="bg-white text-primary hover:bg-gray-50 text-base h-12 px-8">
                <Link to="/post-job">Post a Job</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10 text-base h-12 px-8">
                <Link to="/browse">Browse Freelancers</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Popular Categories
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Explore services across various categories to find the perfect match for your project
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <Link
                  key={category.slug}
                  to={`/browse?category=${category.slug}`}
                  className="group"
                >
                  <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer h-full border-gray-200 hover:border-primary/50 hover:-translate-y-1">
                    <CardHeader className="text-center p-6">
                      <div className={`w-16 h-16 mx-auto rounded-2xl ${category.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className="w-8 h-8" />
                      </div>
                      <CardTitle className="text-base sm:text-lg font-semibold">{category.name}</CardTitle>
                    </CardHeader>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Why Choose NaijaFreelance?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Built for Nigerian freelancers and clients, with features that matter
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.title} className="text-center border-gray-200 hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="w-16 h-16 mx-auto bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
                      <Icon className="w-8 h-8 text-primary" />
                    </div>
                    <CardTitle className="text-lg font-semibold mb-2">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-600 leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              How It Works
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Get started in three simple steps
            </p>
          </div>
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8 md:gap-12">
              <div className="text-center relative">
                <div className="w-20 h-20 mx-auto bg-primary text-white rounded-2xl flex items-center justify-center text-2xl font-bold mb-6 shadow-lg">
                  1
                </div>
                <h3 className="text-xl font-semibold mb-3">Post a Job or Browse</h3>
                <p className="text-gray-600 leading-relaxed">
                  Create a project or browse through thousands of service offerings from talented Nigerian freelancers.
                </p>
              </div>
              <div className="text-center relative">
                <div className="w-20 h-20 mx-auto bg-primary text-white rounded-2xl flex items-center justify-center text-2xl font-bold mb-6 shadow-lg">
                  2
                </div>
                <h3 className="text-xl font-semibold mb-3">Connect & Collaborate</h3>
                <p className="text-gray-600 leading-relaxed">
                  Message freelancers, discuss your project details, and choose the perfect match for your needs.
                </p>
              </div>
              <div className="text-center relative">
                <div className="w-20 h-20 mx-auto bg-primary text-white rounded-2xl flex items-center justify-center text-2xl font-bold mb-6 shadow-lg">
                  3
                </div>
                <h3 className="text-xl font-semibold mb-3">Pay Securely</h3>
                <p className="text-gray-600 leading-relaxed">
                  Payment is held securely in escrow. Release it when you're completely satisfied with the completed work.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 sm:py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              What Our Users Say
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Real feedback from freelancers and clients using NaijaFreelance
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <TestimonialCard key={index} {...testimonial} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-lg sm:text-xl mb-8 text-white/90 max-w-2xl mx-auto">
            Join thousands of freelancers and clients building success together on Nigeria's premier marketplace
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-white text-primary hover:bg-gray-50 text-base h-12 px-8">
              <Link to="/auth">Sign Up Free</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10 text-base h-12 px-8">
              <Link to="/browse">
                Browse Services
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

