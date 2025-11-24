import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Shield, Calendar, DollarSign } from "lucide-react";
import type { User as UserType, Pedestal, ServiceRequest } from "@shared/schema";
import { format } from "date-fns";
import adBanner from "@assets/generated_images/Marina_equipment_ad_banner_d7c1fc9b.png";
import { useAuth } from "@/contexts/AuthContext";

export default function Profile() {
  const { user: authUser } = useAuth();

  const { data: user, isLoading: userLoading } = useQuery<UserType>({
    queryKey: ["/api/auth/user"],
    enabled: !!authUser,
  });

  const { data: serviceRequests } = useQuery<ServiceRequest[]>({
    queryKey: ["/api/service-requests"],
  });

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
                          {request.pedestalId ? `Pedestal: ${request.pedestalId}` : 'General Request'} • {format(new Date(request.createdAt), "PP")}
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
