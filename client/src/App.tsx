import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import Pedestals from "@/pages/Pedestals";
import Bookings from "@/pages/Bookings";
import Services from "@/pages/Services";
import Profile from "@/pages/Profile";
import Map from "@/pages/Map";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import { TopNavBar } from "@/components/TopNavBar";

function ProtectedRoute({ component: Component }: { component: () => JSX.Element }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  if (!user) {
    return <Redirect to="/login" />;
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <TopNavBar />
      <main className="flex-1">
        <Component />
      </main>
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />
      <Route path="/">
        {() => <ProtectedRoute component={Dashboard} />}
      </Route>
      <Route path="/marinas">
        {() => <ProtectedRoute component={Pedestals} />}
      </Route>
      <Route path="/pedestals">
        {() => <ProtectedRoute component={Pedestals} />}
      </Route>
      <Route path="/map">
        {() => <ProtectedRoute component={Map} />}
      </Route>
      <Route path="/bookings">
        {() => <ProtectedRoute component={Bookings} />}
      </Route>
      <Route path="/services">
        {() => <ProtectedRoute component={Services} />}
      </Route>
      <Route path="/profile">
        {() => <ProtectedRoute component={Profile} />}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Router />
          <Toaster />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
