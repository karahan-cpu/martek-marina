import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Anchor, Droplets, Zap, FileText, Calendar, Settings } from "lucide-react";
import type { Pedestal, Booking } from "@shared/schema";
import marinarBg from "@assets/generated_images/Marina_harbor_hero_background_a1b4edec.png";
import martekLogo from "@assets/generated_images/Martek_marina_logo_brand_3fbeaeb1.png";
import adBanner from "@assets/generated_images/Marina_equipment_ad_banner_d7c1fc9b.png";
import { Link } from "wouter";

export default function Dashboard() {
  const { data: pedestals, isLoading: pedestalsLoading } = useQuery<Pedestal[]>({
    queryKey: ["/api/pedestals"],
  });

  const { data: bookings, isLoading: bookingsLoading } = useQuery<Booking[]>({
    queryKey: ["/api/bookings"],
  });

  const activePedestals = pedestals?.filter(p => p.status === "occupied").length || 0;
  const totalWaterUsage = pedestals?.reduce((sum, p) => sum + p.waterUsage, 0) || 0;
  const totalElectricityUsage = pedestals?.reduce((sum, p) => sum + p.electricityUsage, 0) || 0;
  const pendingRequests = 0;

  return (
    <div className="min-h-screen bg-background">
      <div 
        className="relative h-48 bg-cover bg-center flex items-center justify-center"
        style={{ 
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${marinarBg})`,
        }}
      >
        <div className="text-center space-y-2">
          <img 
            src={martekLogo} 
            alt="Martek" 
            className="h-16 mx-auto mb-2"
            data-testid="img-martek-logo"
          />
          <h1 className="text-2xl font-semibold text-white font-accent" data-testid="text-app-title">
            Smart Marina Management
          </h1>
          <p className="text-sm text-white/90" data-testid="text-app-subtitle">
            www.martek.com.tr
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/pedestals">
            <Card className="hover-elevate active-elevate-2 cursor-pointer" data-testid="card-quick-action-pedestals">
              <CardContent className="flex flex-col items-center justify-center p-6 space-y-2">
                <Anchor className="w-8 h-8 text-primary" />
                <span className="text-sm font-medium text-center">Pedestals</span>
              </CardContent>
            </Card>
          </Link>

          <Link href="/bookings">
            <Card className="hover-elevate active-elevate-2 cursor-pointer" data-testid="card-quick-action-bookings">
              <CardContent className="flex flex-col items-center justify-center p-6 space-y-2">
                <Calendar className="w-8 h-8 text-primary" />
                <span className="text-sm font-medium text-center">Book Berth</span>
              </CardContent>
            </Card>
          </Link>

          <Link href="/services">
            <Card className="hover-elevate active-elevate-2 cursor-pointer" data-testid="card-quick-action-services">
              <CardContent className="flex flex-col items-center justify-center p-6 space-y-2">
                <FileText className="w-8 h-8 text-primary" />
                <span className="text-sm font-medium text-center">Services</span>
              </CardContent>
            </Card>
          </Link>

          <Link href="/profile">
            <Card className="hover-elevate active-elevate-2 cursor-pointer" data-testid="card-quick-action-profile">
              <CardContent className="flex flex-col items-center justify-center p-6 space-y-2">
                <Settings className="w-8 h-8 text-primary" />
                <span className="text-sm font-medium text-center">Profile</span>
              </CardContent>
            </Card>
          </Link>
        </div>

        <Card className="overflow-hidden" data-testid="card-advertisement-banner">
          <CardContent className="p-0">
            <div className="relative">
              <img 
                src={adBanner} 
                alt="Advertisement" 
                className="w-full h-24 object-cover"
                data-testid="img-ad-banner"
              />
              <span className="absolute top-1 right-2 text-xs text-muted-foreground bg-background/80 px-2 py-0.5 rounded">
                Advertisement
              </span>
            </div>
          </CardContent>
        </Card>

        <div>
          <h2 className="text-xl font-semibold mb-4" data-testid="text-section-overview">
            Overview
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card data-testid="card-stat-active-pedestals">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Pedestals</CardTitle>
                <Anchor className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {pedestalsLoading ? (
                  <div className="h-8 bg-muted animate-pulse rounded" />
                ) : (
                  <>
                    <div className="text-2xl font-bold" data-testid="text-active-pedestals-count">
                      {activePedestals}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Currently in use
                    </p>
                  </>
                )}
              </CardContent>
            </Card>

            <Card data-testid="card-stat-water-usage">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Water Usage</CardTitle>
                <Droplets className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {pedestalsLoading ? (
                  <div className="h-8 bg-muted animate-pulse rounded" />
                ) : (
                  <>
                    <div className="text-2xl font-bold" data-testid="text-water-usage">
                      {totalWaterUsage}L
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Total today
                    </p>
                  </>
                )}
              </CardContent>
            </Card>

            <Card data-testid="card-stat-power-usage">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Power Usage</CardTitle>
                <Zap className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {pedestalsLoading ? (
                  <div className="h-8 bg-muted animate-pulse rounded" />
                ) : (
                  <>
                    <div className="text-2xl font-bold" data-testid="text-power-usage">
                      {totalElectricityUsage} kWh
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Total today
                    </p>
                  </>
                )}
              </CardContent>
            </Card>

            <Card data-testid="card-stat-pending-requests">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
                <FileText className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-pending-requests-count">
                  {pendingRequests}
                </div>
                <p className="text-xs text-muted-foreground">
                  Service requests
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
