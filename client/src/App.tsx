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
import BottomNav from "@/components/BottomNav";

function Router() {
  return (
    <div className="pb-20">
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/pedestals" component={Pedestals} />
        <Route path="/bookings" component={Bookings} />
        <Route path="/services" component={Services} />
        <Route path="/profile" component={Profile} />
        <Route component={NotFound} />
      </Switch>
      <BottomNav />
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
