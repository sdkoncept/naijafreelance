import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Search, Briefcase, Calendar, DollarSign, Clock, MapPin } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

interface Job {
  id: string;
  title: string;
  slug: string;
  description: string;
  budget: number | null;
  currency: string;
  delivery_days: number | null;
  requirements: string | null;
  status: string;
  views_count: number;
  applications_count: number;
  created_at: string;
  category_id: string;
  client_id: string;
  categories: {
    name: string;
    slug: string;
  };
  profiles: {
    full_name: string;
    avatar_url?: string;
  };
}

export default function Jobs() {
  const { user, profile } = useAuth();
  const [searchParams] = useSearchParams();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");
  const [categories, setCategories] = useState<Array<{ id: string; name: string; slug: string }>>([]);

  useEffect(() => {
    const category = searchParams.get("category");
    if (category) {
      setSelectedCategory(category);
    }
    fetchCategories();
    fetchJobs();
  }, []);

  useEffect(() => {
    filterJobs();
  }, [searchTerm, selectedCategory, sortBy, jobs]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("id, name, slug")
        .order("name");

      if (error) throw error;
      setCategories(data || []);
    } catch (error: any) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchJobs = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from("jobs")
        .select(`
          *,
          profiles:client_id (
            full_name,
            avatar_url
          ),
          categories:category_id (
            name,
            slug
          )
        `)
        .eq("status", "open");

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
      } else if (sortBy === "budget_high") {
        query = query.order("budget", { ascending: false, nullsLast: true });
      } else if (sortBy === "budget_low") {
        query = query.order("budget", { ascending: true, nullsLast: true });
      }

      const { data, error } = await query.limit(100);

      if (error) {
        if (error.code === "PGRST205") {
          toast.error("Jobs table not found. Please run the database migration.");
          setLoading(false);
          return;
        }
        throw error;
      }

      // Transform the data
      const transformedJobs = (data || []).map((job: any) => ({
        ...job,
        profiles: Array.isArray(job.profiles) ? job.profiles[0] : job.profiles,
        categories: Array.isArray(job.categories) ? job.categories[0] : job.categories,
      }));

      setJobs(transformedJobs);
    } catch (error: any) {
      console.error("Error fetching jobs:", error);
      toast.error("Failed to load jobs: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const filterJobs = () => {
    let filtered = [...jobs];

    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (job) =>
          job.title.toLowerCase().includes(searchLower) ||
          job.description.toLowerCase().includes(searchLower) ||
          job.categories?.name?.toLowerCase().includes(searchLower)
      );
    }

    setFilteredJobs(filtered);
  };

  const formatBudget = (budget: number | null, currency: string) => {
    if (!budget) return "Budget not specified";
    return `${currency} ${budget.toLocaleString()}`;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-slate-700"></div>
          <p className="mt-4 text-gray-600">Loading jobs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">Available Jobs</h1>
        <p className="text-sm sm:text-base text-gray-600">
          Browse job postings from clients looking for freelancers
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search jobs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedCategory} onValueChange={(value) => {
            setSelectedCategory(value);
            fetchJobs();
          }}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.slug}>
                  {category.name}
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
              <SelectItem value="budget_high">Budget: High to Low</SelectItem>
              <SelectItem value="budget_low">Budget: Low to High</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Jobs List */}
      {filteredJobs.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Briefcase className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No jobs found</h3>
            <p className="text-gray-600 mb-4">
              {jobs.length === 0
                ? "No job postings available at the moment. Check back later!"
                : "No jobs match your search criteria"}
            </p>
            {jobs.length === 0 && (
              <Button asChild>
                <Link to="/browse">Browse Services Instead</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:gap-6">
          {filteredJobs.map((job) => (
            <Card key={job.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <CardTitle className="text-xl sm:text-2xl mb-2">{job.title}</CardTitle>
                    <div className="flex items-center gap-3 flex-wrap mb-3">
                      {job.categories && (
                        <Badge variant="secondary">{job.categories.name}</Badge>
                      )}
                      <div className="flex items-center gap-1 text-gray-600 text-sm">
                        <Calendar className="w-4 h-4" />
                        {new Date(job.created_at).toLocaleDateString()}
                      </div>
                      {job.views_count > 0 && (
                        <div className="flex items-center gap-1 text-gray-600 text-sm">
                          <Briefcase className="w-4 h-4" />
                          {job.views_count} views
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg sm:text-xl font-bold text-slate-700">
                      {formatBudget(job.budget, job.currency)}
                    </div>
                    {job.delivery_days && (
                      <div className="text-sm text-gray-600 flex items-center gap-1 justify-end mt-1">
                        <Clock className="w-4 h-4" />
                        {job.delivery_days} days
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4 line-clamp-3">{job.description}</p>
                {job.requirements && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-900 mb-1">Requirements:</p>
                    <p className="text-sm text-gray-600 line-clamp-2">{job.requirements}</p>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Posted by:</span>
                    <span className="text-sm font-medium">{job.profiles?.full_name || "Client"}</span>
                  </div>
                  <Button asChild>
                    <Link to={`/job/${job.slug}`}>View Details</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

