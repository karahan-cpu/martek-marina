import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Anchor, MapPin, Clock, Shield } from "lucide-react";
import martekLogoUrl from "@assets/generated_images/Martek_marina_logo_brand_3fbeaeb1.png";
import marinaHeroUrl from "@assets/generated_images/Marina_harbor_hero_background_a1b4edec.png";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative h-[500px] sm:h-[550px] md:h-[600px] w-full overflow-hidden">
        <img
          src={marinaHeroUrl}
          alt="Luxury marina"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[hsl(210,100%,20%)]/90 via-[hsl(210,100%,20%)]/60 to-[hsl(210,100%,20%)]/40" />
        
        <div className="relative h-full flex flex-col items-center justify-center px-4 sm:px-6 text-center text-white">
          <img
            src={martekLogoUrl}
            alt="Martek Marina"
            className="h-12 sm:h-14 md:h-16 mb-6 sm:mb-8"
            data-testid="img-logo"
          />
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 px-4" data-testid="text-hero-title">
            Your Perfect Berth Awaits
          </h1>
          <p className="text-base sm:text-lg md:text-xl mb-6 sm:mb-8 max-w-2xl px-4" data-testid="text-hero-subtitle">
            Premium berth booking at Martek Marina. Experience world-class facilities, 
            smart pedestals, and seamless service.
          </p>
          <Button
            size="lg"
            className="h-12 sm:h-14 px-6 sm:px-8 text-base sm:text-lg font-semibold rounded-xl w-full max-w-xs sm:w-auto"
            onClick={() => window.location.href = "/api/login"}
            data-testid="button-login"
          >
            Log In to Book
          </Button>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <Card className="p-6 text-center hover-elevate">
            <div className="flex justify-center mb-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Anchor className="h-6 w-6 text-primary" />
              </div>
            </div>
            <h3 className="text-lg font-semibold mb-2" data-testid="text-feature-berths">
              Premium Berths
            </h3>
            <p className="text-sm text-muted-foreground">
              Modern berths with smart pedestals and full utilities
            </p>
          </Card>

          <Card className="p-6 text-center hover-elevate">
            <div className="flex justify-center mb-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <MapPin className="h-6 w-6 text-primary" />
              </div>
            </div>
            <h3 className="text-lg font-semibold mb-2" data-testid="text-feature-location">
              Prime Location
            </h3>
            <p className="text-sm text-muted-foreground">
              Strategic position with easy access to the Mediterranean
            </p>
          </Card>

          <Card className="p-6 text-center hover-elevate">
            <div className="flex justify-center mb-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Clock className="h-6 w-6 text-primary" />
              </div>
            </div>
            <h3 className="text-lg font-semibold mb-2" data-testid="text-feature-booking">
              Instant Booking
            </h3>
            <p className="text-sm text-muted-foreground">
              Book your berth online in minutes with real-time availability
            </p>
          </Card>

          <Card className="p-6 text-center hover-elevate">
            <div className="flex justify-center mb-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Shield className="h-6 w-6 text-primary" />
              </div>
            </div>
            <h3 className="text-lg font-semibold mb-2" data-testid="text-feature-service">
              24/7 Service
            </h3>
            <p className="text-sm text-muted-foreground">
              Round-the-clock support and comprehensive marina services
            </p>
          </Card>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-muted py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4 px-4" data-testid="text-cta-title">
            Ready to Experience Premium Marina Living?
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground mb-6 sm:mb-8 px-4" data-testid="text-cta-subtitle">
            Join Martek Marina and enjoy world-class facilities, secure berths, 
            and exceptional service.
          </p>
          <Button
            size="lg"
            className="h-12 sm:h-14 px-6 sm:px-8 text-base sm:text-lg font-semibold rounded-xl w-full max-w-xs sm:w-auto"
            onClick={() => window.location.href = "/api/login"}
            data-testid="button-login-cta"
          >
            Get Started
          </Button>
        </div>
      </div>
    </div>
  );
}
