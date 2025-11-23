import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  Smartphone
} from "lucide-react";

const categories = [
  { name: "Graphics & Design", icon: Palette, slug: "graphics-design", color: "bg-slate-100 text-slate-700" },
  { name: "Digital Marketing", icon: TrendingUp, slug: "digital-marketing", color: "bg-stone-100 text-stone-700" },
  { name: "Writing & Translation", icon: PenTool, slug: "writing-translation", color: "bg-neutral-100 text-neutral-700" },
  { name: "Video & Animation", icon: Video, slug: "video-animation", color: "bg-zinc-100 text-zinc-700" },
  { name: "Music & Audio", icon: Music, slug: "music-audio", color: "bg-gray-100 text-gray-700" },
  { name: "Programming & Tech", icon: Code, slug: "programming-tech", color: "bg-slate-100 text-slate-700" },
  { name: "Business", icon: Briefcase, slug: "business", color: "bg-stone-100 text-stone-700" },
  { name: "Mobile Apps", icon: Smartphone, slug: "mobile-apps", color: "bg-neutral-100 text-neutral-700" },
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
      <section className="bg-gradient-to-br from-slate-700 via-slate-600 to-slate-700 text-white">
        <div className="container mx-auto px-4 py-24 md:py-32">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Find Talented Nigerian Freelancers
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-slate-200">
              Connect with skilled professionals or start offering your services today
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-8">
              <div className="flex gap-2 bg-white rounded-lg p-2 shadow-lg">
                <Search className="w-6 h-6 text-gray-400 my-auto ml-3" />
                <input
                  type="text"
                  placeholder="Search for services (e.g., logo design, web development)"
                  className="flex-1 outline-none text-gray-900 px-2 py-3"
                />
                <Button className="bg-slate-700 hover:bg-slate-800">
                  Search
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 justify-center">
              <Button asChild size="lg" className="bg-white text-slate-700 hover:bg-gray-100">
                <Link to="/auth">Get Started</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                <Link to="/browse">Browse Services</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Popular Categories
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <Link
                  key={category.slug}
                  to={`/browse?category=${category.slug}`}
                  className="group"
                >
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                    <CardHeader className="text-center">
                      <div className={`w-16 h-16 mx-auto rounded-full ${category.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                        <Icon className="w-8 h-8" />
                      </div>
                      <CardTitle className="text-lg">{category.name}</CardTitle>
                    </CardHeader>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Why Choose NaijaFreelance?
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.title} className="text-center">
                  <CardHeader>
                    <div className="w-16 h-16 mx-auto bg-slate-100 rounded-full flex items-center justify-center mb-4">
                      <Icon className="w-8 h-8 text-slate-600" />
                    </div>
                    <CardTitle>{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            How It Works
          </h2>
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto bg-slate-700 text-white rounded-full flex items-center justify-center text-2xl font-bold mb-4">
                  1
                </div>
                <h3 className="text-xl font-semibold mb-2">Post a Job or Browse</h3>
                <p className="text-gray-600">
                  Create a project or browse through thousands of service offerings from talented freelancers.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto bg-slate-700 text-white rounded-full flex items-center justify-center text-2xl font-bold mb-4">
                  2
                </div>
                <h3 className="text-xl font-semibold mb-2">Connect & Collaborate</h3>
                <p className="text-gray-600">
                  Message freelancers, discuss your project, and choose the perfect match for your needs.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto bg-slate-700 text-white rounded-full flex items-center justify-center text-2xl font-bold mb-4">
                  3
                </div>
                <h3 className="text-xl font-semibold mb-2">Pay Securely</h3>
                <p className="text-gray-600">
                  Payment is held in escrow. Release it when you're satisfied with the completed work.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-slate-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl mb-8 text-slate-200">
            Join thousands of freelancers and clients building success together
          </p>
          <div className="flex gap-4 justify-center">
            <Button asChild size="lg" className="bg-white text-slate-700 hover:bg-gray-100">
              <Link to="/auth">Sign Up Free</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
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

