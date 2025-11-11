import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Droplets, Zap, ZoomIn, ZoomOut } from "lucide-react";
import type { Pedestal } from "@shared/schema";

export default function Map() {
  const [selectedPedestal, setSelectedPedestal] = useState<Pedestal | null>(null);
  const [zoom, setZoom] = useState(1);

  const { data: pedestals, isLoading } = useQuery<Pedestal[]>({
    queryKey: ["/api/pedestals"],
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "#10b981"; // green
      case "occupied":
        return "#3b82f6"; // blue
      case "maintenance":
        return "#f59e0b"; // amber
      case "offline":
        return "#9ca3af"; // gray
      default:
        return "#9ca3af";
    }
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.2, 2));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.2, 0.6));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="h-8 bg-muted animate-pulse rounded w-32 mb-6" />
        <Card>
          <CardContent className="p-6">
            <div className="h-96 bg-muted animate-pulse rounded" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold" data-testid="text-page-title">
            Marina Berth Map
          </h1>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handleZoomOut}
              data-testid="button-zoom-out"
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleZoomIn}
              data-testid="button-zoom-in"
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <CardTitle>Interactive Marina Layout</CardTitle>
              <div className="flex gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#10b981" }} />
                  <span className="text-sm">Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#3b82f6" }} />
                  <span className="text-sm">Occupied</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#f59e0b" }} />
                  <span className="text-sm">Maintenance</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#9ca3af" }} />
                  <span className="text-sm">Offline</span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div 
              className="relative bg-gradient-to-b from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 rounded-lg overflow-hidden"
              style={{ height: "600px" }}
              data-testid="map-container"
            >
              <svg
                width="100%"
                height="100%"
                viewBox="0 0 500 500"
                style={{
                  transform: `scale(${zoom})`,
                  transformOrigin: "center center",
                  transition: "transform 0.3s ease",
                }}
              >
                <defs>
                  <pattern id="water" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path
                      d="M0 10 Q 5 5, 10 10 T 20 10"
                      stroke="#60a5fa"
                      strokeWidth="1"
                      fill="none"
                      opacity="0.3"
                    />
                  </pattern>
                </defs>

                <rect x="0" y="0" width="500" height="500" fill="url(#water)" />

                <g className="docks">
                  <rect x="50" y="50" width="400" height="80" fill="#94a3b8" opacity="0.3" rx="4" />
                  <rect x="50" y="180" width="400" height="80" fill="#94a3b8" opacity="0.3" rx="4" />
                  <rect x="50" y="310" width="400" height="80" fill="#94a3b8" opacity="0.3" rx="4" />
                  <rect x="50" y="440" width="400" height="40" fill="#94a3b8" opacity="0.3" rx="4" />
                </g>

                {pedestals?.map((pedestal) => {
                  const x = pedestal.locationX;
                  const y = pedestal.locationY;
                  const color = getStatusColor(pedestal.status);

                  return (
                    <g
                      key={pedestal.id}
                      className="pedestal hover-elevate cursor-pointer"
                      onClick={() => setSelectedPedestal(pedestal)}
                      data-testid={`map-pedestal-${pedestal.id}`}
                    >
                      <circle
                        cx={x}
                        cy={y}
                        r="20"
                        fill={color}
                        opacity="0.9"
                        stroke="white"
                        strokeWidth="2"
                      />
                      <text
                        x={x}
                        y={y + 5}
                        textAnchor="middle"
                        fill="white"
                        fontSize="12"
                        fontWeight="bold"
                      >
                        {pedestal.berthNumber.split('-')[1]}
                      </text>
                    </g>
                  );
                })}
              </svg>

              <div className="absolute top-4 left-4 bg-background/90 backdrop-blur p-3 rounded-lg border">
                <p className="text-sm font-medium mb-1">Marina Layout</p>
                <p className="text-xs text-muted-foreground">
                  Tap any pedestal for details
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={!!selectedPedestal} onOpenChange={() => setSelectedPedestal(null)}>
        <DialogContent className="sm:max-w-md" data-testid="dialog-pedestal-details">
          <DialogHeader>
            <DialogTitle>
              Berth {selectedPedestal?.berthNumber}
            </DialogTitle>
          </DialogHeader>
          {selectedPedestal && (
            <div className="space-y-4">
              <div>
                <Badge style={{ backgroundColor: getStatusColor(selectedPedestal.status) }}>
                  {selectedPedestal.status.charAt(0).toUpperCase() + selectedPedestal.status.slice(1)}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="pt-4 text-center">
                    <Droplets className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                    <div className="text-2xl font-bold">{selectedPedestal.waterUsage}L</div>
                    <p className="text-xs text-muted-foreground">Water Usage</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-4 text-center">
                    <Zap className="w-8 h-8 mx-auto mb-2 text-amber-500" />
                    <div className="text-2xl font-bold">{selectedPedestal.electricityUsage}</div>
                    <p className="text-xs text-muted-foreground">kWh Used</p>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-2">
                    <Droplets className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-medium">Water</span>
                  </div>
                  <Badge variant={selectedPedestal.waterEnabled ? "default" : "outline"}>
                    {selectedPedestal.waterEnabled ? "ON" : "OFF"}
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-500" />
                    <span className="text-sm font-medium">Electricity</span>
                  </div>
                  <Badge variant={selectedPedestal.electricityEnabled ? "default" : "outline"}>
                    {selectedPedestal.electricityEnabled ? "ON" : "OFF"}
                  </Badge>
                </div>
              </div>

              <p className="text-xs text-muted-foreground text-center">
                Go to Pedestals page to control services
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
