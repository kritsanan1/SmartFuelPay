import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  Wrench, AlertTriangle, CheckCircle, Clock, Calendar as CalendarIcon, 
  Plus, FileText, Settings, Activity, Gauge, Droplets 
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { format, addDays, isAfter, isBefore } from "date-fns";

interface MaintenanceTask {
  id: string;
  title: string;
  description: string;
  pumpId: string;
  type: "routine" | "emergency" | "inspection" | "repair";
  priority: "low" | "medium" | "high" | "critical";
  status: "scheduled" | "in_progress" | "completed" | "overdue";
  scheduledDate: string;
  completedDate?: string;
  estimatedDuration: number; // minutes
  assignedTo: string;
  parts?: string[];
  cost?: number;
}

interface MaintenanceRecord {
  id: string;
  taskId: string;
  completedBy: string;
  completedDate: string;
  notes: string;
  partsUsed: { name: string; quantity: number; cost: number }[];
  totalCost: number;
  nextMaintenanceDate?: string;
}

export default function MaintenanceSystem() {
  const [selectedTask, setSelectedTask] = useState<MaintenanceTask | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [filterStatus, setFilterStatus] = useState("all");
  const [newTaskOpen, setNewTaskOpen] = useState(false);
  const queryClient = useQueryClient();

  // Mock maintenance data
  const mockTasks: MaintenanceTask[] = [
    {
      id: "MT001",
      title: "Monthly Filter Replacement",
      description: "Replace fuel filter and air filter for optimal performance",
      pumpId: "03",
      type: "routine",
      priority: "medium",
      status: "scheduled",
      scheduledDate: "2025-07-20",
      estimatedDuration: 60,
      assignedTo: "นาย สมชาย ใจดี",
      parts: ["Fuel Filter", "Air Filter"],
      cost: 850
    },
    {
      id: "MT002",
      title: "Emergency Pump Calibration",
      description: "Urgent calibration needed due to measurement discrepancy",
      pumpId: "03",
      type: "emergency",
      priority: "critical",
      status: "in_progress",
      scheduledDate: "2025-07-17",
      estimatedDuration: 120,
      assignedTo: "นาย วิชัย เทคนิค",
      cost: 1200
    },
    {
      id: "MT003",
      title: "Quarterly Safety Inspection",
      description: "Complete safety systems check and certification",
      pumpId: "03",
      type: "inspection",
      priority: "high",
      status: "overdue",
      scheduledDate: "2025-07-15",
      estimatedDuration: 180,
      assignedTo: "นาง สุดา ตรวจสอบ",
      cost: 2500
    }
  ];

  const { data: tasks = mockTasks } = useQuery<MaintenanceTask[]>({
    queryKey: ["/api/maintenance/tasks"],
  });

  const { data: records = [] } = useQuery<MaintenanceRecord[]>({
    queryKey: ["/api/maintenance/records"],
  });

  const createTaskMutation = useMutation({
    mutationFn: (task: Omit<MaintenanceTask, 'id'>) => 
      apiRequest("/api/maintenance/tasks", "POST", task),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/maintenance/tasks"] });
      setNewTaskOpen(false);
    },
  });

  const completeTaskMutation = useMutation({
    mutationFn: ({ taskId, notes, parts }: { taskId: string; notes: string; parts: any[] }) =>
      apiRequest(`/api/maintenance/tasks/${taskId}/complete`, "POST", { notes, parts }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/maintenance/tasks"] });
    },
  });

  const getStatusColor = (status: MaintenanceTask['status']) => {
    switch (status) {
      case "scheduled": return "bg-blue-500";
      case "in_progress": return "bg-yellow-500";
      case "completed": return "bg-green-500";
      case "overdue": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const getPriorityColor = (priority: MaintenanceTask['priority']) => {
    switch (priority) {
      case "low": return "secondary";
      case "medium": return "outline";
      case "high": return "default";
      case "critical": return "destructive";
      default: return "secondary";
    }
  };

  const getTaskTypeIcon = (type: MaintenanceTask['type']) => {
    switch (type) {
      case "routine": return <Clock className="h-4 w-4" />;
      case "emergency": return <AlertTriangle className="h-4 w-4" />;
      case "inspection": return <Gauge className="h-4 w-4" />;
      case "repair": return <Wrench className="h-4 w-4" />;
      default: return <Settings className="h-4 w-4" />;
    }
  };

  const filteredTasks = tasks.filter(task => 
    filterStatus === "all" || task.status === filterStatus
  );

  const getStatusBadge = (status: MaintenanceTask['status']) => (
    <Badge variant={status === "completed" ? "default" : status === "overdue" ? "destructive" : "secondary"}>
      {status === "scheduled" ? "กำหนดการ" :
       status === "in_progress" ? "กำลังดำเนินการ" :
       status === "completed" ? "เสร็จสิ้น" : "เลยกำหนด"}
    </Badge>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Maintenance Management</h1>
            <p className="text-gray-600 dark:text-gray-300">ระบบจัดการการบำรุงรักษาและซ่อมบำรุง</p>
          </div>
          <div className="flex gap-2">
            <Dialog open={newTaskOpen} onOpenChange={setNewTaskOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  เพิ่มงานใหม่
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>สร้างงานบำรุงรักษาใหม่</DialogTitle>
                  <DialogDescription>กรอกรายละเอียดงานบำรุงรักษา</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">หัวข้องาน</Label>
                    <Input id="title" placeholder="เช่น เปลี่ยนฟิลเตอร์รายเดือน" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">รายละเอียด</Label>
                    <Textarea id="description" placeholder="อธิบายรายละเอียดงาน..." />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="type">ประเภทงาน</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="เลือกประเภท" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="routine">งานประจำ</SelectItem>
                          <SelectItem value="emergency">งานเร่งด่วน</SelectItem>
                          <SelectItem value="inspection">ตรวจสอบ</SelectItem>
                          <SelectItem value="repair">ซ่อมแซม</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="priority">ความสำคัญ</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="เลือกระดับ" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">ต่ำ</SelectItem>
                          <SelectItem value="medium">ปานกลาง</SelectItem>
                          <SelectItem value="high">สูง</SelectItem>
                          <SelectItem value="critical">วิกฤต</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="assignedTo">ผู้รับผิดชอบ</Label>
                      <Input id="assignedTo" placeholder="ชื่อช่าง/ผู้รับผิดชอบ" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="duration">เวลาที่ใช้ (นาที)</Label>
                      <Input id="duration" type="number" placeholder="60" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>วันที่กำหนด</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {selectedDate ? format(selectedDate, "dd/MM/yyyy") : "เลือกวันที่"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={setSelectedDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="flex gap-4">
                    <Button className="flex-1">สร้างงาน</Button>
                    <Button variant="outline" className="flex-1" onClick={() => setNewTaskOpen(false)}>
                      ยกเลิก
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทั้งหมด</SelectItem>
                <SelectItem value="scheduled">กำหนดการ</SelectItem>
                <SelectItem value="in_progress">กำลังดำเนินการ</SelectItem>
                <SelectItem value="completed">เสร็จสิ้น</SelectItem>
                <SelectItem value="overdue">เลยกำหนด</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">งานที่รอดำเนินการ</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {tasks.filter(t => t.status === "scheduled").length}
              </div>
              <p className="text-xs text-muted-foreground">งานที่กำหนดไว้</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">กำลังดำเนินการ</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {tasks.filter(t => t.status === "in_progress").length}
              </div>
              <p className="text-xs text-muted-foreground">งานที่อยู่ระหว่างทำ</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">เลยกำหนด</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {tasks.filter(t => t.status === "overdue").length}
              </div>
              <p className="text-xs text-muted-foreground">ต้องดำเนินการเร่งด่วน</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">เสร็จสิ้นเดือนนี้</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {tasks.filter(t => t.status === "completed").length}
              </div>
              <p className="text-xs text-muted-foreground">งานที่ทำเสร็จแล้ว</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="tasks" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="tasks">รายการงาน</TabsTrigger>
            <TabsTrigger value="calendar">ปฏิทินงาน</TabsTrigger>
            <TabsTrigger value="records">ประวัติการบำรุงรักษา</TabsTrigger>
          </TabsList>

          <TabsContent value="tasks">
            <Card>
              <CardHeader>
                <CardTitle>รายการงานบำรุงรักษา</CardTitle>
                <CardDescription>จัดการและติดตามงานบำรุงรักษาทั้งหมด</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>งาน</TableHead>
                      <TableHead>ปั๊ม</TableHead>
                      <TableHead>ประเภท</TableHead>
                      <TableHead>ความสำคัญ</TableHead>
                      <TableHead>วันที่กำหนด</TableHead>
                      <TableHead>ผู้รับผิดชอบ</TableHead>
                      <TableHead>สถานะ</TableHead>
                      <TableHead>การดำเนินการ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTasks.map((task) => (
                      <TableRow key={task.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{task.title}</div>
                            <div className="text-sm text-gray-600">{task.description}</div>
                          </div>
                        </TableCell>
                        <TableCell>{task.pumpId}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getTaskTypeIcon(task.type)}
                            <span className="capitalize">
                              {task.type === "routine" ? "งานประจำ" :
                               task.type === "emergency" ? "เร่งด่วน" :
                               task.type === "inspection" ? "ตรวจสอบ" : "ซ่อมแซม"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getPriorityColor(task.priority)}>
                            {task.priority === "low" ? "ต่ำ" :
                             task.priority === "medium" ? "ปานกลาง" :
                             task.priority === "high" ? "สูง" : "วิกฤต"}
                          </Badge>
                        </TableCell>
                        <TableCell>{format(new Date(task.scheduledDate), 'dd/MM/yyyy')}</TableCell>
                        <TableCell>{task.assignedTo}</TableCell>
                        <TableCell>{getStatusBadge(task.status)}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {task.status === "scheduled" && (
                              <Button size="sm" variant="outline">
                                เริ่มงาน
                              </Button>
                            )}
                            {task.status === "in_progress" && (
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button size="sm">ทำเสร็จ</Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>บันทึกการทำงานเสร็จสิ้น</DialogTitle>
                                    <DialogDescription>กรอกรายละเอียดการทำงาน</DialogDescription>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div className="space-y-2">
                                      <Label htmlFor="notes">หมายเหตุ</Label>
                                      <Textarea 
                                        id="notes" 
                                        placeholder="บันทึกรายละเอียดการทำงาน ปัญหาที่พบ และการแก้ไข..."
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <Label>อะไหล่ที่ใช้</Label>
                                      <div className="text-sm text-gray-600">
                                        {task.parts?.join(", ") || "ไม่มีอะไหล่"}
                                      </div>
                                    </div>
                                    <div className="flex gap-4">
                                      <Button className="flex-1">บันทึกเสร็จสิ้น</Button>
                                      <DialogTrigger asChild>
                                        <Button variant="outline" className="flex-1">ยกเลิก</Button>
                                      </DialogTrigger>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            )}
                            <Button size="sm" variant="ghost">
                              <FileText className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="calendar">
            <Card>
              <CardHeader>
                <CardTitle>ปฏิทินงานบำรุงรักษา</CardTitle>
                <CardDescription>ดูงานที่กำหนดในแต่ละวัน</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      className="rounded-md border"
                    />
                  </div>
                  <div className="space-y-4">
                    <h3 className="font-semibold">งานในวันที่เลือก</h3>
                    {selectedDate && (
                      <div className="space-y-3">
                        {tasks
                          .filter(task => 
                            format(new Date(task.scheduledDate), 'yyyy-MM-dd') === 
                            format(selectedDate, 'yyyy-MM-dd')
                          )
                          .map(task => (
                            <Card key={task.id}>
                              <CardContent className="p-4">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h4 className="font-medium">{task.title}</h4>
                                    <p className="text-sm text-gray-600">{task.assignedTo}</p>
                                    <p className="text-xs text-gray-500">{task.estimatedDuration} นาที</p>
                                  </div>
                                  {getStatusBadge(task.status)}
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        {tasks.filter(task => 
                          format(new Date(task.scheduledDate), 'yyyy-MM-dd') === 
                          format(selectedDate, 'yyyy-MM-dd')
                        ).length === 0 && (
                          <p className="text-gray-500 text-center py-8">ไม่มีงานในวันนี้</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="records">
            <Card>
              <CardHeader>
                <CardTitle>ประวัติการบำรุงรักษา</CardTitle>
                <CardDescription>บันทึกงานที่ทำเสร็จสิ้นแล้ว</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>ยังไม่มีประวัติการบำรุงรักษา</p>
                  <p className="text-sm">เมื่อทำงานเสร็จแล้ว ประวัติจะแสดงที่นี่</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}