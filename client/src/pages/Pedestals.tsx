import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Droplets, Zap, MapPin, Lock } from "lucide-react";
import type { Pedestal } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { PedestalUnlockDialog } from "@/components/PedestalUnlockDialog";
import { PedestalAccessEntry } from "@/components/PedestalAccessEntry";
import adBanner from "@assets/generated_images/Marina_equipment_ad_banner_d7c1fc9b.png";

export default function Pedestals() {
  const [selectedPedestal, setSelectedPedestal] = useState<Pedestal | null>(null);
  const [pedestalToUnlock, setPedestalToUnlock] = useState<Pedestal | null>(null);
  const [unlockedPedestals, setUnlockedPedestals] = useState<Set<string>>(new Set());
  const [showAccessEntry, setShowAccessEntry] = useState(true);

  const { data: pedestals, isLoading } = useQuery<Pedestal[]>({
    queryKey: ["/api/pedestals"],
  });

  const updatePedestalMutation = useMutation({
    mutationFn: async (data: { id: string; waterEnabled?: boolean; electricityEnabled?: boolean }) => {
      const { id, ...updateData } = data;
      return apiRequest("PATCH", `/api/pedestals/${id}`, updateData);
    },
    onSuccess: (updatedPedestal) => {
      queryClient.invalidateQueries({ queryKey: ["/api/pedestals"] });
      setSelectedPedestal(updatedPedestal as Pedestal);
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-500";
      case "occupied":
        return "bg-blue-500";
      case "maintenance":
        return "bg-amber-500";
      case "offline":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusLabel = (status: string) => {
    if (!status || typeof status !== 'string') return 'Unknown';
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const handleControlClick = (pedestal: Pedestal) => {
    if (!unlockedPedestals.has(pedestal.id)) {
      setPedestalToUnlock(pedestal);
    } else {
      setSelectedPedestal(pedestal);
    }
  };

  const handleUnlocked = (pedestal: Pedestal) => {
    setUnlockedPedestals((prev) => new Set(prev).add(pedestal.id));
    setSelectedPedestal(pedestal);
  };

  const handleAccessGranted = (pedestal: Pedestal) => {
    setUnlockedPedestals((prev) => new Set(prev).add(pedestal.id));
    setShowAccessEntry(false);
    setSelectedPedestal(pedestal);
  };

  const handleToggleService = (service: "water" | "electricity", enabled: boolean) => {
    if (!selectedPedestal) return;
    
    updatePedestalMutation.mutate({
      id: selectedPedestal.id,
      [service === "water" ? "waterEnabled" : "electricityEnabled"]: enabled,
    });
  };

  if (showAccessEntry) {
    return <PedestalAccessEntry onAccessGranted={handleAccessGranted} />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-4 space-y-4">
        <div className="h-8 bg-muted animate-pulse rounded w-32" />
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="space-y-3">
                <div className="h-6 bg-muted animate-pulse rounded w-24" />
                <div className="h-4 bg-muted animate-pulse rounded w-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold" data-testid="text-page-title">
            Smart Pedestals
          </h1>
          <Badge variant="outline" data-testid="badge-pedestal-count">
            {pedestals?.length || 0} Total
          </Badge>
        </div>

        <div className="space-y-4">
          {pedestals?.map((pedestal, index) => (
            <div key={pedestal.id}>
              <Card 
                className="hover-elevate cursor-pointer"
                onClick={() => handleControlClick(pedestal)}
                data-testid={`card-pedestal-${pedestal.id}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold" data-testid={`text-berth-${pedestal.id}`}>
                          Berth {pedestal.berthNumber}
                        </h3>
                        <Badge 
                          className={getStatusColor(pedestal.status)}
                          data-testid={`badge-status-${pedestal.id}`}
                        >
                          {getStatusLabel(pedestal.status)}
                        </Badge>
                        {unlockedPedestals.has(pedestal.id) && (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800">
                            Unlocked
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Droplets className="w-4 h-4" />
                          <span data-testid={`text-water-${pedestal.id}`}>
                            {pedestal.waterUsage}L
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Zap className="w-4 h-4" />
                          <span data-testid={`text-electricity-${pedestal.id}`}>
                            {pedestal.electricityUsage} kWh
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          <span>Map Position</span>
                        </div>
                      </div>
                    </div>
                    <Button 
                      variant={unlockedPedestals.has(pedestal.id) ? "default" : "outline"}
                      size="sm"
                      data-testid={`button-control-${pedestal.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleControlClick(pedestal);
                      }}
                    >
                      {unlockedPedestals.has(pedestal.id) ? (
                        "Control"
                      ) : (
                        <>
                          <Lock className="w-3 h-3 mr-1" />
                          Unlock
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {index === 4 && (
                <Card className="my-4" data-testid="card-advertisement-interstitial">
                  <CardContent className="p-0">
                    <div className="relative">
                      <img 
                        src={adBanner} 
                        alt="Advertisement" 
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <span className="absolute top-1 right-2 text-xs text-muted-foreground bg-background/80 px-2 py-0.5 rounded">
                        Advertisement
                      </span>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          ))}
        </div>
      </div>

      <PedestalUnlockDialog
        pedestal={pedestalToUnlock}
        open={!!pedestalToUnlock}
        onClose={() => setPedestalToUnlock(null)}
        onUnlocked={handleUnlocked}
      />

      <Dialog open={!!selectedPedestal} onOpenChange={() => setSelectedPedestal(null)}>
        <DialogContent className="sm:max-w-md" data-testid="dialog-pedestal-control">
          <DialogHeader>
            <DialogTitle data-testid="text-dialog-title">
              Berth {selectedPedestal?.berthNumber} Control
            </DialogTitle>
          </DialogHeader>
          {selectedPedestal && (
            <div className="space-y-6">
              <div>
                <Badge className={getStatusColor(selectedPedestal.status)}>
                  {getStatusLabel(selectedPedestal.status)}
                </Badge>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-card rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                      <Droplets className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <Label htmlFor="water-toggle" className="text-base font-medium cursor-pointer">
                        Water Service
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {selectedPedestal.waterUsage}L used
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="water-toggle"
                    checked={selectedPedestal.waterEnabled}
                    onCheckedChange={(checked) => handleToggleService("water", checked)}
                    disabled={updatePedestalMutation.isPending}
                    data-testid="switch-water-service"
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-card rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center">
                      <Zap className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <Label htmlFor="electricity-toggle" className="text-base font-medium cursor-pointer">
                        Electricity Service
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {selectedPedestal.electricityUsage} kWh used
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="electricity-toggle"
                    checked={selectedPedestal.electricityEnabled}
                    onCheckedChange={(checked) => handleToggleService("electricity", checked)}
                    disabled={updatePedestalMutation.isPending}
                    data-testid="switch-electricity-service"
                  />
                </div>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Current Session</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Water Cost:</span>
                    <span className="font-medium">
                      ${(selectedPedestal.waterEnabled ? ((selectedPedestal.waterUsage || 0) * 0.05) : 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Electricity Cost:</span>
                    <span className="font-medium">
                      ${(selectedPedestal.electricityEnabled ? ((selectedPedestal.electricityUsage || 0) * 0.15) : 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-semibold">
                    <span>Total:</span>
                    <span data-testid="text-session-total">
                      ${((selectedPedestal.waterEnabled ? ((selectedPedestal.waterUsage || 0) * 0.05) : 0) + (selectedPedestal.electricityEnabled ? ((selectedPedestal.electricityUsage || 0) * 0.15) : 0)).toFixed(2)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
