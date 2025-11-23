import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Star, Clock, TrendingUp } from "lucide-react";
import { toast } from "sonner";

interface Gig {
  id: string;
  title: string;
  slug: string;
  description: string;
  category_id: string;
  basic_package_price: number;
  standard_package_price: number;
  premium_package_price: number;
  images: string[];
  tags: string[];
  views_count: number;
  orders_count: number;
  average_rating: number;
  created_at: string;
  freelancer_id: string;
  profiles: {
    full_name: string;
    avatar_url?: string;
  };
  categories: {
    name: string;
    slug: string;
  };
}

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
}

export default function Browse() {
  const [searchParams] = useSearchParams();
  const categorySlug = searchParams.get("category");
  
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>(categorySlug || "all");
  const [sortBy, setSortBy] = useState<string>("newest");

  useEffect(() => {
    fetchCategories();
    fetchGigs();
  }, [selectedCategory, sortBy]);

  useEffect(() => {
    if (categorySlug) {
      setSelectedCategory(categorySlug);
    }
  }, [categorySlug]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("id, name, slug, icon")
        .order("name");

      if (error) throw error;
      setCategories(data || []);
    } catch (error: any) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchGigs = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from("gigs")
        .select(`
          *,
          profiles:freelancer_id (
            full_name,
            avatar_url
          ),
          categories:category_id (
            name,
            slug
          )
        `)
        .eq("status", "active");

      // Filter by category if selected
      if (selectedCategory !== "all") {
        const { data: categoryData } = await supabase
          .from("categories")
          .select("id")
          .eq("slug", selectedCategory)
          .single();

        if (categoryData) {
          query = query.eq("category_id", categoryData.id);
        }
      }

      // Apply sorting
      if (sortBy === "newest") {
        query = query.order("created_at", { ascending: false });
      } else if (sortBy === "oldest") {
        query = query.order("created_at", { ascending: true });
      } else if (sortBy === "price_low") {
        query = query.order("basic_package_price", { ascending: true });
      } else if (sortBy === "price_high") {
        query = query.order("basic_package_price", { ascending: false });
      } else if (sortBy === "rating") {
        query = query.order("average_rating", { ascending: false });
      } else if (sortBy === "orders") {
        query = query.order("orders_count", { ascending: false });
      }

      const { data, error } = await query.limit(50);

      if (error) throw error;

      // Transform the data to match our interface
      const transformedGigs = (data || []).map((gig: any) => ({
        ...gig,
        profiles: Array.isArray(gig.profiles) ? gig.profiles[0] : gig.profiles,
        categories: Array.isArray(gig.categories) ? gig.categories[0] : gig.categories,
      }));

      setGigs(transformedGigs);
    } catch (error: any) {
      console.error("Error fetching gigs:", error);
      toast.error("Failed to load services: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredGigs = gigs.filter((gig) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      gig.title.toLowerCase().includes(searchLower) ||
      gig.description.toLowerCase().includes(searchLower) ||
      gig.tags.some((tag) => tag.toLowerCase().includes(searchLower))
    );
  });

  const formatPrice = (price: number | null) => {
    if (!price) return "Price on request";
    return `₦${price.toLocaleString()}`;
  };

  const getMinPrice = (gig: Gig) => {
    const prices = [
      gig.basic_package_price,
      gig.standard_package_price,
      gig.premium_package_price,
    ].filter((p) => p !== null && p !== undefined) as number[];
    return prices.length > 0 ? Math.min(...prices) : null;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Browse Services</h1>
        <p className="text-gray-600">
          Discover talented Nigerian freelancers and their services
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-8 space-y-4">
        <div className="flex gap-4 flex-col md:flex-row">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search for services (e.g., logo design, web development)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.slug}>
                  {category.icon} {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="price_low">Price: Low to High</SelectItem>
              <SelectItem value="price_high">Price: High to Low</SelectItem>
              <SelectItem value="rating">Highest Rated</SelectItem>
              <SelectItem value="orders">Most Orders</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-slate-700"></div>
          <p className="mt-4 text-gray-600">Loading services...</p>
        </div>
      ) : filteredGigs.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-xl text-gray-600 mb-4">No services found</p>
          <p className="text-gray-500">
            {searchTerm || selectedCategory !== "all"
              ? "Try adjusting your search or filters"
              : "Be the first to create a service!"}
          </p>
          {!searchTerm && selectedCategory === "all" && (
            <Button asChild className="mt-4">
              <Link to="/freelancer/gigs/create">Create Your First Gig</Link>
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className="mb-4 text-sm text-gray-600">
            Showing {filteredGigs.length} service{filteredGigs.length !== 1 ? "s" : ""}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredGigs.map((gig) => {
              const minPrice = getMinPrice(gig);
              return (
                <Link key={gig.id} to={`/gig/${gig.slug}`}>
                  <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                    {gig.images && gig.images.length > 0 && (
                      <div className="aspect-video w-full overflow-hidden rounded-t-lg bg-gray-100">
                        <img
                          src={gig.images[0]}
                          alt={gig.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <CardHeader>
                      <div className="flex items-start justify-between mb-2">
                        <CardTitle className="text-lg line-clamp-2 flex-1">
                          {gig.title}
                        </CardTitle>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        {gig.categories && (
                          <Badge variant="secondary" className="text-xs">
                            {gig.categories.name}
                          </Badge>
                        )}
                        {gig.average_rating > 0 && (
                          <div className="flex items-center gap-1 text-sm text-yellow-600">
                            <Star className="w-4 h-4 fill-current" />
                            <span>{gig.average_rating.toFixed(1)}</span>
                          </div>
                        )}
                      </div>
                      <CardDescription className="line-clamp-2">
                        {gig.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          {gig.orders_count > 0 && (
                            <div className="flex items-center gap-1">
                              <TrendingUp className="w-4 h-4" />
                              <span>{gig.orders_count} orders</span>
                            </div>
                          )}
                          {gig.views_count > 0 && (
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              <span>{gig.views_count} views</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="font-bold text-lg text-slate-700">
                          {formatPrice(minPrice)}
                        </div>
                        {gig.profiles && (
                          <div className="flex items-center gap-2">
                            {gig.profiles.avatar_url ? (
                              <img
                                src={gig.profiles.avatar_url}
                                alt={gig.profiles.full_name}
                                className="w-6 h-6 rounded-full"
                              />
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-medium">
                                {gig.profiles.full_name?.[0]?.toUpperCase() || "U"}
                              </div>
                            )}
                            <span className="text-sm text-gray-600">
                              {gig.profiles.full_name}
                            </span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

