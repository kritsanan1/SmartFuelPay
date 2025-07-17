import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { 
  Fuel, AlertTriangle, CheckCircle, Zap, Droplets, 
  Gauge, Thermometer, Activity, Power, StopCircle 
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PumpStatus {
  id: string;
  status: "idle" | "dispensing" | "maintenance" | "error" | "emergency_stop";
  currentTransaction?: {
    id: string;
    targetAmount: number;
    dispensedAmount: number;
    dispensedVolume: number;
    startTime: string;
    fuelType: string;
  };
  fuelLevel: number;
  temperature: number;
  pressure: number;
  lastMaintenance: string;
  uptime: number;
  totalDispensed: number;
  errorMessage?: string;
}

interface PumpStatusDisplayProps {
  pumpId: string;
  showControls?: boolean;
  compact?: boolean;
}

export default function PumpStatusDisplay({ 
  pumpId, 
  showControls = false, 
  compact = false 
}: PumpStatusDisplayProps) {
  const [animationState, setAnimationState] = useState<"idle" | "flowing" | "pulsing">("idle");
  const [flowRate, setFlowRate] = useState(0);

  const { data: pumpStatus } = useQuery<PumpStatus>({
    queryKey: [`/api/hardware/pump/${pumpId}/status`],
    refetchInterval: 1000, // Update every second for real-time status
  });

  // Mock data for demonstration
  const mockStatus: PumpStatus = {
    id: pumpId,
    status: pumpStatus?.status || "idle",
    currentTransaction: pumpStatus?.currentTransaction || undefined,
    fuelLevel: 85,
    temperature: 28,
    pressure: 2.1,
    lastMaintenance: "2024-01-15",
    uptime: 99.2,
    totalDispensed: 1245.6,
  };

  const status = pumpStatus || mockStatus;

  useEffect(() => {
    if (status.status === "dispensing") {
      setAnimationState("flowing");
      // Simulate flow rate based on dispensed amount
      if (status.currentTransaction) {
        const progress = status.currentTransaction.dispensedAmount / status.currentTransaction.targetAmount;
        setFlowRate(Math.min(progress * 100, 100));
      }
    } else if (status.status === "error" || status.status === "emergency_stop") {
      setAnimationState("pulsing");
    } else {
      setAnimationState("idle");
      setFlowRate(0);
    }
  }, [status.status, status.currentTransaction]);

  const getStatusIcon = () => {
    switch (status.status) {
      case "dispensing":
        return <Droplets className={cn("h-6 w-6 text-blue-500", animationState === "flowing" && "animate-bounce")} />;
      case "maintenance":
        return <Gauge className="h-6 w-6 text-yellow-500" />;
      case "error":
        return <AlertTriangle className={cn("h-6 w-6 text-red-500", animationState === "pulsing" && "animate-pulse")} />;
      case "emergency_stop":
        return <StopCircle className={cn("h-6 w-6 text-red-600", animationState === "pulsing" && "animate-pulse")} />;
      default:
        return <CheckCircle className="h-6 w-6 text-green-500" />;
    }
  };

  const getStatusColor = () => {
    switch (status.status) {
      case "dispensing": return "border-blue-500 bg-blue-50 dark:bg-blue-950";
      case "maintenance": return "border-yellow-500 bg-yellow-50 dark:bg-yellow-950";
      case "error": return "border-red-500 bg-red-50 dark:bg-red-950";
      case "emergency_stop": return "border-red-600 bg-red-100 dark:bg-red-900";
      default: return "border-green-500 bg-green-50 dark:bg-green-950";
    }
  };

  const getStatusText = () => {
    switch (status.status) {
      case "dispensing": return "กำลังจ่ายน้ำมัน";
      case "maintenance": return "อยู่ระหว่างบำรุงรักษา";
      case "error": return "เกิดข้อผิดพลาด";
      case "emergency_stop": return "หยุดฉุกเฉิน";
      default: return "พร้อมใช้งาน";
    }
  };

  if (compact) {
    return (
      <div className={cn("flex items-center gap-3 p-3 rounded-lg border-2 transition-all duration-300", getStatusColor())}>
        <div className="relative">
          {getStatusIcon()}
          {status.status === "dispensing" && (
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full animate-ping" />
          )}
        </div>
        <div>
          <div className="font-medium">ปั๊ม {pumpId}</div>
          <div className="text-sm text-gray-600">{getStatusText()}</div>
        </div>
        <Badge variant="outline" className="ml-auto">
          {status.fuelLevel}%
        </Badge>
      </div>
    );
  }

  return (
    <Card className={cn("transition-all duration-300 border-2", getStatusColor())}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <div className="relative">
              {getStatusIcon()}
              {status.status === "dispensing" && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-ping" />
              )}
            </div>
            ปั๊มน้ำมัน {pumpId}
          </CardTitle>
          <Badge 
            variant={status.status === "idle" ? "default" : 
                   status.status === "dispensing" ? "secondary" : "destructive"}
          >
            {getStatusText()}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Current Transaction Display */}
        {status.currentTransaction && status.status === "dispensing" && (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">การทำรายการปัจจุบัน</span>
              <span className="text-xs text-gray-500">
                ID: {status.currentTransaction.id}
              </span>
            </div>
            
            {/* Animated Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>ยอดเงิน: ฿{status.currentTransaction.dispensedAmount.toFixed(2)}</span>
                <span>เป้าหมาย: ฿{status.currentTransaction.targetAmount}</span>
              </div>
              <div className="relative">
                <Progress 
                  value={(status.currentTransaction.dispensedAmount / status.currentTransaction.targetAmount) * 100} 
                  className="h-3"
                />
                {/* Flowing animation overlay */}
                <div className="absolute inset-0 h-3 bg-gradient-to-r from-transparent via-blue-200 to-transparent opacity-50 animate-pulse rounded-full" />
              </div>
              <div className="flex justify-between text-xs text-gray-600">
                <span>ปริมาณ: {status.currentTransaction.dispensedVolume.toFixed(2)}L</span>
                <span>{status.currentTransaction.fuelType}</span>
              </div>
            </div>

            {/* Flow Rate Animation */}
            <div className="flex items-center gap-2 p-2 bg-blue-100 dark:bg-blue-900 rounded">
              <Activity className="h-4 w-4 text-blue-600 animate-pulse" />
              <span className="text-sm font-medium">อัตราการไหล: {(flowRate * 0.5).toFixed(1)} L/นาที</span>
            </div>
          </div>
        )}

        {/* System Status Indicators */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Fuel className="h-4 w-4 text-gray-600" />
              <span className="text-sm">ระดับน้ำมัน</span>
            </div>
            <div className="flex items-center gap-2">
              <Progress value={status.fuelLevel || 0} className="flex-1 h-2" />
              <span className="text-xs font-medium w-10">{(status.fuelLevel || 0)}%</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Thermometer className="h-4 w-4 text-gray-600" />
              <span className="text-sm">อุณหภูมิ</span>
            </div>
            <div className="text-sm font-medium">{(status.temperature || 0)}°C</div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Gauge className="h-4 w-4 text-gray-600" />
              <span className="text-sm">ความดัน</span>
            </div>
            <div className="text-sm font-medium">{(status.pressure || 0)} bar</div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Power className="h-4 w-4 text-gray-600" />
              <span className="text-sm">เวลาทำงาน</span>
            </div>
            <div className="text-sm font-medium">{(status.uptime || 0)}%</div>
          </div>
        </div>

        {/* Error Messages */}
        {status.errorMessage && (
          <div className="p-3 bg-red-100 dark:bg-red-900 border border-red-300 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-600 animate-pulse" />
              <span className="text-sm font-medium text-red-800 dark:text-red-200">
                {status.errorMessage}
              </span>
            </div>
          </div>
        )}

        {/* Control Buttons */}
        {showControls && (
          <div className="flex gap-2 pt-2 border-t">
            {status.status === "idle" && (
              <Button size="sm" variant="outline" className="flex-1">
                <Zap className="h-4 w-4 mr-1" />
                เริ่มทดสอบ
              </Button>
            )}
            {status.status === "dispensing" && (
              <Button size="sm" variant="destructive" className="flex-1">
                <StopCircle className="h-4 w-4 mr-1" />
                หยุดฉุกเฉิน
              </Button>
            )}
            {(status.status === "error" || status.status === "emergency_stop") && (
              <Button size="sm" variant="outline" className="flex-1">
                <CheckCircle className="h-4 w-4 mr-1" />
                รีเซ็ต
              </Button>
            )}
          </div>
        )}

        {/* Statistics Footer */}
        <div className="text-xs text-gray-500 pt-2 border-t">
          จ่ายน้ำมันสะสม: {(status.totalDispensed || 0).toLocaleString()}L | 
          บำรุงรักษาล่าสุด: {status.lastMaintenance || 'ไม่ระบุ'}
        </div>
      </CardContent>
    </Card>
  );
}