import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import Pedestals from "@/pages/Pedestals";
import Bookings from "@/pages/Bookings";
import Services from "@/pages/Services";
import Profile from "@/pages/Profile";
import Map from "@/pages/Map";
import { TopNavBar } from "@/components/TopNavBar";

function Router() {
  return (
    <div className="min-h-screen flex flex-col">
      <TopNavBar />
      <main className="flex-1">
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/marinas" component={Pedestals} />
          <Route path="/pedestals" component={Pedestals} />
          <Route path="/map" component={Map} />
          <Route path="/bookings" component={Bookings} />
          <Route path="/services" component={Services} />
          <Route path="/profile" component={Profile} />
          <Route component={NotFound} />
        </Switch>
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
