import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, MapPin, Clock, CheckCircle } from "lucide-react";

interface FreelancerCardProps {
  id: string;
  name: string;
  title: string;
  avatarUrl?: string;
  rating: number;
  reviewCount: number;
  priceRange: { min: number; max: number };
  description: string;
  location?: string;
  deliveryTime?: string;
  verified?: boolean;
  jobsCompleted?: number;
  category?: string;
}

export default function FreelancerCard({
  id,
  name,
  title,
  avatarUrl,
  rating,
  reviewCount,
  priceRange,
  description,
  location,
  deliveryTime,
  verified = false,
  jobsCompleted,
  category,
}: FreelancerCardProps) {
  return (
    <Card className="h-full hover:shadow-lg transition-all duration-200 border-gray-200">
      <CardContent className="p-6">
        <div className="flex items-start gap-4 mb-4">
          <Avatar className="h-16 w-16 border-2 border-gray-100">
            <AvatarImage src={avatarUrl} alt={name} />
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-lg text-gray-900 truncate">
                {name}
              </h3>
              {verified && (
                <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
              )}
            </div>
            <p className="text-sm text-gray-600 mb-2">{title}</p>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="font-medium text-gray-700">{rating.toFixed(1)}</span>
                <span className="text-gray-500">({reviewCount})</span>
              </div>
              {jobsCompleted && (
                <span>{jobsCompleted} jobs completed</span>
              )}
            </div>
          </div>
        </div>

        {category && (
          <Badge variant="secondary" className="mb-3">
            {category}
          </Badge>
        )}

        <p className="text-gray-700 text-sm mb-4 line-clamp-2 leading-relaxed">
          {description}
        </p>

        <div className="flex items-center gap-4 text-sm text-gray-600 mb-4 pb-4 border-b">
          {location && (
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              <span>{location}</span>
            </div>
          )}
          {deliveryTime && (
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{deliveryTime}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 mb-1">Starting from</p>
            <p className="text-lg font-bold text-gray-900">
              ₦{priceRange.min.toLocaleString()}
              {priceRange.max > priceRange.min && (
                <span className="text-sm font-normal text-gray-500">
                  {" "}- ₦{priceRange.max.toLocaleString()}
                </span>
              )}
            </p>
          </div>
          <Button asChild size="sm" className="ml-4">
            <Link to={`/profile/${id}`}>View Profile</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

