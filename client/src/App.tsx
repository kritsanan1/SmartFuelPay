import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Navigation from "@/components/navigation";
// Lazy load components for better performance
import { lazy, Suspense } from "react";
import { Loader2 } from "lucide-react";

const FuelDispenser = lazy(() => import("@/pages/fuel-dispenser"));
const AdminDashboard = lazy(() => import("@/pages/admin-dashboard"));
const CustomerPortal = lazy(() => import("@/pages/customer-portal"));
const AnalyticsDashboard = lazy(() => import("@/pages/analytics-dashboard"));
const MaintenanceSystem = lazy(() => import("@/pages/maintenance-system"));
const RealTimeMonitor = lazy(() => import("@/pages/real-time-monitor"));
const NotFound = lazy(() => import("@/pages/not-found"));

// Loading component for suspense fallback
function LoadingSpinner() {
  return (
    <div className="min-h-screen mobile-viewport-fix flex items-center justify-center bg-gradient-to-br from-blue-50 to-white">
      <div className="text-center spacing-mobile-sm">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
        <p className="text-mobile-body text-gray-600 mt-4">กำลังโหลด... / Loading...</p>
      </div>
    </div>
  );
}

function Router() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Switch>
        <Route path="/" component={FuelDispenser} />
        <Route path="/admin" component={AdminDashboard} />
        <Route path="/customer" component={CustomerPortal} />
        <Route path="/analytics" component={AnalyticsDashboard} />
        <Route path="/maintenance" component={MaintenanceSystem} />
        <Route path="/monitor" component={RealTimeMonitor} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
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
