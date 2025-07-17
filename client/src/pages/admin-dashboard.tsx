import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, Fuel, BarChart3, Settings, Users, Clock, DollarSign, Activity } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";
import type { Transaction } from "@shared/schema";

interface DashboardStats {
  totalTransactions: number;
  todayRevenue: number;
  totalRevenue: number;
  avgTransactionValue: number;
  fuelDispensed: number;
  systemStatus: string;
}

interface PumpStatus {
  pumpId: string;
  status: string;
  currentTransaction?: string;
  lastMaintenance: string;
  fuelLevel: number;
}

export default function AdminDashboard() {
  const [selectedTimeRange, setSelectedTimeRange] = useState("today");
  const queryClient = useQueryClient();

  // Fetch dashboard statistics
  const { data: stats } = useQuery<DashboardStats>({
    queryKey: ["/api/admin/stats", selectedTimeRange],
  });

  // Fetch all transactions
  const { data: transactions = [] } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
  });

  // Fetch pump status
  const { data: pumpStatus } = useQuery<PumpStatus[]>({
    queryKey: ["/api/admin/pumps"],
  });

  // Emergency stop mutation
  const emergencyStopMutation = useMutation({
    mutationFn: () => apiRequest("/api/admin/emergency-stop", "POST"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pumps"] });
    },
  });

  // Reset pump mutation
  const resetPumpMutation = useMutation({
    mutationFn: (pumpId: string) => apiRequest(`/api/admin/pumps/${pumpId}/reset`, "POST"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pumps"] });
    },
  });

  // Update fuel price mutation
  const updatePriceMutation = useMutation({
    mutationFn: (data: { fuelType: string; price: number }) => 
      apiRequest("/api/admin/fuel-prices", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-500";
      case "idle": return "bg-blue-500";
      case "maintenance": return "bg-yellow-500";
      case "error": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const getTransactionStatusBadge = (status: string) => {
    const variants = {
      success: "default",
      pending: "secondary",
      failed: "destructive",
      timeout: "outline"
    } as const;
    
    return (
      <Badge variant={variants[status as keyof typeof variants] || "outline"}>
        {status}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-300">Fuel Station Management System</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="destructive"
              onClick={() => emergencyStopMutation.mutate()}
              disabled={emergencyStopMutation.isPending}
            >
              <AlertTriangle className="w-4 h-4 mr-2" />
              Emergency Stop
            </Button>
            <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">฿{stats?.totalRevenue?.toLocaleString() || 0}</div>
              <p className="text-xs text-muted-foreground">
                Today: ฿{stats?.todayRevenue?.toLocaleString() || 0}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Transactions</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalTransactions || 0}</div>
              <p className="text-xs text-muted-foreground">
                Avg: ฿{stats?.avgTransactionValue?.toFixed(2) || 0}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Fuel Dispensed</CardTitle>
              <Fuel className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.fuelDispensed?.toFixed(1) || 0}L</div>
              <p className="text-xs text-muted-foreground">
                All pumps combined
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Status</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.systemStatus || "Unknown"}</div>
              <p className="text-xs text-muted-foreground">
                All systems operational
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="pumps">Pump Control</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Transactions */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Transactions</CardTitle>
                  <CardDescription>Latest 10 transactions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {transactions.slice(0, 10).map((transaction) => (
                      <div key={transaction.id} className="flex justify-between items-center p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{transaction.transactionId}</p>
                          <p className="text-sm text-gray-600">฿{transaction.amount}</p>
                        </div>
                        <div className="text-right">
                          {getTransactionStatusBadge(transaction.status)}
                          <p className="text-xs text-gray-500 mt-1">
                            {format(new Date(transaction.createdAt), 'HH:mm:ss')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Pump Status */}
              <Card>
                <CardHeader>
                  <CardTitle>Pump Status</CardTitle>
                  <CardDescription>Real-time pump monitoring</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {pumpStatus?.map((pump) => (
                      <div key={pump.pumpId} className="flex justify-between items-center p-3 border rounded-lg">
                        <div>
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${getStatusColor(pump.status)}`} />
                            <span className="font-medium">Pump {pump.pumpId}</span>
                          </div>
                          <p className="text-sm text-gray-600">Fuel: {pump.fuelLevel}%</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm capitalize">{pump.status}</p>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => resetPumpMutation.mutate(pump.pumpId)}
                            disabled={resetPumpMutation.isPending}
                          >
                            Reset
                          </Button>
                        </div>
                      </div>
                    )) || (
                      <div className="flex justify-between items-center p-3 border rounded-lg">
                        <div>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-green-500" />
                            <span className="font-medium">Pump 03</span>
                          </div>
                          <p className="text-sm text-gray-600">Fuel: 85%</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm capitalize">Active</p>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => resetPumpMutation.mutate("03")}
                            disabled={resetPumpMutation.isPending}
                          >
                            Reset
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="transactions">
            <Card>
              <CardHeader>
                <CardTitle>Transaction History</CardTitle>
                <CardDescription>Complete transaction records</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Transaction ID</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Pump</TableHead>
                      <TableHead>Fuel Type</TableHead>
                      <TableHead>Volume</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell className="font-medium">{transaction.transactionId}</TableCell>
                        <TableCell>฿{transaction.amount}</TableCell>
                        <TableCell>{getTransactionStatusBadge(transaction.status)}</TableCell>
                        <TableCell>{transaction.pumpNumber}</TableCell>
                        <TableCell>{transaction.fuelType}</TableCell>
                        <TableCell>{transaction.estimatedVolume}L</TableCell>
                        <TableCell>{format(new Date(transaction.createdAt), 'dd/MM/yyyy HH:mm')}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pumps">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Pump Control</CardTitle>
                  <CardDescription>Hardware control and monitoring</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Button
                      variant="destructive"
                      onClick={() => emergencyStopMutation.mutate()}
                      disabled={emergencyStopMutation.isPending}
                    >
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      Emergency Stop
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => resetPumpMutation.mutate("03")}
                      disabled={resetPumpMutation.isPending}
                    >
                      Reset All Pumps
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="font-medium">Pump 03 Status</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <Label>Status</Label>
                        <p className="text-green-600 font-medium">Operational</p>
                      </div>
                      <div>
                        <Label>Fuel Level</Label>
                        <p>85%</p>
                      </div>
                      <div>
                        <Label>Last Maintenance</Label>
                        <p>2024-01-15</p>
                      </div>
                      <div>
                        <Label>Total Dispensed Today</Label>
                        <p>450L</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Maintenance Schedule</CardTitle>
                  <CardDescription>Upcoming maintenance tasks</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">Filter Replacement</p>
                        <p className="text-sm text-gray-600">Pump 03</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm">Due in 5 days</p>
                        <Badge variant="secondary">Scheduled</Badge>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">Calibration Check</p>
                        <p className="text-sm text-gray-600">All Pumps</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm">Due in 12 days</p>
                        <Badge variant="outline">Pending</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="settings">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Fuel Pricing</CardTitle>
                  <CardDescription>Update fuel prices</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="gasohol95">Gasohol 95 (฿/L)</Label>
                    <Input id="gasohol95" type="number" step="0.01" defaultValue="35.50" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gasohol91">Gasohol 91 (฿/L)</Label>
                    <Input id="gasohol91" type="number" step="0.01" defaultValue="33.50" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="diesel">Diesel (฿/L)</Label>
                    <Input id="diesel" type="number" step="0.01" defaultValue="31.50" />
                  </div>
                  <Button 
                    onClick={() => updatePriceMutation.mutate({ fuelType: "Gasohol 95", price: 35.50 })}
                    disabled={updatePriceMutation.isPending}
                  >
                    Update Prices
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>System Configuration</CardTitle>
                  <CardDescription>General system settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="timeout">Payment Timeout (seconds)</Label>
                    <Input id="timeout" type="number" defaultValue="300" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="minAmount">Minimum Amount (฿)</Label>
                    <Input id="minAmount" type="number" defaultValue="50" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxAmount">Maximum Amount (฿)</Label>
                    <Input id="maxAmount" type="number" defaultValue="5000" />
                  </div>
                  <Button>Save Configuration</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}