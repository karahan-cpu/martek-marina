import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Anchor, Wifi, Shield, Utensils, Waves } from "lucide-react";
import type { Marina } from "@shared/schema";

export default function Marinas() {
  const { data: marinas, isLoading } = useQuery<Marina[]>({
    queryKey: ["/api/marinas"],
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="h-4 bg-muted rounded"></div>
                  <div className="h-4 bg-muted rounded w-5/6"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2" data-testid="text-page-title">Premium Marinas</h1>
        <p className="text-muted-foreground" data-testid="text-page-description">
          Discover our world-class marina facilities across Turkey
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {marinas?.map((marina) => (
          <Card key={marina.id} className="overflow-hidden" data-testid={`card-marina-${marina.id}`}>
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <CardTitle className="text-2xl mb-2" data-testid={`text-marina-name-${marina.id}`}>
                    {marina.name}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2" data-testid={`text-marina-location-${marina.id}`}>
                    <MapPin className="h-4 w-4" />
                    {marina.location}
                  </CardDescription>
                </div>
                {marina.isPremium && (
                  <Badge variant="default" data-testid={`badge-premium-${marina.id}`}>
                    <Waves className="h-3 w-3 mr-1" />
                    Premium
                  </Badge>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <p className="text-sm text-muted-foreground" data-testid={`text-marina-description-${marina.id}`}>
                {marina.description}
              </p>

              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Anchor className="h-4 w-4" />
                  Facilities & Amenities
                </h3>
                <div className="flex flex-wrap gap-2">
                  {marina.amenities.map((amenity, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="text-xs"
                      data-testid={`badge-amenity-${marina.id}-${index}`}
                    >
                      {amenity}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Anchor className="h-4 w-4" />
                  <span data-testid={`text-berths-${marina.id}`}>
                    {marina.totalBerths} Premium Berths
                  </span>
                </div>
                <div className="flex gap-2">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <Wifi className="h-4 w-4 text-muted-foreground" />
                  <Utensils className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
