import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  reviewer: {
    full_name: string;
    avatar_url?: string;
  };
}

interface ReviewsDisplayProps {
  gigId?: string;
  freelancerId?: string;
  limit?: number;
}

export default function ReviewsDisplay({ gigId, freelancerId, limit }: ReviewsDisplayProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);

  useEffect(() => {
    fetchReviews();
  }, [gigId, freelancerId]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      
      // First, get order IDs if filtering by gig
      let orderIds: string[] = [];
      if (gigId) {
        const { data: ordersData } = await supabase
          .from("orders")
          .select("id")
          .eq("gig_id", gigId);
        
        if (ordersData) {
          orderIds = ordersData.map((o) => o.id);
        }
        
        // If no orders found, return empty
        if (orderIds.length === 0) {
          setReviews([]);
          setAverageRating(0);
          setTotalReviews(0);
          setLoading(false);
          return;
        }
      }

      // Build query
      let query = supabase
        .from("reviews")
        .select(`
          id,
          rating,
          comment,
          created_at,
          reviewer:profiles!reviews_reviewer_id_fkey (
            full_name,
            avatar_url
          )
        `);

      // Filter by order IDs (gig) if provided
      if (gigId && orderIds.length > 0) {
        query = query.in("order_id", orderIds);
      }

      // Filter by freelancer if provided
      if (freelancerId) {
        query = query.eq("reviewee_id", freelancerId);
      }

      // Order by newest first
      query = query.order("created_at", { ascending: false });

      // Limit if provided
      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Transform the data
      const transformedReviews = (data || []).map((review: any) => ({
        ...review,
        reviewer: Array.isArray(review.reviewer) ? review.reviewer[0] : review.reviewer,
      }));

      setReviews(transformedReviews);
      setTotalReviews(transformedReviews.length);

      // Calculate average rating
      if (transformedReviews.length > 0) {
        const avg =
          transformedReviews.reduce((sum: number, r: Review) => sum + r.rating, 0) /
          transformedReviews.length;
        setAverageRating(avg);
      } else {
        setAverageRating(0);
      }
    } catch (error: any) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Loading reviews...</p>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">No reviews yet. Be the first to review!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Average Rating Summary */}
      <div className="flex items-center gap-4 pb-4 border-b">
        <div className="text-center">
          <div className="text-4xl font-bold text-gray-900">{averageRating.toFixed(1)}</div>
          <div className="flex items-center justify-center gap-1 mt-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-5 h-5 ${
                  star <= Math.round(averageRating)
                    ? "fill-yellow-400 text-yellow-400"
                    : "fill-gray-200 text-gray-300"
                }`}
              />
            ))}
          </div>
          <p className="text-sm text-gray-600 mt-1">{totalReviews} review{totalReviews !== 1 ? "s" : ""}</p>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <Card key={review.id} className="border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={review.reviewer?.avatar_url} />
                  <AvatarFallback>
                    {review.reviewer?.full_name?.[0]?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-semibold text-gray-900">
                        {review.reviewer?.full_name || "Anonymous"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= review.rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "fill-gray-200 text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  {review.comment && (
                    <p className="text-sm text-gray-700 mt-2 whitespace-pre-wrap">
                      {review.comment}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

