import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Ship, MapPin, Anchor, Users, Award, Shield, ArrowRight, CalendarCheck, CreditCard, Droplets, Zap } from "lucide-react";
import { Link } from "wouter";
import { format } from "date-fns";
import type { Pedestal, Booking } from "@shared/schema";
import marinarBg from "@assets/generated_images/Marina_harbor_hero_background_a1b4edec.png";
import martekLogo from "@assets/generated_images/Martek_marina_logo_brand_3fbeaeb1.png";

export default function Dashboard() {
  const [selectedMarina, setSelectedMarina] = useState("");
  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");

  const { data: bookings, isLoading: bookingsLoading } = useQuery<Booking[]>({
    queryKey: ["/api/bookings"],
  });

  const { data: pedestals } = useQuery<Pedestal[]>({
    queryKey: ["/api/pedestals"],
  });

  const upcomingBookings = bookings?.filter(b => 
    b.status === "confirmed" || b.status === "pending"
  ).slice(0, 3) || [];

  const availableBerthsCount = pedestals?.filter(p => p.status === "available").length || 0;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-500";
      case "pending":
        return "bg-amber-500";
      case "active":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusLabel = (status: string) => {
    if (!status || typeof status !== 'string') return 'Unknown';
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section 
        className="relative h-[500px] sm:h-[550px] md:h-[600px] bg-cover bg-center flex items-center justify-center px-4"
        style={{ 
          backgroundImage: `linear-gradient(rgba(0, 20, 60, 0.7), rgba(0, 40, 80, 0.5)), url(${marinarBg})`,
        }}
        data-testid="section-hero"
      >
        <div className="container mx-auto px-4 sm:px-6 text-center text-white space-y-6 sm:space-y-8">
          <div className="space-y-3 sm:space-y-4">
            <img 
              src={martekLogo} 
              alt="Martek Marina" 
              className="h-14 sm:h-16 md:h-20 mx-auto opacity-90"
              data-testid="img-martek-logo"
            />
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight px-2" data-testid="text-hero-title">
              Your Perfect Berth Awaits
            </h1>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/90 max-w-2xl mx-auto px-4" data-testid="text-hero-subtitle">
              Premium marina berth booking made simple. Reserve your spot in minutes.
            </p>
          </div>

          {/* Booking Widget */}
          <Card className="max-w-4xl mx-auto bg-white/95 dark:bg-card/95 backdrop-blur-lg border-2" data-testid="card-booking-widget">
            <CardContent className="p-4 sm:p-6 md:p-8">
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-primary" />
                      Marina Location
                    </label>
                    <select 
                      className="w-full h-12 sm:h-14 px-3 sm:px-4 text-sm sm:text-base rounded-xl border-2 bg-background text-foreground font-medium focus:ring-2 focus:ring-accent focus:border-accent"
                      data-testid="select-marina-location"
                      value={selectedMarina}
                      onChange={(e) => setSelectedMarina(e.target.value)}
                    >
                      <option value="">Select Marina</option>
                      <option value="marina-a">Martek Marina A</option>
                      <option value="marina-b">Martek Marina B</option>
                      <option value="marina-c">Martek Marina C</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-primary" />
                      Dates
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <input 
                        type="date"
                        className="w-full h-12 sm:h-14 px-2 sm:px-4 text-xs sm:text-base rounded-xl border-2 bg-background text-foreground font-medium focus:ring-2 focus:ring-accent focus:border-accent"
                        data-testid="input-check-in-date"
                        value={checkInDate}
                        onChange={(e) => setCheckInDate(e.target.value)}
                      />
                      <input 
                        type="date"
                        className="w-full h-12 sm:h-14 px-2 sm:px-4 text-xs sm:text-base rounded-xl border-2 bg-background text-foreground font-medium focus:ring-2 focus:ring-accent focus:border-accent"
                        data-testid="input-check-out-date"
                        value={checkOutDate}
                        onChange={(e) => setCheckOutDate(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <Link href="/bookings">
                  <Button 
                    size="lg" 
                    className="w-full h-12 sm:h-14 text-base sm:text-lg font-semibold rounded-xl"
                    data-testid="button-search-berths"
                  >
                    Search Berths
                    <ArrowRight className="ml-2 w-4 sm:w-5 h-4 sm:h-5" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Upcoming Bookings */}
      <section className="py-12 sm:py-16 bg-background" data-testid="section-upcoming-bookings">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold" data-testid="text-upcoming-bookings-title">
              Your Upcoming Bookings
            </h2>
            <Link href="/bookings">
              <Button variant="outline" className="rounded-xl w-full sm:w-auto" data-testid="button-view-all-bookings">
                View All
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
          
          {bookingsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="border-2">
                  <CardHeader>
                    <div className="h-6 bg-muted animate-pulse rounded w-32" />
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="h-4 bg-muted animate-pulse rounded w-full" />
                    <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : upcomingBookings.length === 0 ? (
            <Card className="border-2" data-testid="card-no-bookings">
              <CardContent className="py-16 text-center space-y-4">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                  <Calendar className="w-8 h-8 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">No Upcoming Bookings</h3>
                  <p className="text-muted-foreground mb-6">
                    Book your perfect berth and start your maritime journey
                  </p>
                  <Link href="/bookings">
                    <Button className="rounded-xl" data-testid="button-create-first-booking">
                      Create Your First Booking
                      <Ship className="ml-2 w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {upcomingBookings.map((booking) => (
                <Card key={booking.id} className="border-2 hover-elevate" data-testid={`card-booking-${booking.id}`}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl">Berth {pedestals?.find(p => p.id === booking.pedestalId)?.berthNumber || 'N/A'}</CardTitle>
                      <Badge className={`${getStatusColor(booking.status)} text-white`} data-testid={`badge-status-${booking.id}`}>
                        {getStatusLabel(booking.status)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span data-testid={`text-dates-${booking.id}`}>
                        {format(new Date(booking.startDate), 'MMM d')} - {format(new Date(booking.endDate), 'MMM d, yyyy')}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {booking.needsWater && (
                        <Badge variant="secondary" className="text-xs">
                          <Droplets className="w-3 h-3 mr-1" />
                          Water
                        </Badge>
                      )}
                      {booking.needsElectricity && (
                        <Badge variant="secondary" className="text-xs">
                          <Zap className="w-3 h-3 mr-1" />
                          Electricity
                        </Badge>
                      )}
                    </div>
                    <div className="pt-2 border-t">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Total Cost</span>
                        <span className="text-lg font-bold text-primary" data-testid={`text-cost-${booking.id}`}>
                          ${(booking.estimatedCost / 100).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Featured Marinas */}
      <section className="py-12 sm:py-16 bg-muted/30 dark:bg-muted/10" data-testid="section-featured-marinas">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
              Our Premium Marinas
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
              Choose from our selection of world-class marina facilities
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <Card className="border-2 hover-elevate overflow-hidden" data-testid="card-marina-a">
              <div className="h-48 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                <Ship className="w-16 h-16 text-white" />
              </div>
              <CardContent className="p-6 space-y-4">
                <div>
                  <h3 className="text-2xl font-bold mb-2">Martek Marina A</h3>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>Istanbul, Turkey</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="text-xs">
                    <Droplets className="w-3 h-3 mr-1" />
                    Water
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    <Zap className="w-3 h-3 mr-1" />
                    Power
                  </Badge>
                  <Badge variant="secondary" className="text-xs">WiFi</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Premium facilities with 150+ berths available
                </p>
                <Link href="/marinas">
                  <Button className="w-full rounded-xl" data-testid="button-view-marina-a">
                    View Availability
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="border-2 hover-elevate overflow-hidden" data-testid="card-marina-b">
              <div className="h-48 bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center">
                <Anchor className="w-16 h-16 text-white" />
              </div>
              <CardContent className="p-6 space-y-4">
                <div>
                  <h3 className="text-2xl font-bold mb-2">Martek Marina B</h3>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>Bodrum, Turkey</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="text-xs">
                    <Droplets className="w-3 h-3 mr-1" />
                    Water
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    <Zap className="w-3 h-3 mr-1" />
                    Power
                  </Badge>
                  <Badge variant="secondary" className="text-xs">WiFi</Badge>
                  <Badge variant="secondary" className="text-xs">24/7 Security</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Luxury marina with 200+ berths and full amenities
                </p>
                <Link href="/marinas">
                  <Button className="w-full rounded-xl" data-testid="button-view-marina-b">
                    View Availability
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="border-2 hover-elevate overflow-hidden" data-testid="card-marina-c">
              <div className="h-48 bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center">
                <Ship className="w-16 h-16 text-white" />
              </div>
              <CardContent className="p-6 space-y-4">
                <div>
                  <h3 className="text-2xl font-bold mb-2">Martek Marina C</h3>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>Çeşme, Turkey</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="text-xs">
                    <Droplets className="w-3 h-3 mr-1" />
                    Water
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    <Zap className="w-3 h-3 mr-1" />
                    Power
                  </Badge>
                  <Badge variant="secondary" className="text-xs">WiFi</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Modern facilities with 100+ berths in a scenic Aegean location
                </p>
                <Link href="/marinas">
                  <Button className="w-full rounded-xl" data-testid="button-view-marina-c">
                    View Availability
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="bg-secondary/30 dark:bg-secondary/10 py-12 sm:py-16 border-y" data-testid="section-trust-indicators">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 text-center">
            <div className="space-y-1 sm:space-y-2">
              <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary" data-testid="text-stat-berths">450+</div>
              <div className="text-xs sm:text-sm font-medium text-muted-foreground uppercase tracking-wide">Available Berths</div>
            </div>
            <div className="space-y-1 sm:space-y-2">
              <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary" data-testid="text-stat-marinas">8</div>
              <div className="text-xs sm:text-sm font-medium text-muted-foreground uppercase tracking-wide">Premium Marinas</div>
            </div>
            <div className="space-y-1 sm:space-y-2">
              <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary" data-testid="text-stat-customers">2,500+</div>
              <div className="text-xs sm:text-sm font-medium text-muted-foreground uppercase tracking-wide">Happy Boaters</div>
            </div>
            <div className="space-y-1 sm:space-y-2">
              <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary" data-testid="text-stat-years">15</div>
              <div className="text-xs sm:text-sm font-medium text-muted-foreground uppercase tracking-wide">Years of Service</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-12 sm:py-16 md:py-20" data-testid="section-how-it-works">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4" data-testid="text-how-it-works-title">
              How It Works
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
              Booking your perfect berth has never been easier
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto">
            <Card className="relative border-2 hover-elevate" data-testid="card-step-1">
              <CardContent className="p-8 text-center space-y-4">
                <div className="w-16 h-16 bg-primary text-primary-foreground rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto">
                  1
                </div>
                <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mx-auto">
                  <MapPin className="w-6 h-6 text-accent" />
                </div>
                <h3 className="text-xl font-bold">Select Marina & Dates</h3>
                <p className="text-muted-foreground">
                  Choose your preferred marina location and booking dates
                </p>
              </CardContent>
            </Card>

            <Card className="relative border-2 hover-elevate" data-testid="card-step-2">
              <CardContent className="p-8 text-center space-y-4">
                <div className="w-16 h-16 bg-primary text-primary-foreground rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto">
                  2
                </div>
                <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mx-auto">
                  <CalendarCheck className="w-6 h-6 text-accent" />
                </div>
                <h3 className="text-xl font-bold">Choose Your Berth</h3>
                <p className="text-muted-foreground">
                  View available berths with instant pricing and amenities
                </p>
              </CardContent>
            </Card>

            <Card className="relative border-2 hover-elevate" data-testid="card-step-3">
              <CardContent className="p-8 text-center space-y-4">
                <div className="w-16 h-16 bg-primary text-primary-foreground rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto">
                  3
                </div>
                <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mx-auto">
                  <CreditCard className="w-6 h-6 text-accent" />
                </div>
                <h3 className="text-xl font-bold">Secure & Pay</h3>
                <p className="text-muted-foreground">
                  Complete your booking with our secure payment system
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-8 sm:mt-12">
            <Link href="/bookings">
              <Button size="lg" className="text-base sm:text-lg h-12 sm:h-14 px-6 sm:px-8 rounded-xl w-full sm:w-auto" data-testid="button-start-booking">
                Start Booking Now
                <ArrowRight className="ml-2 w-4 sm:w-5 h-4 sm:h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="bg-muted/50 py-12 sm:py-16 md:py-20" data-testid="section-why-choose">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
              Why Choose Martek?
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
              Premium marina services with unmatched quality and reliability
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto">
            <Card className="border-2" data-testid="card-feature-premium">
              <CardContent className="p-8 text-center space-y-4">
                <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto">
                  <Award className="w-8 h-8 text-accent" />
                </div>
                <h3 className="text-xl font-bold">Premium Facilities</h3>
                <p className="text-muted-foreground">
                  Top-tier amenities including water, electricity, WiFi, and 24/7 security
                </p>
              </CardContent>
            </Card>

            <Card className="border-2" data-testid="card-feature-secure">
              <CardContent className="p-8 text-center space-y-4">
                <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto">
                  <Shield className="w-8 h-8 text-accent" />
                </div>
                <h3 className="text-xl font-bold">Secure Booking</h3>
                <p className="text-muted-foreground">
                  Safe and encrypted payment processing with instant confirmation
                </p>
              </CardContent>
            </Card>

            <Card className="border-2" data-testid="card-feature-support">
              <CardContent className="p-8 text-center space-y-4">
                <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto">
                  <Users className="w-8 h-8 text-accent" />
                </div>
                <h3 className="text-xl font-bold">24/7 Support</h3>
                <p className="text-muted-foreground">
                  Dedicated marina staff ready to assist you anytime, anywhere
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 md:py-20" data-testid="section-cta">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <div className="max-w-3xl mx-auto space-y-4 sm:space-y-6">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold px-4">
              Ready to Book Your Berth?
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground px-4">
              Join thousands of satisfied boaters who trust Martek for their marina needs
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-stretch sm:items-center px-4">
              <Link href="/bookings">
                <Button size="lg" className="text-lg h-14 px-8 rounded-xl" data-testid="button-cta-book-now">
                  Book Now
                  <Ship className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/marinas">
                <Button size="lg" variant="outline" className="text-lg h-14 px-8 rounded-xl" data-testid="button-cta-view-marinas">
                  View Marinas
                  <MapPin className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
