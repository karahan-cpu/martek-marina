import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Calendar as CalendarIcon } from "lucide-react";
import type { Booking, Pedestal } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { format } from "date-fns";
import adBanner from "@assets/generated_images/Marina_equipment_ad_banner_d7c1fc9b.png";
import { useToast } from "@/hooks/use-toast";

export default function Bookings() {
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [selectedPedestalId, setSelectedPedestalId] = useState<string>("");
  const [needsWater, setNeedsWater] = useState(true);
  const [needsElectricity, setNeedsElectricity] = useState(true);
  const { toast } = useToast();

  const { data: bookings, isLoading: bookingsLoading } = useQuery<Booking[]>({
    queryKey: ["/api/bookings"],
  });

  const { data: pedestals, isLoading: pedestalsLoading } = useQuery<Pedestal[]>({
    queryKey: ["/api/pedestals"],
  });

  const availablePedestals = pedestals?.filter(p => p.status === "available") || [];

  const createBookingMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/bookings", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      setStartDate(undefined);
      setEndDate(undefined);
      setSelectedPedestalId("");
      toast({
        title: "Booking Created",
        description: "Your berth booking has been confirmed successfully.",
      });
    },
  });

  const handleCreateBooking = () => {
    if (!startDate || !endDate || !selectedPedestalId) {
      toast({
        title: "Missing Information",
        description: "Please select dates and a pedestal.",
        variant: "destructive",
      });
      return;
    }

    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const estimatedCost = days * 5000; // $50 per day in cents

    createBookingMutation.mutate({
      userId: "demo-user-id",
      pedestalId: selectedPedestalId,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      needsWater,
      needsElectricity,
      status: "confirmed",
      estimatedCost,
    });
  };

  const myBookings = bookings?.filter(b => b.status !== "cancelled") || [];

  if (bookingsLoading || pedestalsLoading) {
    return (
      <div className="min-h-screen bg-background p-4 space-y-4">
        <div className="h-8 bg-muted animate-pulse rounded w-32" />
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="space-y-3">
                <div className="h-6 bg-muted animate-pulse rounded w-full" />
                <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        <h1 className="text-2xl font-semibold" data-testid="text-page-title">
          Book a Berth
        </h1>

        <Card data-testid="card-booking-form">
          <CardHeader>
            <CardTitle>Create New Booking</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label>Start Date</Label>
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  disabled={(date) => date < new Date()}
                  className="rounded-md border"
                  data-testid="calendar-start-date"
                />
              </div>

              <div className="space-y-3">
                <Label>End Date</Label>
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                  disabled={(date) => !startDate || date <= startDate}
                  className="rounded-md border"
                  data-testid="calendar-end-date"
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="pedestal-select">Select Pedestal</Label>
              <Select value={selectedPedestalId} onValueChange={setSelectedPedestalId}>
                <SelectTrigger id="pedestal-select" data-testid="select-pedestal">
                  <SelectValue placeholder="Choose an available berth" />
                </SelectTrigger>
                <SelectContent>
                  {availablePedestals.map((pedestal) => (
                    <SelectItem 
                      key={pedestal.id} 
                      value={pedestal.id}
                      data-testid={`select-item-${pedestal.id}`}
                    >
                      Berth {pedestal.berthNumber} - Available
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label>Services Required</Label>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="water-service"
                    checked={needsWater}
                    onCheckedChange={(checked) => setNeedsWater(checked as boolean)}
                    data-testid="checkbox-water-service"
                  />
                  <Label htmlFor="water-service" className="cursor-pointer">
                    Water Service
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="electricity-service"
                    checked={needsElectricity}
                    onCheckedChange={(checked) => setNeedsElectricity(checked as boolean)}
                    data-testid="checkbox-electricity-service"
                  />
                  <Label htmlFor="electricity-service" className="cursor-pointer">
                    Electricity Service
                  </Label>
                </div>
              </div>
            </div>

            {startDate && endDate && selectedPedestalId && (
              <Card className="bg-muted/50">
                <CardContent className="pt-6 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Duration:</span>
                    <span className="font-medium">
                      {Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))} days
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Berth Rate:</span>
                    <span className="font-medium">$50/day</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-semibold">
                    <span>Estimated Total:</span>
                    <span data-testid="text-estimated-cost">
                      ${(Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) * 50).toFixed(2)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}

            <Button
              className="w-full h-14"
              onClick={handleCreateBooking}
              disabled={!startDate || !endDate || !selectedPedestalId || createBookingMutation.isPending}
              data-testid="button-create-booking"
            >
              {createBookingMutation.isPending ? "Creating..." : "Confirm Booking"}
            </Button>
          </CardContent>
        </Card>

        <div className="sticky bottom-0 bg-background border-t pt-4" data-testid="card-advertisement-sticky">
          <Card>
            <CardContent className="p-0">
              <div className="relative">
                <img 
                  src={adBanner} 
                  alt="Advertisement" 
                  className="w-full h-16 object-cover rounded-lg"
                />
                <span className="absolute top-1 right-2 text-xs text-muted-foreground bg-background/80 px-2 py-0.5 rounded">
                  Advertisement
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold" data-testid="text-my-bookings-title">
            My Bookings
          </h2>
          {myBookings.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <CalendarIcon className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                <p className="text-muted-foreground" data-testid="text-no-bookings">
                  No bookings yet. Create your first booking above!
                </p>
              </CardContent>
            </Card>
          ) : (
            myBookings.map((booking) => {
              const pedestal = pedestals?.find(p => p.id === booking.pedestalId);
              return (
                <Card key={booking.id} data-testid={`card-booking-${booking.id}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold">
                            Berth {pedestal?.berthNumber}
                          </h3>
                          <Badge variant={booking.status === "confirmed" ? "default" : "secondary"}>
                            {booking.status}
                          </Badge>
                        </div>
                        <div className="space-y-1 text-sm text-muted-foreground">
                          <div>
                            {format(new Date(booking.startDate), "PPP")} - {format(new Date(booking.endDate), "PPP")}
                          </div>
                          <div>
                            Services: {booking.needsWater && "Water"}{booking.needsWater && booking.needsElectricity && ", "}{booking.needsElectricity && "Electricity"}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold">
                          ${(booking.estimatedCost / 100).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
