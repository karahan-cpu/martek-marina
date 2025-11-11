import { Home, Anchor, Calendar, FileText, User } from "lucide-react";
import { Link, useLocation } from "wouter";

export default function BottomNav() {
  const [location] = useLocation();

  const navItems = [
    { path: "/", icon: Home, label: "Dashboard", testId: "nav-dashboard" },
    { path: "/pedestals", icon: Anchor, label: "Pedestals", testId: "nav-pedestals" },
    { path: "/bookings", icon: Calendar, label: "Bookings", testId: "nav-bookings" },
    { path: "/services", icon: FileText, label: "Services", testId: "nav-services" },
    { path: "/profile", icon: User, label: "Profile", testId: "nav-profile" },
  ];

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 bg-card border-t z-50 safe-area-bottom"
      data-testid="nav-bottom"
    >
      <div className="max-w-7xl mx-auto px-2">
        <div className="flex items-center justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.path;
            
            return (
              <Link key={item.path} href={item.path}>
                <button
                  className={`flex flex-col items-center justify-center py-3 px-4 min-w-[60px] gap-1 hover-elevate active-elevate-2 rounded-lg transition-colors ${
                    isActive ? "text-primary" : "text-muted-foreground"
                  }`}
                  data-testid={item.testId}
                >
                  <Icon 
                    className="w-6 h-6" 
                    strokeWidth={isActive ? 2.5 : 2}
                    fill={isActive ? "currentColor" : "none"}
                  />
                  <span 
                    className={`text-xs ${isActive ? "font-semibold" : "font-normal"}`}
                  >
                    {item.label}
                  </span>
                </button>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
