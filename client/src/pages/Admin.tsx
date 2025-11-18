import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, Users, Anchor, Calendar, Wrench } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function Admin() {
  const { toast } = useToast();

  const { data: users, isLoading: usersLoading } = useQuery<any[]>({
    queryKey: ["/api/admin/users"],
  });

  const { data: pedestals, isLoading: pedestalsLoading } = useQuery<any[]>({
    queryKey: ["/api/admin/pedestals"],
  });

  const { data: bookings, isLoading: bookingsLoading } = useQuery<any[]>({
    queryKey: ["/api/admin/bookings"],
  });

  const { data: serviceRequests, isLoading: serviceRequestsLoading } = useQuery<any[]>({
    queryKey: ["/api/admin/service-requests"],
  });

  const handleToggleAdmin = async (userId: string, currentStatus: boolean) => {
    try {
      await apiRequest("PATCH", `/api/admin/users/${userId}`, { isAdmin: !currentStatus });

      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      
      toast({
        title: "Success",
        description: currentStatus ? "Admin privileges removed" : "Admin privileges granted",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user permissions",
        variant: "destructive",
      });
    }
  };

  if (usersLoading || pedestalsLoading || bookingsLoading || serviceRequestsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex items-center gap-3 mb-6">
        <Shield className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage all marina operations and users</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card data-testid="card-stat-users">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-users">{users?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              {users?.filter(u => u.isAdmin).length || 0} admins
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-stat-pedestals">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pedestals</CardTitle>
            <Anchor className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-pedestals">{pedestals?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              {pedestals?.filter(p => p.status === "occupied").length || 0} occupied
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-stat-bookings">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-bookings">{bookings?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              {bookings?.filter(b => b.status === "active").length || 0} active
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-stat-service-requests">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Service Requests</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-requests">{serviceRequests?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              {serviceRequests?.filter(r => r.status === "pending").length || 0} pending
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Users Management */}
      <Card data-testid="card-users-management">
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>Manage user accounts and admin privileges</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {users?.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-4 border rounded-lg"
                data-testid={`user-row-${user.id}`}
              >
                <div className="flex items-center gap-3">
                  <div>
                    <p className="font-medium" data-testid={`text-email-${user.id}`}>{user.email}</p>
                    <p className="text-sm text-muted-foreground" data-testid={`text-id-${user.id}`}>ID: {user.id}</p>
                  </div>
                  {user.isAdmin && (
                    <Badge variant="default" data-testid={`badge-admin-${user.id}`}>
                      <Shield className="h-3 w-3 mr-1" />
                      Admin
                    </Badge>
                  )}
                </div>
                <Button
                  variant={user.isAdmin ? "destructive" : "default"}
                  size="sm"
                  onClick={() => handleToggleAdmin(user.id, user.isAdmin)}
                  data-testid={`button-toggle-admin-${user.id}`}
                >
                  {user.isAdmin ? "Remove Admin" : "Make Admin"}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pedestals with Access Codes */}
      <Card data-testid="card-pedestals-management">
        <CardHeader>
          <CardTitle>Pedestals & Access Codes</CardTitle>
          <CardDescription>All pedestal information including access codes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {pedestals?.map((pedestal) => (
              <div
                key={pedestal.id}
                className="p-4 border rounded-lg"
                data-testid={`pedestal-card-${pedestal.id}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold" data-testid={`text-berth-${pedestal.id}`}>{pedestal.berthNumber}</span>
                  <Badge variant={pedestal.status === "occupied" ? "default" : "secondary"}>
                    {pedestal.status}
                  </Badge>
                </div>
                <div className="space-y-1 text-sm">
                  <p className="text-muted-foreground">
                    Access Code: <span className="font-mono font-bold text-foreground" data-testid={`text-code-${pedestal.id}`}>{pedestal.accessCode}</span>
                  </p>
                  <p className="text-muted-foreground">
                    Water: {pedestal.waterEnabled ? "✓ On" : "✗ Off"}
                  </p>
                  <p className="text-muted-foreground">
                    Electricity: {pedestal.electricityEnabled ? "✓ On" : "✗ Off"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
