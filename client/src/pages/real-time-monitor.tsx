import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PumpStatusDisplay from "@/components/pump-status-display";
import { PumpVisualization } from "@/components/animated-fuel-flow";
import AnimatedFuelFlow from "@/components/animated-fuel-flow";
import { 
  Activity, Zap, AlertTriangle, TrendingUp, BarChart3, 
  Gauge, Thermometer, Droplets, Clock, Eye 
} from "lucide-react";

interface SystemOverview {
  totalPumps: number;
  activePumps: number;
  totalTransactionsToday: number;
  averageFlowRate: number;
  systemEfficiency: number;
  alertsCount: number;
}

export default function RealTimeMonitor() {
  const [selectedPump, setSelectedPump] = useState("03");
  const [viewMode, setViewMode] = useState<"grid" | "detail">("grid");

  // Mock system data
  const systemOverview: SystemOverview = {
    totalPumps: 3,
    activePumps: 2,
    totalTransactionsToday: 127,
    averageFlowRate: 45.2,
    systemEfficiency: 98.5,
    alertsCount: 0
  };

  const pumps = ["01", "02", "03"];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Real-Time Monitoring</h1>
            <p className="text-gray-600 dark:text-gray-300">ติดตามสถานะระบบแบบเรียลไทม์</p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant={viewMode === "grid" ? "default" : "outline"}
              onClick={() => setViewMode("grid")}
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Grid View
            </Button>
            <Button 
              variant={viewMode === "detail" ? "default" : "outline"}
              onClick={() => setViewMode("detail")}
            >
              <Eye className="w-4 h-4 mr-2" />
              Detail View
            </Button>
          </div>
        </div>

        {/* System Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Pumps</CardTitle>
              <Gauge className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{systemOverview.totalPumps}</div>
              <p className="text-xs text-muted-foreground">ปั๊มทั้งหมด</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active</CardTitle>
              <Activity className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{systemOverview.activePumps}</div>
              <p className="text-xs text-muted-foreground">ปั๊มที่ใช้งานได้</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Transactions</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{systemOverview.totalTransactionsToday}</div>
              <p className="text-xs text-muted-foreground">รายการวันนี้</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Flow Rate</CardTitle>
              <Droplets className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{systemOverview.averageFlowRate}</div>
              <p className="text-xs text-muted-foreground">L/min เฉลี่ย</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Efficiency</CardTitle>
              <Zap className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{systemOverview.systemEfficiency}%</div>
              <p className="text-xs text-muted-foreground">ประสิทธิภาพ</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Alerts</CardTitle>
              <AlertTriangle className={`h-4 w-4 ${systemOverview.alertsCount > 0 ? 'text-red-500' : 'text-gray-400'}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${systemOverview.alertsCount > 0 ? 'text-red-600' : 'text-gray-600'}`}>
                {systemOverview.alertsCount}
              </div>
              <p className="text-xs text-muted-foreground">การแจ้งเตือน</p>
            </CardContent>
          </Card>
        </div>

        {/* Real-time Flow Animations */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Live Flow Visualization</CardTitle>
            <CardDescription>การแสดงการไหลของน้ำมันแบบเรียลไทม์</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-center">
              <div className="text-center">
                <h4 className="font-medium mb-4">Gasohol 95</h4>
                <AnimatedFuelFlow
                  isActive={true}
                  flowRate={75}
                  fuelType="gasohol95"
                  direction="vertical"
                  size="lg"
                />
                <p className="text-sm text-gray-600 mt-2">45.2 L/min</p>
              </div>
              
              <div className="text-center">
                <h4 className="font-medium mb-4">Gasohol 91</h4>
                <AnimatedFuelFlow
                  isActive={true}
                  flowRate={60}
                  fuelType="gasohol91"
                  direction="vertical"
                  size="lg"
                />
                <p className="text-sm text-gray-600 mt-2">38.7 L/min</p>
              </div>

              <div className="text-center">
                <h4 className="font-medium mb-4">Diesel</h4>
                <AnimatedFuelFlow
                  isActive={false}
                  flowRate={0}
                  fuelType="diesel"
                  direction="vertical"
                  size="lg"
                />
                <p className="text-sm text-gray-600 mt-2">0 L/min</p>
              </div>

              <div className="text-center">
                <h4 className="font-medium mb-4">Premium 97</h4>
                <AnimatedFuelFlow
                  isActive={true}
                  flowRate={85}
                  fuelType="premium"
                  direction="vertical"
                  size="lg"
                />
                <p className="text-sm text-gray-600 mt-2">52.1 L/min</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">System Overview</TabsTrigger>
            <TabsTrigger value="pumps">Pump Status</TabsTrigger>
            <TabsTrigger value="flows">Live Flows</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {pumps.map((pumpId) => (
                  <PumpStatusDisplay
                    key={pumpId}
                    pumpId={pumpId}
                    showControls={true}
                    compact={false}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex gap-2 mb-4">
                  {pumps.map((pumpId) => (
                    <Button
                      key={pumpId}
                      variant={selectedPump === pumpId ? "default" : "outline"}
                      onClick={() => setSelectedPump(pumpId)}
                    >
                      Pump {pumpId}
                    </Button>
                  ))}
                </div>
                <PumpStatusDisplay
                  pumpId={selectedPump}
                  showControls={true}
                  compact={false}
                />
              </div>
            )}
          </TabsContent>

          <TabsContent value="pumps">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pumps.map((pumpId) => (
                <PumpStatusDisplay
                  key={pumpId}
                  pumpId={pumpId}
                  showControls={false}
                  compact={true}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="flows">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>Current Dispensing</CardTitle>
                  <CardDescription>Pump 03 - Active Transaction</CardDescription>
                </CardHeader>
                <CardContent>
                  <PumpVisualization
                    isDispensing={true}
                    flowRate={75}
                    fuelType="gasohol95"
                    targetAmount={500}
                    dispensedAmount={387.50}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>System Health</CardTitle>
                  <CardDescription>Real-time system metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Thermometer className="h-4 w-4 text-gray-600" />
                        <span className="text-sm">System Temperature</span>
                      </div>
                      <span className="font-medium">28°C</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Gauge className="h-4 w-4 text-gray-600" />
                        <span className="text-sm">Pressure</span>
                      </div>
                      <span className="font-medium">2.1 bar</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-600" />
                        <span className="text-sm">Uptime</span>
                      </div>
                      <span className="font-medium">99.2%</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Activity className="h-4 w-4 text-gray-600" />
                        <span className="text-sm">Network Status</span>
                      </div>
                      <Badge variant="default">Connected</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}