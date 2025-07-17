import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from "recharts";
import { TrendingUp, TrendingDown, DollarSign, Fuel, Clock, Activity, Calendar, Download } from "lucide-react";
import { format, subDays, startOfDay, endOfDay } from "date-fns";

interface AnalyticsData {
  revenue: { date: string; amount: number; transactions: number }[];
  fuelTypes: { name: string; value: number; revenue: number }[];
  hourlyDistribution: { hour: number; transactions: number; revenue: number }[];
  pumpPerformance: { pump: string; transactions: number; revenue: number; uptime: number }[];
  trends: {
    revenueChange: number;
    transactionChange: number;
    avgTicketChange: number;
    peakHours: string[];
  };
}

export default function AnalyticsDashboard() {
  const [dateRange, setDateRange] = useState("7days");
  const [viewMode, setViewMode] = useState("revenue");

  // Mock analytics data - in real app would come from API
  const { data: analytics } = useQuery<AnalyticsData>({
    queryKey: ["/api/analytics", dateRange],
    queryFn: () => Promise.resolve({
      revenue: Array.from({ length: 7 }, (_, i) => {
        const date = subDays(new Date(), 6 - i);
        return {
          date: format(date, 'dd/MM'),
          amount: Math.floor(Math.random() * 20000) + 15000,
          transactions: Math.floor(Math.random() * 50) + 30
        };
      }),
      fuelTypes: [
        { name: "Gasohol 95", value: 45, revenue: 156420 },
        { name: "Gasohol 91", value: 30, revenue: 98750 },
        { name: "Diesel", value: 20, revenue: 67890 },
        { name: "Premium 97", value: 5, revenue: 23456 }
      ],
      hourlyDistribution: Array.from({ length: 24 }, (_, hour) => ({
        hour,
        transactions: Math.floor(Math.random() * 20) + (hour >= 6 && hour <= 20 ? 15 : 5),
        revenue: Math.floor(Math.random() * 5000) + (hour >= 6 && hour <= 20 ? 3000 : 1000)
      })),
      pumpPerformance: [
        { pump: "Pump 01", transactions: 245, revenue: 87650, uptime: 98.5 },
        { pump: "Pump 02", transactions: 198, revenue: 69420, uptime: 95.2 },
        { pump: "Pump 03", transactions: 267, revenue: 94320, uptime: 99.1 }
      ],
      trends: {
        revenueChange: 12.5,
        transactionChange: 8.3,
        avgTicketChange: 3.8,
        peakHours: ["08:00-09:00", "17:00-19:00"]
      }
    })
  });

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  const getTrendIcon = (change: number) => {
    return change >= 0 ? 
      <TrendingUp className="h-4 w-4 text-green-500" /> : 
      <TrendingDown className="h-4 w-4 text-red-500" />;
  };

  const getTrendColor = (change: number) => {
    return change >= 0 ? "text-green-500" : "text-red-500";
  };

  const exportData = () => {
    // Mock export functionality
    console.log("Exporting analytics data...");
  };

  if (!analytics) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-300">Detailed business intelligence and insights</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={exportData}>
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="7days">7 Days</SelectItem>
                <SelectItem value="30days">30 Days</SelectItem>
                <SelectItem value="90days">90 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ฿{analytics.revenue.reduce((sum, day) => sum + day.amount, 0).toLocaleString()}
              </div>
              <div className="flex items-center text-xs">
                {getTrendIcon(analytics.trends.revenueChange)}
                <span className={`ml-1 ${getTrendColor(analytics.trends.revenueChange)}`}>
                  {analytics.trends.revenueChange > 0 ? '+' : ''}{analytics.trends.revenueChange}%
                </span>
                <span className="text-muted-foreground ml-1">vs last period</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {analytics.revenue.reduce((sum, day) => sum + day.transactions, 0).toLocaleString()}
              </div>
              <div className="flex items-center text-xs">
                {getTrendIcon(analytics.trends.transactionChange)}
                <span className={`ml-1 ${getTrendColor(analytics.trends.transactionChange)}`}>
                  {analytics.trends.transactionChange > 0 ? '+' : ''}{analytics.trends.transactionChange}%
                </span>
                <span className="text-muted-foreground ml-1">vs last period</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Transaction</CardTitle>
              <Fuel className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ฿{Math.round(analytics.revenue.reduce((sum, day) => sum + day.amount, 0) / 
                  analytics.revenue.reduce((sum, day) => sum + day.transactions, 0)).toLocaleString()}
              </div>
              <div className="flex items-center text-xs">
                {getTrendIcon(analytics.trends.avgTicketChange)}
                <span className={`ml-1 ${getTrendColor(analytics.trends.avgTicketChange)}`}>
                  {analytics.trends.avgTicketChange > 0 ? '+' : ''}{analytics.trends.avgTicketChange}%
                </span>
                <span className="text-muted-foreground ml-1">vs last period</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Peak Hours</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-sm font-bold space-y-1">
                {analytics.trends.peakHours.map((hour, i) => (
                  <div key={i}>{hour}</div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">Highest activity periods</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <Tabs defaultValue="revenue" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="revenue">Revenue Trends</TabsTrigger>
            <TabsTrigger value="fuel">Fuel Analysis</TabsTrigger>
            <TabsTrigger value="hourly">Hourly Distribution</TabsTrigger>
            <TabsTrigger value="pumps">Pump Performance</TabsTrigger>
          </TabsList>

          <TabsContent value="revenue">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Daily Revenue</CardTitle>
                  <CardDescription>Revenue and transaction trends over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={analytics.revenue}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value, name) => [
                          name === 'amount' ? `฿${value.toLocaleString()}` : value,
                          name === 'amount' ? 'Revenue' : 'Transactions'
                        ]}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="amount" 
                        stroke="#3b82f6" 
                        fill="#3b82f6" 
                        fillOpacity={0.1}
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Transaction Volume</CardTitle>
                  <CardDescription>Number of transactions per day</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={analytics.revenue}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="transactions" fill="#10b981" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="fuel">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Fuel Type Distribution</CardTitle>
                  <CardDescription>Sales volume by fuel type</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={analytics.fuelTypes}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {analytics.fuelTypes.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Revenue by Fuel Type</CardTitle>
                  <CardDescription>Revenue breakdown by fuel category</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={analytics.fuelTypes}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`฿${value.toLocaleString()}`, 'Revenue']} />
                      <Bar dataKey="revenue" fill="#f59e0b" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="hourly">
            <Card>
              <CardHeader>
                <CardTitle>Hourly Activity Distribution</CardTitle>
                <CardDescription>Transaction patterns throughout the day</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={analytics.hourlyDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="hour" 
                      tickFormatter={(hour) => `${hour}:00`}
                    />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip 
                      labelFormatter={(hour) => `Time: ${hour}:00`}
                      formatter={(value, name) => [
                        name === 'revenue' ? `฿${value.toLocaleString()}` : value,
                        name === 'revenue' ? 'Revenue' : 'Transactions'
                      ]}
                    />
                    <Line 
                      yAxisId="left"
                      type="monotone" 
                      dataKey="transactions" 
                      stroke="#10b981" 
                      strokeWidth={2}
                      name="transactions"
                    />
                    <Line 
                      yAxisId="right"
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      name="revenue"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pumps">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Pump Performance</CardTitle>
                  <CardDescription>Revenue and transaction comparison by pump</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={analytics.pumpPerformance}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="pump" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`฿${value.toLocaleString()}`, 'Revenue']} />
                      <Bar dataKey="revenue" fill="#8b5cf6" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Pump Uptime</CardTitle>
                  <CardDescription>Operational efficiency by pump</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analytics.pumpPerformance.map((pump) => (
                      <div key={pump.pump} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">{pump.pump}</span>
                          <span className="text-gray-600">{pump.uptime}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full"
                            style={{ width: `${pump.uptime}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>{pump.transactions} transactions</span>
                          <span>฿{pump.revenue.toLocaleString()} revenue</span>
                        </div>
                      </div>
                    ))}
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