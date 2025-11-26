import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { X } from "lucide-react";

interface FilterSidebarProps {
  categories: Array<{ id: string; name: string; slug: string }>;
  onFilterChange: (filters: FilterState) => void;
  className?: string;
  initialFilters?: FilterState;
}

export interface FilterState {
  category: string;
  skillLevel: string;
  priceRange: [number, number];
  deliveryTime: string;
  minRating: number;
  location: string;
  verified: boolean;
}

export default function FilterSidebar({
  categories,
  onFilterChange,
  className = "",
  initialFilters,
}: FilterSidebarProps) {
  const [filters, setFilters] = useState<FilterState>(
    initialFilters || {
      category: "all",
      skillLevel: "all",
      priceRange: [0, 1000000],
      deliveryTime: "all",
      minRating: 0,
      location: "all",
      verified: false,
    }
  );

  // Update filters when initialFilters change
  useEffect(() => {
    if (initialFilters) {
      setFilters(initialFilters);
    }
  }, [initialFilters]);

  const updateFilter = (key: keyof FilterState, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters: FilterState = {
      category: "all",
      skillLevel: "all",
      priceRange: [0, 1000000],
      deliveryTime: "all",
      minRating: 0,
      location: "all",
      verified: false,
    };
    setFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  return (
    <div className={className}>
      <Card className="sticky top-24">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-lg font-semibold">Filters</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-8 px-2 text-xs"
          >
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Category Filter */}
          <div>
            <Label className="mb-3 block font-medium">Category</Label>
            <Select
              value={filters.category}
              onValueChange={(value) => updateFilter("category", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.slug}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Skill Level */}
          <div>
            <Label className="mb-3 block font-medium">Skill Level</Label>
            <Select
              value={filters.skillLevel}
              onValueChange={(value) => updateFilter("skillLevel", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Levels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="expert">Expert</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Price Range */}
          <div>
            <Label className="mb-3 block font-medium">
              Price Range: ₦{filters.priceRange[0].toLocaleString()} - ₦
              {filters.priceRange[1].toLocaleString()}
            </Label>
            <Slider
              value={filters.priceRange}
              onValueChange={(value) => updateFilter("priceRange", value)}
              min={0}
              max={1000000}
              step={10000}
              className="w-full"
            />
          </div>

          <Separator />

          {/* Delivery Time */}
          <div>
            <Label className="mb-3 block font-medium">Delivery Time</Label>
            <Select
              value={filters.deliveryTime}
              onValueChange={(value) => updateFilter("deliveryTime", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Any Time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any Time</SelectItem>
                <SelectItem value="1">1 day</SelectItem>
                <SelectItem value="3">3 days</SelectItem>
                <SelectItem value="7">1 week</SelectItem>
                <SelectItem value="14">2 weeks</SelectItem>
                <SelectItem value="30">1 month</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Rating */}
          <div>
            <Label className="mb-3 block font-medium">
              Minimum Rating: {filters.minRating > 0 ? `${filters.minRating}+` : "Any"}
            </Label>
            <Slider
              value={[filters.minRating]}
              onValueChange={(value) => updateFilter("minRating", value[0])}
              min={0}
              max={5}
              step={0.5}
              className="w-full"
            />
          </div>

          <Separator />

          {/* Location */}
          <div>
            <Label className="mb-3 block font-medium">Location</Label>
            <Select
              value={filters.location}
              onValueChange={(value) => updateFilter("location", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Locations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                <SelectItem value="lagos">Lagos</SelectItem>
                <SelectItem value="abuja">Abuja</SelectItem>
                <SelectItem value="port-harcourt">Port Harcourt</SelectItem>
                <SelectItem value="kano">Kano</SelectItem>
                <SelectItem value="remote">Remote</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Verified Only */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="verified"
              checked={filters.verified}
              onCheckedChange={(checked) => updateFilter("verified", checked)}
            />
            <Label
              htmlFor="verified"
              className="text-sm font-normal cursor-pointer"
            >
              Verified freelancers only
            </Label>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


