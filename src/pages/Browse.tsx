import { useState, useEffect, useCallback } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Star, Clock, TrendingUp, Grid, List, SlidersHorizontal, X, Sparkles } from "lucide-react";
import { toast } from "sonner";
import FilterSidebar, { FilterState } from "@/components/FilterSidebar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useDebounce } from "@/hooks/use-debounce";

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
    verification_status?: string;
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
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const categorySlug = searchParams.get("category");
  const queryParam = searchParams.get("q") || "";
  
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(queryParam);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>(categorySlug || "all");
  const [sortBy, setSortBy] = useState<string>(searchParams.get("sort") || "newest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filters, setFilters] = useState<FilterState>({
    category: categorySlug || "all",
    skillLevel: "all",
    priceRange: [
      parseInt(searchParams.get("minPrice") || "0"),
      parseInt(searchParams.get("maxPrice") || "1000000")
    ],
    deliveryTime: searchParams.get("deliveryTime") || "all",
    minRating: parseFloat(searchParams.get("minRating") || "0"),
    location: searchParams.get("location") || "all",
    verified: searchParams.get("verified") === "true",
  });

  // Debounce search term for autocomplete
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchGigs();
  }, [selectedCategory, sortBy, filters, queryParam]);

  useEffect(() => {
    if (categorySlug) {
      setSelectedCategory(categorySlug);
      setFilters(prev => ({ ...prev, category: categorySlug }));
    }
  }, [categorySlug]);

  // Autocomplete suggestions
  useEffect(() => {
    if (debouncedSearchTerm.length >= 2) {
      fetchSuggestions(debouncedSearchTerm);
    } else {
      setSuggestions([]);
    }
  }, [debouncedSearchTerm]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("categories" as any)
        .select("id, name, slug, icon")
        .order("name");

      if (error) throw error;
      setCategories((data || []) as unknown as Category[]);
    } catch (error: any) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchSuggestions = async (term: string) => {
    try {
      // Fetch matching gig titles and tags
      const { data, error } = await supabase
        .from("gigs" as any)
        .select("title, tags")
        .eq("status", "active")
        .ilike("title", `%${term}%`)
        .limit(10);

      if (error) throw error;

      const uniqueSuggestions = new Set<string>();
      (data as any[])?.forEach((gig: any) => {
        if (gig.title?.toLowerCase().includes(term.toLowerCase())) {
          uniqueSuggestions.add(gig.title);
        }
        gig.tags?.forEach((tag: string) => {
          if (tag.toLowerCase().includes(term.toLowerCase())) {
            uniqueSuggestions.add(tag);
          }
        });
      });

      setSuggestions(Array.from(uniqueSuggestions).slice(0, 8));
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    }
  };

  const fetchGigs = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from("gigs" as any)
        .select(`
          *,
          profiles:freelancer_id (
            full_name,
            avatar_url,
            verification_status
          ),
          categories:category_id (
            name,
            slug
          )
        `)
        .eq("status", "active");

      // Apply search term (full-text search)
      if (queryParam) {
        query = query.or(`title.ilike.%${queryParam}%,description.ilike.%${queryParam}%,tags.cs.{${queryParam}}`);
      }

      // Filter by category
      if (selectedCategory !== "all") {
        const { data: categoryData } = await supabase
          .from("categories" as any)
          .select("id")
          .eq("slug", selectedCategory)
          .single();

        if (categoryData) {
          query = query.eq("category_id", (categoryData as any).id);
        }
      }

      // Apply price range filter
      const [minPrice, maxPrice] = filters.priceRange;
      if (minPrice > 0 || maxPrice < 1000000) {
        query = query.gte("basic_package_price", minPrice)
                     .lte("basic_package_price", maxPrice);
      }

      // Apply minimum rating filter
      if (filters.minRating > 0) {
        query = query.gte("average_rating", filters.minRating);
      }

      // Apply delivery time filter
      if (filters.deliveryTime !== "all") {
        const days = parseInt(filters.deliveryTime);
        query = query.lte("basic_package_delivery_days", days);
      }

      // Apply verified freelancer filter
      if (filters.verified) {
        // This requires a join, so we'll filter after fetching
        // For now, we'll filter client-side
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
      } else if (sortBy === "relevance") {
        // For relevance, we'll use a combination of rating and orders
        query = query.order("average_rating", { ascending: false });
      }

      const { data, error } = await query.limit(100);

      if (error) throw error;

      // Transform the data
      let transformedGigs = (data || []).map((gig: any) => ({
        ...gig,
        profiles: Array.isArray(gig.profiles) ? gig.profiles[0] : gig.profiles,
        categories: Array.isArray(gig.categories) ? gig.categories[0] : gig.categories,
      }));

      // Filter verified freelancers if needed (client-side for now)
      if (filters.verified) {
        transformedGigs = transformedGigs.filter(
          (gig: Gig) => gig.profiles?.verification_status === "verified"
        );
      }

      setGigs(transformedGigs);
    } catch (error: any) {
      console.error("Error fetching gigs:", error);
      toast.error("Failed to load services: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setShowSuggestions(value.length >= 2);
    
    // Update URL params
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set("q", value);
    } else {
      newParams.delete("q");
    }
    setSearchParams(newParams);
  };

  const handleSearchSubmit = () => {
    setShowSuggestions(false);
    fetchGigs();
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchTerm(suggestion);
    setShowSuggestions(false);
    const newParams = new URLSearchParams(searchParams);
    newParams.set("q", suggestion);
    setSearchParams(newParams);
    fetchGigs();
  };

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    if (newFilters.category !== "all") {
      setSelectedCategory(newFilters.category);
    }
    
    // Update URL params
    const newParams = new URLSearchParams(searchParams);
    if (newFilters.category !== "all") {
      newParams.set("category", newFilters.category);
    } else {
      newParams.delete("category");
    }
    if (newFilters.priceRange[0] > 0 || newFilters.priceRange[1] < 1000000) {
      newParams.set("minPrice", newFilters.priceRange[0].toString());
      newParams.set("maxPrice", newFilters.priceRange[1].toString());
    }
    if (newFilters.deliveryTime !== "all") {
      newParams.set("deliveryTime", newFilters.deliveryTime);
    }
    if (newFilters.minRating > 0) {
      newParams.set("minRating", newFilters.minRating.toString());
    }
    if (newFilters.location !== "all") {
      newParams.set("location", newFilters.location);
    }
    if (newFilters.verified) {
      newParams.set("verified", "true");
    } else {
      newParams.delete("verified");
    }
    setSearchParams(newParams);
  };

  const clearSearch = () => {
    setSearchTerm("");
    setShowSuggestions(false);
    const newParams = new URLSearchParams(searchParams);
    newParams.delete("q");
    setSearchParams(newParams);
    fetchGigs();
  };

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
        <h1 className="text-3xl sm:text-4xl font-bold mb-3">Find Freelancers</h1>
        <p className="text-lg text-gray-600">
          Discover talented Nigerian freelancers and their services
        </p>
      </div>

      {/* Enhanced Search Bar */}
      <div className="mb-6">
        <div className="flex gap-3 relative">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search for services, skills, or freelancers..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearchSubmit();
                } else if (e.key === "Escape") {
                  setShowSuggestions(false);
                }
              }}
              onFocus={() => setShowSuggestions(searchTerm.length >= 2)}
              className="pl-12 pr-10 h-12 text-base"
            />
            {searchTerm && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            
            {/* Autocomplete Suggestions */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <Search className="w-4 h-4 text-gray-400" />
                    <span>{suggestion}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <Button 
            size="lg" 
            className="px-8 bg-primary hover:bg-primary/90"
            onClick={handleSearchSubmit}
          >
            <Search className="w-4 h-4 mr-2" />
            Search
          </Button>
        </div>
        
        {/* Quick Filters */}
        {queryParam && (
          <div className="mt-3 flex items-center gap-2 flex-wrap">
            <span className="text-sm text-gray-600">Quick filters:</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSortBy("rating");
                const newParams = new URLSearchParams(searchParams);
                newParams.set("sort", "rating");
                setSearchParams(newParams);
              }}
            >
              <Star className="w-3 h-3 mr-1" />
              Top Rated
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setFilters(prev => ({ ...prev, verified: true }));
                handleFilterChange({ ...filters, verified: true });
              }}
            >
              <Sparkles className="w-3 h-3 mr-1" />
              Verified Only
            </Button>
          </div>
        )}
      </div>

      <div className="flex gap-6">
        {/* Sidebar Filters - Desktop */}
        <aside className="hidden lg:block w-80 flex-shrink-0">
          <FilterSidebar
            categories={categories}
            onFilterChange={handleFilterChange}
            initialFilters={filters}
          />
        </aside>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Toolbar */}
          <div className="flex items-center justify-between mb-6">
            <div className="text-sm text-gray-600">
              {loading ? (
                "Loading..."
              ) : (
                <>
                  Showing <span className="font-semibold text-gray-900">{gigs.length}</span>{" "}
                  service{gigs.length !== 1 ? "s" : ""}
                  {queryParam && (
                    <span> for "<span className="font-semibold">{queryParam}</span>"</span>
                  )}
                </>
              )}
            </div>
            <div className="flex items-center gap-3">
              {/* Mobile Filter Button */}
              <Sheet>
                <SheetTrigger asChild className="lg:hidden">
                  <Button variant="outline" size="sm">
                    <SlidersHorizontal className="w-4 h-4 mr-2" />
                    Filters
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80 overflow-y-auto">
                  <FilterSidebar
                    categories={categories}
                    onFilterChange={handleFilterChange}
                    initialFilters={filters}
                  />
                </SheetContent>
              </Sheet>

              {/* View Mode Toggle */}
              <div className="flex items-center gap-1 border rounded-lg p-1">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="h-8 w-8 p-0"
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="h-8 w-8 p-0"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>

              {/* Sort */}
              <Select 
                value={sortBy} 
                onValueChange={(value) => {
                  setSortBy(value);
                  const newParams = new URLSearchParams(searchParams);
                  newParams.set("sort", value);
                  setSearchParams(newParams);
                }}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Most Relevant</SelectItem>
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
            <div className="text-center py-20">
              <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent"></div>
              <p className="mt-4 text-gray-600">Loading services...</p>
            </div>
          ) : gigs.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-2xl font-semibold text-gray-900 mb-2">No services found</p>
              <p className="text-gray-600 mb-6">
                {queryParam || selectedCategory !== "all"
                  ? "Try adjusting your search or filters"
                  : "Be the first to create a service!"}
              </p>
              {!queryParam && selectedCategory === "all" && (
                <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
                  <Link to="/freelancer/gigs/create">Create Your First Gig</Link>
                </Button>
              )}
            </div>
          ) : (
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
                  : "space-y-4"
              }
            >
              {gigs.map((gig) => {
                const minPrice = getMinPrice(gig);
                return (
                  <Link key={gig.id} to={`/gig/${gig.slug}`}>
                    <Card className="h-full hover:shadow-xl transition-all duration-300 cursor-pointer border-gray-200 hover:border-primary/50 hover:-translate-y-1">
                      {gig.images && gig.images.length > 0 && (
                        <div className="aspect-video w-full overflow-hidden rounded-t-lg bg-gray-100 relative">
                          <img
                            src={gig.images[0]}
                            alt={gig.title}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          />
                          {gig.profiles?.verification_status === "verified" && (
                            <div className="absolute top-2 right-2">
                              <Badge className="bg-primary text-white">
                                <Sparkles className="w-3 h-3 mr-1" />
                                Verified
                              </Badge>
                            </div>
                          )}
                        </div>
                      )}
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <CardTitle className="text-lg font-semibold line-clamp-2 flex-1">
                            {gig.title}
                          </CardTitle>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                          {gig.categories && (
                            <Badge variant="secondary" className="text-xs">
                              {gig.categories.name}
                            </Badge>
                          )}
                          {gig.average_rating > 0 && (
                            <div className="flex items-center gap-1 text-sm">
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              <span className="font-medium text-gray-700">
                                {gig.average_rating.toFixed(1)}
                              </span>
                            </div>
                          )}
                        </div>
                        <CardDescription className="line-clamp-2 text-sm">
                          {gig.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            {gig.orders_count > 0 && (
                              <div className="flex items-center gap-1">
                                <TrendingUp className="w-3.5 h-3.5" />
                                <span>{gig.orders_count}</span>
                              </div>
                            )}
                          </div>
                          {gig.profiles && (
                            <div className="flex items-center gap-2">
                              {gig.profiles.avatar_url ? (
                                <img
                                  src={gig.profiles.avatar_url}
                                  alt={gig.profiles.full_name}
                                  className="w-6 h-6 rounded-full border border-gray-200"
                                />
                              ) : (
                                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                                  {gig.profiles.full_name?.[0]?.toUpperCase() || "U"}
                                </div>
                              )}
                              <span className="text-xs text-gray-600 font-medium">
                                {gig.profiles.full_name}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center justify-between pt-3 border-t">
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Starting from</p>
                            <p className="text-xl font-bold text-gray-900">
                              {formatPrice(minPrice)}
                            </p>
                          </div>
                          <Button size="sm" variant="outline" className="border-primary text-primary hover:bg-primary/10">
                            View Details
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}