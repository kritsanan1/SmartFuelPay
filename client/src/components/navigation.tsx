import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Menu, Fuel, Home, Shield, User, BarChart3, Wrench, Activity } from "lucide-react";

export default function Navigation() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const isActive = (path: string) => location === path;

  const NavItems = () => (
    <div className="flex flex-col space-y-2">
      <Link href="/">
        <Button 
          variant={isActive("/") ? "default" : "ghost"} 
          className="w-full justify-start"
          onClick={() => setIsOpen(false)}
        >
          <Home className="mr-2 h-4 w-4" />
          Fuel Dispenser
        </Button>
      </Link>
      
      <Link href="/customer">
        <Button 
          variant={isActive("/customer") ? "default" : "ghost"} 
          className="w-full justify-start"
          onClick={() => setIsOpen(false)}
        >
          <User className="mr-2 h-4 w-4" />
          Customer Portal
        </Button>
      </Link>
      
      <Link href="/admin">
        <Button 
          variant={isActive("/admin") ? "default" : "ghost"} 
          className="w-full justify-start"
          onClick={() => setIsOpen(false)}
        >
          <Shield className="mr-2 h-4 w-4" />
          Admin Dashboard
          <Badge variant="secondary" className="ml-auto">Admin</Badge>
        </Button>
      </Link>

      <Link href="/analytics">
        <Button 
          variant={isActive("/analytics") ? "default" : "ghost"} 
          className="w-full justify-start"
          onClick={() => setIsOpen(false)}
        >
          <BarChart3 className="mr-2 h-4 w-4" />
          Analytics
          <Badge variant="secondary" className="ml-auto">Pro</Badge>
        </Button>
      </Link>

      <Link href="/maintenance">
        <Button 
          variant={isActive("/maintenance") ? "default" : "ghost"} 
          className="w-full justify-start"
          onClick={() => setIsOpen(false)}
        >
          <Wrench className="mr-2 h-4 w-4" />
          Maintenance
          <Badge variant="secondary" className="ml-auto">Tech</Badge>
        </Button>
      </Link>

      <Link href="/monitor">
        <Button 
          variant={isActive("/monitor") ? "default" : "ghost"} 
          className="w-full justify-start"
          onClick={() => setIsOpen(false)}
        >
          <Activity className="mr-2 h-4 w-4" />
          Real-Time Monitor
          <Badge variant="secondary" className="ml-auto">Live</Badge>
        </Button>
      </Link>
    </div>
  );

  return (
    <>
      {/* Mobile Navigation */}
      <div className="lg:hidden">
        <div className="fixed top-4 left-4 z-50">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="bg-white/90 backdrop-blur-sm">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72">
              <div className="flex items-center space-x-2 mb-6">
                <Fuel className="h-6 w-6" />
                <h2 className="text-lg font-semibold">Fuel Station System</h2>
              </div>
              <NavItems />
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Desktop Navigation - Show for all admin/analytics/maintenance/monitor routes */}
      {(location.startsWith("/admin") || location.startsWith("/analytics") || location.startsWith("/maintenance") || location.startsWith("/customer") || location.startsWith("/monitor")) && (
        <div className="hidden lg:block fixed top-4 left-4 z-50">
          <div className="bg-white/90 backdrop-blur-sm border rounded-lg p-4 w-64">
            <div className="flex items-center space-x-2 mb-4">
              <Fuel className="h-5 w-5" />
              <h2 className="font-semibold">Fuel Station</h2>
            </div>
            <NavItems />
          </div>
        </div>
      )}
    </>
  );
}