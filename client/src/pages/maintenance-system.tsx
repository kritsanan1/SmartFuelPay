import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Car, 
  Calendar, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Settings, 
  Plus,
  Wrench,
  AlertCircle,
  Bell,
  Search,
  Filter,
  TrendingUp,
  BarChart3
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { Vehicle, MaintenanceRecord, MaintenanceReminder, MaintenanceType } from "@shared/schema";

// Form schemas
const vehicleFormSchema = z.object({
  licensePlate: z.string().min(1, "License plate is required"),
  make: z.string().min(1, "Make is required"),
  model: z.string().min(1, "Model is required"),
  year: z.number().min(1900).max(new Date().getFullYear() + 1),
  vin: z.string().optional(),
  color: z.string().optional(),
  fuelType: z.string().default("Gasoline"),
  mileage: z.number().min(0).default(0),
  ownerName: z.string().min(1, "Owner name is required"),
  ownerPhone: z.string().optional(),
  ownerEmail: z.string().email().optional().or(z.literal("")),
  registrationExpiry: z.string().optional(),
  insuranceExpiry: z.string().optional(),
});

const maintenanceRecordFormSchema = z.object({
  vehicleId: z.number(),
  maintenanceTypeId: z.number(),
  scheduledDate: z.string(),
  mileageAtService: z.number().optional(),
  cost: z.string().optional(),
  serviceProvider: z.string().optional(),
  notes: z.string().optional(),
});

function MaintenanceSystem() {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const [showAddMaintenance, setShowAddMaintenance] = useState(false);
  const queryClient = useQueryClient();

  // Fetch data
  const { data: vehicles = [], isLoading: vehiclesLoading } = useQuery({
    queryKey: ["/api/vehicles"],
  });

  const { data: maintenanceTypes = [] } = useQuery({
    queryKey: ["/api/maintenance-types"],
  });

  const { data: upcomingMaintenance = [] } = useQuery({
    queryKey: ["/api/maintenance-records/upcoming"],
  });

  const { data: overdueMaintenance = [] } = useQuery({
    queryKey: ["/api/maintenance-records/overdue"],
  });

  const { data: reminders = [] } = useQuery({
    queryKey: ["/api/maintenance-reminders"],
  });

  // Mutations
  const addVehicleMutation = useMutation({
    mutationFn: (data: any) => apiRequest("/api/vehicles", { method: "POST", body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vehicles"] });
      setShowAddVehicle(false);
    },
  });

  const addMaintenanceMutation = useMutation({
    mutationFn: (data: any) => apiRequest("/api/maintenance-records", { method: "POST", body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/maintenance-records/upcoming"] });
      queryClient.invalidateQueries({ queryKey: ["/api/maintenance-records/overdue"] });
      setShowAddMaintenance(false);
    },
  });

  const dismissReminderMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/maintenance-reminders/${id}/dismiss`, { method: "PATCH" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/maintenance-reminders"] });
    },
  });

  // Forms
  const vehicleForm = useForm({
    resolver: zodResolver(vehicleFormSchema),
    defaultValues: {
      licensePlate: "",
      make: "",
      model: "",
      year: new Date().getFullYear(),
      fuelType: "Gasoline",
      mileage: 0,
      ownerName: "",
      ownerPhone: "",
      ownerEmail: "",
    },
  });

  const maintenanceForm = useForm({
    resolver: zodResolver(maintenanceRecordFormSchema),
    defaultValues: {
      vehicleId: 0,
      maintenanceTypeId: 0,
      scheduledDate: "",
    },
  });

  const handleAddVehicle = (data: any) => {
    const cleanedData = {
      ...data,
      year: parseInt(data.year) || new Date().getFullYear(),
      mileage: parseInt(data.mileage) || 0,
    };
    addVehicleMutation.mutate(cleanedData);
  };

  const handleAddMaintenance = (data: any) => {
    const cleanedData = {
      ...data,
      vehicleId: parseInt(data.vehicleId),
      maintenanceTypeId: parseInt(data.maintenanceTypeId),
    };
    addMaintenanceMutation.mutate(cleanedData);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "destructive";
      case "high": return "destructive";
      case "medium": return "default";
      case "low": return "secondary";
      default: return "default";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "default";
      case "scheduled": return "secondary";
      case "overdue": return "destructive";
      default: return "outline";
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Vehicle Maintenance System</h1>
          <p className="text-muted-foreground">Track and manage vehicle maintenance schedules</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={showAddVehicle} onOpenChange={setShowAddVehicle}>
            <DialogTrigger asChild>
              <Button className="interactive-btn hover-lift">
                <Plus className="mr-2 h-4 w-4" />
                Add Vehicle
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Vehicle</DialogTitle>
                <DialogDescription>Enter vehicle details to start tracking maintenance</DialogDescription>
              </DialogHeader>
              <Form {...vehicleForm}>
                <form onSubmit={vehicleForm.handleSubmit(handleAddVehicle)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={vehicleForm.control}
                      name="licensePlate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>License Plate</FormLabel>
                          <FormControl>
                            <Input placeholder="ABC 1234" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={vehicleForm.control}
                      name="make"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Make</FormLabel>
                          <FormControl>
                            <Input placeholder="Toyota" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={vehicleForm.control}
                      name="model"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Model</FormLabel>
                          <FormControl>
                            <Input placeholder="Camry" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={vehicleForm.control}
                      name="year"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Year</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="2023" 
                              value={field.value || ""}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || new Date().getFullYear())}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={vehicleForm.control}
                      name="ownerName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Owner Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={vehicleForm.control}
                      name="ownerPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="+66 123 456 789" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setShowAddVehicle(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={addVehicleMutation.isPending}>
                      {addVehicleMutation.isPending ? "Adding..." : "Add Vehicle"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
          <Button variant="outline" className="hover-lift">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="premium-card hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Vehicles</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vehicles.length}</div>
            <p className="text-xs text-muted-foreground">
              Active fleet vehicles
            </p>
          </CardContent>
        </Card>

        <Card className="premium-card hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Maintenance</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{upcomingMaintenance.length}</div>
            <p className="text-xs text-muted-foreground">
              Next 30 days
            </p>
          </CardContent>
        </Card>

        <Card className="premium-card hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Items</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{overdueMaintenance.length}</div>
            <p className="text-xs text-muted-foreground">
              Require immediate attention
            </p>
          </CardContent>
        </Card>

        <Card className="premium-card hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Reminders</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{reminders.length}</div>
            <p className="text-xs text-muted-foreground">
              Notification pending
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="vehicles">Vehicles</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          <TabsTrigger value="reminders">Reminders</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Critical Alerts */}
          {(overdueMaintenance.length > 0 || reminders.filter(r => r.priority === "urgent").length > 0) && (
            <Card className="border-destructive bg-destructive/5">
              <CardHeader>
                <CardTitle className="flex items-center text-destructive">
                  <AlertCircle className="mr-2 h-5 w-5" />
                  Critical Maintenance Alerts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {overdueMaintenance.slice(0, 3).map((item: any) => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-white rounded-lg">
                    <div>
                      <p className="font-medium">Overdue maintenance</p>
                      <p className="text-sm text-muted-foreground">Vehicle ID: {item.vehicleId}</p>
                    </div>
                    <Badge variant="destructive">Overdue</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="premium-card hover-lift cursor-pointer" onClick={() => setActiveTab("vehicles")}>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Car className="mr-2 h-5 w-5" />
                  Manage Vehicles
                </CardTitle>
                <CardDescription>Add, edit, and track vehicle information</CardDescription>
              </CardHeader>
            </Card>

            <Card className="premium-card hover-lift cursor-pointer" onClick={() => setShowAddMaintenance(true)}>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Wrench className="mr-2 h-5 w-5" />
                  Schedule Maintenance
                </CardTitle>
                <CardDescription>Plan upcoming service appointments</CardDescription>
              </CardHeader>
            </Card>

            <Card className="premium-card hover-lift cursor-pointer" onClick={() => setActiveTab("reminders")}>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="mr-2 h-5 w-5" />
                  View Reminders
                </CardTitle>
                <CardDescription>Check maintenance notifications</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="vehicles" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Vehicle Fleet</h2>
            <Button onClick={() => setShowAddVehicle(true)} className="interactive-btn">
              <Plus className="mr-2 h-4 w-4" />
              Add Vehicle
            </Button>
          </div>

          {vehiclesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="loading-shimmer h-48" />
              ))}
            </div>
          ) : vehicles.length === 0 ? (
            <Card className="premium-card text-center py-12">
              <CardContent>
                <Car className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No vehicles registered</h3>
                <p className="text-muted-foreground mb-4">Start by adding your first vehicle to track maintenance</p>
                <Button onClick={() => setShowAddVehicle(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Vehicle
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vehicles.map((vehicle: Vehicle) => (
                <Card key={vehicle.id} className="premium-card hover-lift cursor-pointer">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{vehicle.licensePlate}</span>
                      <Badge variant="outline">{vehicle.fuelType}</Badge>
                    </CardTitle>
                    <CardDescription>
                      {vehicle.year} {vehicle.make} {vehicle.model}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Owner:</span>
                        <span className="text-sm font-medium">{vehicle.ownerName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Mileage:</span>
                        <span className="text-sm font-medium">{vehicle.mileage.toLocaleString()} km</span>
                      </div>
                      {vehicle.ownerPhone && (
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Phone:</span>
                          <span className="text-sm font-medium">{vehicle.ownerPhone}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Maintenance Schedule</h2>
            <Dialog open={showAddMaintenance} onOpenChange={setShowAddMaintenance}>
              <DialogTrigger asChild>
                <Button className="interactive-btn">
                  <Plus className="mr-2 h-4 w-4" />
                  Schedule Maintenance
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Schedule Maintenance</DialogTitle>
                  <DialogDescription>Plan a maintenance appointment</DialogDescription>
                </DialogHeader>
                <Form {...maintenanceForm}>
                  <form onSubmit={maintenanceForm.handleSubmit(handleAddMaintenance)} className="space-y-4">
                    <FormField
                      control={maintenanceForm.control}
                      name="vehicleId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Vehicle</FormLabel>
                          <Select onValueChange={(value) => field.onChange(parseInt(value))}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a vehicle" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {vehicles.map((vehicle: Vehicle) => (
                                <SelectItem key={vehicle.id} value={vehicle.id.toString()}>
                                  {vehicle.licensePlate} - {vehicle.make} {vehicle.model}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={maintenanceForm.control}
                      name="maintenanceTypeId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Maintenance Type</FormLabel>
                          <Select onValueChange={(value) => field.onChange(parseInt(value))}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select maintenance type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {maintenanceTypes.map((type: MaintenanceType) => (
                                <SelectItem key={type.id} value={type.id.toString()}>
                                  {type.name} - {type.category}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={maintenanceForm.control}
                      name="scheduledDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Scheduled Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => setShowAddMaintenance(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={addMaintenanceMutation.isPending}>
                        {addMaintenanceMutation.isPending ? "Scheduling..." : "Schedule"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Upcoming Maintenance */}
            <Card className="premium-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="mr-2 h-5 w-5 text-yellow-600" />
                  Upcoming Maintenance
                </CardTitle>
              </CardHeader>
              <CardContent>
                {upcomingMaintenance.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No upcoming maintenance scheduled</p>
                ) : (
                  <div className="space-y-3">
                    {upcomingMaintenance.slice(0, 5).map((item: any) => (
                      <div key={item.id} className="flex items-center justify-between p-3 bg-background rounded-lg">
                        <div>
                          <p className="font-medium">Vehicle ID: {item.vehicleId}</p>
                          <p className="text-sm text-muted-foreground">
                            Scheduled: {new Date(item.scheduledDate).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant="secondary">Scheduled</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Overdue Maintenance */}
            <Card className="premium-card border-destructive">
              <CardHeader>
                <CardTitle className="flex items-center text-destructive">
                  <AlertTriangle className="mr-2 h-5 w-5" />
                  Overdue Maintenance
                </CardTitle>
              </CardHeader>
              <CardContent>
                {overdueMaintenance.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No overdue maintenance</p>
                ) : (
                  <div className="space-y-3">
                    {overdueMaintenance.slice(0, 5).map((item: any) => (
                      <div key={item.id} className="flex items-center justify-between p-3 bg-background rounded-lg">
                        <div>
                          <p className="font-medium">Vehicle ID: {item.vehicleId}</p>
                          <p className="text-sm text-muted-foreground">
                            Due: {new Date(item.scheduledDate).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant="destructive">Overdue</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reminders" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Maintenance Reminders</h2>
          </div>

          {reminders.length === 0 ? (
            <Card className="premium-card text-center py-12">
              <CardContent>
                <Bell className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No active reminders</h3>
                <p className="text-muted-foreground">All maintenance notifications have been addressed</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {reminders.map((reminder: MaintenanceReminder) => (
                <Card key={reminder.id} className={`premium-card ${reminder.priority === "urgent" ? "border-destructive" : ""}`}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`p-2 rounded-full ${
                          reminder.priority === "urgent" ? "bg-destructive/10 text-destructive" :
                          reminder.priority === "high" ? "bg-orange-100 text-orange-600" :
                          "bg-blue-100 text-blue-600"
                        }`}>
                          <Bell className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-medium">{reminder.message}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(reminder.reminderDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={getPriorityColor(reminder.priority)}>
                          {reminder.priority}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => dismissReminderMutation.mutate(reminder.id)}
                          disabled={dismissReminderMutation.isPending}
                        >
                          Dismiss
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default MaintenanceSystem;