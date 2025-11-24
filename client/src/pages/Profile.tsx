import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Shield, Calendar, DollarSign } from "lucide-react";
import type { User as UserType, Booking, Pedestal, ServiceRequest } from "@shared/schema";
import { format } from "date-fns";
import adBanner from "@assets/generated_images/Marina_equipment_ad_banner_d7c1fc9b.png";
import { useAuth } from "@/contexts/AuthContext";

export default function Profile() {
  const { user: authUser } = useAuth();

  const { data: user, isLoading: userLoading } = useQuery<UserType>({
    queryKey: ["/api/auth/user"],
    enabled: !!authUser,
  });

  const { data: bookings } = useQuery<Booking[]>({
    queryKey: ["/api/bookings"],
  });

  const { data: pedestals } = useQuery<Pedestal[]>({
    queryKey: ["/api/pedestals"],
  });

  const { data: serviceRequests } = useQuery<ServiceRequest[]>({
    queryKey: ["/api/service-requests"],
  });

  const completedBookings = bookings?.filter(b => b.status === "completed") || [];
  const activeBookings = bookings?.filter(b => b.status === "active") || [];

  const getInitials = () => {
    if (!user?.email) return "U";
    return user.email.substring(0, 2).toUpperCase();
  };

  if (userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Profile Header */}
        <Card data-testid="card-profile-header">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <Avatar className="w-24 h-24" data-testid="avatar-user">
                  <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-2xl font-semibold" data-testid="text-user-name">
                    Marina User
                  </h1>
                  <div className="flex items-center gap-2 text-muted-foreground mt-1">
                    <Mail className="w-4 h-4" />
                    <p data-testid="text-user-email">{user?.email}</p>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className="mt-1" data-testid="badge-membership">
                      Premium Member
                    </Badge>
                    {user?.isAdmin && (
                      <Badge variant="default" data-testid="badge-admin">
                        <Shield className="w-3 h-3 mr-1" />
                        Admin
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Advertisement */}
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

        {/* Account Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card data-testid="card-total-bookings">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-total-bookings">
                {bookings?.length || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                {activeBookings.length} active
              </p>
            </CardContent>
          </Card>

          <Card data-testid="card-completed-stays">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Stays</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-completed-bookings">
                {completedBookings.length}
              </div>
              <p className="text-xs text-muted-foreground">
                Successful reservations
              </p>
            </CardContent>
          </Card>

          <Card data-testid="card-total-spent">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-total-spent">
                ${((bookings?.reduce((sum, b) => sum + b.estimatedCost, 0) || 0) / 100).toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                Lifetime value
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Booking History */}
        <Card data-testid="card-usage-history">
          <CardHeader>
            <CardTitle>Booking History</CardTitle>
          </CardHeader>
          <CardContent>
            {completedBookings.length === 0 ? (
              <div className="text-center py-8">
                <User className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                <p className="text-muted-foreground" data-testid="text-no-history">
                  No completed bookings yet.
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Your booking history will appear here once you complete your first stay.
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
                      className="flex items-center justify-between p-4 border rounded-lg hover-elevate"
                      data-testid={`row-history-${booking.id}`}
                    >
                      <div className="flex-1">
                        <div className="font-medium">
                          Berth {pedestal?.berthNumber || "Unknown"}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {format(new Date(booking.startDate), "PP")} - {format(new Date(booking.endDate), "PP")}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {days} day{days > 1 ? 's' : ''} • {booking.needsWater ? 'Water' : ''} {booking.needsElectricity ? '+ Electricity' : ''}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg">
                          ${(booking.estimatedCost / 100).toFixed(2)}
                        </div>
                        <Badge variant="outline" className="text-xs mt-1">
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

        {/* Active Bookings */}
        {activeBookings.length > 0 && (
          <Card data-testid="card-active-bookings">
            <CardHeader>
              <CardTitle>Active Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {activeBookings.map((booking) => {
                  const pedestal = pedestals?.find(p => p.id === booking.pedestalId);
                  const days = Math.ceil(
                    (new Date(booking.endDate).getTime() - new Date(booking.startDate).getTime()) /
                    (1000 * 60 * 60 * 24)
                  );

                  return (
                    <div
                      key={booking.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover-elevate"
                      data-testid={`row-active-${booking.id}`}
                    >
                      <div className="flex-1">
                        <div className="font-medium">
                          Berth {pedestal?.berthNumber || "Unknown"}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {format(new Date(booking.startDate), "PP")} - {format(new Date(booking.endDate), "PP")}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {days} day{days > 1 ? 's' : ''} • {booking.needsWater ? 'Water' : ''} {booking.needsElectricity ? '+ Electricity' : ''}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg">
                          ${(booking.estimatedCost / 100).toFixed(2)}
                        </div>
                        <Badge className="text-xs mt-1">
                          Active
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Service Requests */}
        <Card data-testid="card-service-requests">
          <CardHeader>
            <CardTitle>Service Requests</CardTitle>
          </CardHeader>
          <CardContent>
            {!serviceRequests?.length ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground" data-testid="text-no-service-requests">
                  No service requests found.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {serviceRequests.map((request) => {
                  const pedestal = pedestals?.find(p => p.id === request.pedestalId);

                  return (
                    <div
                      key={request.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover-elevate"
                      data-testid={`row-service-request-${request.id}`}
                    >
                      <div className="flex-1">
                        <div className="font-medium">
                          {request.requestType.charAt(0).toUpperCase() + request.requestType.slice(1)} Request
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Berth {pedestal?.berthNumber || "Unknown"} • {format(new Date(request.createdAt), "PP")}
                        </div>
                        {request.description && (
                          <div className="text-xs text-muted-foreground mt-1">
                            "{request.description}"
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <Badge variant={request.status === 'completed' ? 'default' : 'outline'} className="text-xs">
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
