import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Navigation from "@/components/navigation";
import FuelDispenser from "@/pages/fuel-dispenser";
import AdminDashboard from "@/pages/admin-dashboard";
import CustomerPortal from "@/pages/customer-portal";
import AnalyticsDashboard from "@/pages/analytics-dashboard";
import MaintenanceSystem from "@/pages/maintenance-system";
import RealTimeMonitor from "@/pages/real-time-monitor";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={FuelDispenser} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/customer" component={CustomerPortal} />
      <Route path="/analytics" component={AnalyticsDashboard} />
      <Route path="/maintenance" component={MaintenanceSystem} />
      <Route path="/monitor" component={RealTimeMonitor} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Navigation />
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
