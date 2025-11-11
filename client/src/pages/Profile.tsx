import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { User, Anchor, Edit } from "lucide-react";
import type { User as UserType, Booking, Pedestal } from "@shared/schema";
import { format } from "date-fns";
import adBanner from "@assets/generated_images/Marina_equipment_ad_banner_d7c1fc9b.png";

export default function Profile() {
  const [user] = useState<UserType>({
    id: "demo-user-id",
    username: "marina_user",
    password: "",
    fullName: "Captain Smith",
    boatName: "Sea Breeze",
    boatType: "Sailing Yacht",
    boatLength: "42 ft",
    boatRegistration: "MB-2024-001",
  });

  const { data: bookings } = useQuery<Booking[]>({
    queryKey: ["/api/bookings"],
  });

  const { data: pedestals } = useQuery<Pedestal[]>({
    queryKey: ["/api/pedestals"],
  });

  const completedBookings = bookings?.filter(b => b.status === "completed") || [];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        <Card data-testid="card-profile-header">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <Avatar className="w-24 h-24" data-testid="avatar-user">
                  <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                    {user.fullName.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-2xl font-semibold" data-testid="text-user-name">
                    {user.fullName}
                  </h1>
                  <p className="text-muted-foreground" data-testid="text-username">
                    @{user.username}
                  </p>
                  <Badge className="mt-2" data-testid="badge-membership">
                    Premium Member
                  </Badge>
                </div>
              </div>
              <Button variant="outline" size="sm" data-testid="button-edit-profile">
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-advertisement-profile">
          <CardContent className="p-0">
            <div className="relative">
              <img 
                src={adBanner} 
                alt="Advertisement" 
                className="w-full h-24 object-cover rounded-lg"
              />
              <span className="absolute top-1 right-2 text-xs text-muted-foreground bg-background/80 px-2 py-0.5 rounded">
                Advertisement
              </span>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-boat-info">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="flex items-center gap-2">
              <Anchor className="w-5 h-5" />
              Boat Information
            </CardTitle>
            <Button variant="ghost" size="sm" data-testid="button-edit-boat">
              <Edit className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Boat Name</p>
                <p className="font-medium" data-testid="text-boat-name">{user.boatName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Type</p>
                <p className="font-medium" data-testid="text-boat-type">{user.boatType}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Length</p>
                <p className="font-medium" data-testid="text-boat-length">{user.boatLength}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Registration</p>
                <p className="font-medium" data-testid="text-boat-registration">{user.boatRegistration}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-usage-history">
          <CardHeader>
            <CardTitle>Usage History</CardTitle>
          </CardHeader>
          <CardContent>
            {completedBookings.length === 0 ? (
              <div className="text-center py-8">
                <User className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                <p className="text-muted-foreground" data-testid="text-no-history">
                  No usage history yet.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {completedBookings.map((booking) => {
                  const pedestal = pedestals?.find(p => p.id === booking.pedestalId);
                  const days = Math.ceil(
                    (new Date(booking.endDate).getTime() - new Date(booking.startDate).getTime()) / 
                    (1000 * 60 * 60 * 24)
                  );
                  
                  return (
                    <div 
                      key={booking.id} 
                      className="flex items-center justify-between p-3 border rounded-lg"
                      data-testid={`row-history-${booking.id}`}
                    >
                      <div className="flex-1">
                        <div className="font-medium">
                          Berth {pedestal?.berthNumber}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {format(new Date(booking.startDate), "PP")} - {format(new Date(booking.endDate), "PP")}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {days} day{days > 1 ? 's' : ''}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">
                          ${(booking.estimatedCost / 100).toFixed(2)}
                        </div>
                        <Badge variant="outline" className="text-xs">
                          Completed
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-3xl font-bold text-primary" data-testid="text-total-bookings">
                  {bookings?.length || 0}
                </div>
                <p className="text-sm text-muted-foreground">Total Bookings</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary" data-testid="text-total-spent">
                  ${((bookings?.reduce((sum, b) => sum + b.estimatedCost, 0) || 0) / 100).toFixed(2)}
                </div>
                <p className="text-sm text-muted-foreground">Total Spent</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
