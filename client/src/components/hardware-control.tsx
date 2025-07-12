import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Fuel, 
  Power, 
  Square, 
  RotateCcw, 
  AlertTriangle, 
  CheckCircle,
  Loader2,
  Activity
} from "lucide-react";
import { LANGUAGES, TRANSLATIONS } from "@/lib/constants";

interface PumpStatus {
  id: string;
  isReady: boolean;
  isDispensing: boolean;
  currentVolume: number;
  targetAmount: number;
  flowRate: number;
  lastUpdate: Date;
  error?: string;
}

interface HardwareControlProps {
  pumpId: string;
  language: string;
}

export function HardwareControl({ pumpId, language }: HardwareControlProps) {
  const [pumpStatus, setPumpStatus] = useState<PumpStatus | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const t = TRANSLATIONS[language as keyof typeof TRANSLATIONS];

  useEffect(() => {
    // Connect to hardware WebSocket
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/hardware-ws`;
    
    const websocket = new WebSocket(wsUrl);
    
    websocket.onopen = () => {
      console.log('[Hardware] Connected to hardware control WebSocket');
      setIsConnected(true);
      setIsLoading(false);
      
      // Request current pump status
      websocket.send(JSON.stringify({
        type: 'GET_STATUS',
        pumpId: pumpId
      }));
    };
    
    websocket.onmessage = (event) => {
      try {
        const response = JSON.parse(event.data);
        
        if (response.type === 'STATUS_UPDATE' && response.pumpId === pumpId) {
          setPumpStatus(response.data);
        } else if (response.type === 'ERROR' && response.pumpId === pumpId) {
          setError(response.data.error);
        } else if (response.type === 'DISPENSING_COMPLETE' && response.pumpId === pumpId) {
          console.log('[Hardware] Dispensing completed:', response.data);
        } else if (response.type === 'EMERGENCY_STOP' && response.pumpId === pumpId) {
          console.log('[Hardware] Emergency stop activated:', response.data);
        }
      } catch (err) {
        console.error('[Hardware] Failed to parse WebSocket message:', err);
      }
    };
    
    websocket.onclose = () => {
      console.log('[Hardware] Disconnected from hardware control WebSocket');
      setIsConnected(false);
    };
    
    websocket.onerror = (error) => {
      console.error('[Hardware] WebSocket error:', error);
      setError('Connection to hardware failed');
      setIsLoading(false);
    };
    
    setWs(websocket);
    
    return () => {
      websocket.close();
    };
  }, [pumpId]);

  const sendCommand = (command: any) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(command));
    }
  };

  const handleStopDispensing = () => {
    sendCommand({
      type: 'STOP_DISPENSING',
      pumpId: pumpId
    });
  };

  const handleResetPump = () => {
    sendCommand({
      type: 'RESET_PUMP',
      pumpId: pumpId
    });
  };

  const handleEmergencyStop = () => {
    sendCommand({
      type: 'EMERGENCY_STOP',
      pumpId: pumpId
    });
  };

  const getStatusColor = (status: PumpStatus) => {
    if (status.error) return "destructive";
    if (status.isDispensing) return "warning";
    if (status.isReady) return "success";
    return "secondary";
  };

  const getStatusText = (status: PumpStatus) => {
    if (status.error) return language === "th" ? "ขัดข้อง" : "Error";
    if (status.isDispensing) return language === "th" ? "กำลังจ่าย" : "Dispensing";
    if (status.isReady) return language === "th" ? "พร้อม" : "Ready";
    return language === "th" ? "ไม่พร้อม" : "Not Ready";
  };

  const getStatusIcon = (status: PumpStatus) => {
    if (status.error) return <AlertTriangle className="w-4 h-4" />;
    if (status.isDispensing) return <Activity className="w-4 h-4" />;
    if (status.isReady) return <CheckCircle className="w-4 h-4" />;
    return <Power className="w-4 h-4" />;
  };

  const getProgress = (status: PumpStatus) => {
    if (status.targetAmount === 0) return 0;
    return (status.currentVolume / status.targetAmount) * 100;
  };

  if (isLoading) {
    return (
      <Card className="bg-white rounded-xl shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center space-x-2">
            <Fuel className="w-5 h-5" />
            <span>หัวจ่าย {pumpId} / Pump {pumpId}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-trust-blue" />
            <span className="ml-3 text-neutral-grey">
              {language === "th" ? "กำลังเชื่อมต่อ..." : "Connecting..."}
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!isConnected || !pumpStatus) {
    return (
      <Card className="bg-white rounded-xl shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center space-x-2">
            <Fuel className="w-5 h-5" />
            <span>หัวจ่าย {pumpId} / Pump {pumpId}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {language === "th" 
                ? "ไม่สามารถเชื่อมต่อกับระบบฮาร์ดแวร์ได้" 
                : "Cannot connect to hardware system"}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white rounded-xl shadow-lg">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Fuel className="w-5 h-5" />
            <span>หัวจ่าย {pumpId} / Pump {pumpId}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant={getStatusColor(pumpStatus)} className="px-3 py-1">
              {getStatusIcon(pumpStatus)}
              <span className="ml-1">{getStatusText(pumpStatus)}</span>
            </Badge>
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-success-green' : 'bg-warning-orange'}`} />
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Status */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-clean-white rounded-lg p-4">
            <div className="text-sm text-neutral-grey mb-1">
              {language === "th" ? "ยอดปัจจุบัน" : "Current Amount"}
            </div>
            <div className="text-2xl font-bold text-trust-blue">
              {pumpStatus.currentVolume.toFixed(2)} ฿
            </div>
          </div>
          <div className="bg-clean-white rounded-lg p-4">
            <div className="text-sm text-neutral-grey mb-1">
              {language === "th" ? "ยอดเป้าหมาย" : "Target Amount"}
            </div>
            <div className="text-2xl font-bold text-strong-black">
              {pumpStatus.targetAmount.toFixed(2)} ฿
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        {pumpStatus.isDispensing && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-neutral-grey">
                {language === "th" ? "ความคืบหน้า" : "Progress"}
              </span>
              <span className="text-strong-black font-medium">
                {getProgress(pumpStatus).toFixed(1)}%
              </span>
            </div>
            <Progress value={getProgress(pumpStatus)} className="h-3" />
          </div>
        )}

        {/* Flow Rate */}
        <div className="bg-clean-white rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-neutral-grey">
                {language === "th" ? "อัตราการไหล" : "Flow Rate"}
              </div>
              <div className="text-lg font-bold text-strong-black">
                {pumpStatus.flowRate.toFixed(1)} L/min
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-neutral-grey">
                {language === "th" ? "อัปเดตล่าสุด" : "Last Update"}
              </div>
              <div className="text-sm text-strong-black">
                {new Date(pumpStatus.lastUpdate).toLocaleTimeString()}
              </div>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {pumpStatus.error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {pumpStatus.error}
            </AlertDescription>
          </Alert>
        )}

        {/* Control Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={handleStopDispensing}
            disabled={!pumpStatus.isDispensing}
            variant="outline"
            className="bg-warning-orange hover:bg-warning-orange/90 text-white border-warning-orange"
          >
            <Square className="w-4 h-4 mr-2" />
            {language === "th" ? "หยุดจ่าย" : "Stop"}
          </Button>
          
          <Button
            onClick={handleResetPump}
            disabled={pumpStatus.isDispensing}
            variant="outline"
            className="bg-trust-blue hover:bg-trust-blue/90 text-white border-trust-blue"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            {language === "th" ? "รีเซ็ต" : "Reset"}
          </Button>
        </div>

        {/* Emergency Stop */}
        <Button
          onClick={handleEmergencyStop}
          className="w-full bg-red-600 hover:bg-red-700 text-white"
          size="lg"
        >
          <AlertTriangle className="w-5 h-5 mr-2" />
          {language === "th" ? "หยุดฉุกเฉิน" : "EMERGENCY STOP"}
        </Button>

        {/* Hardware Info */}
        <div className="text-center pt-2 border-t border-neutral-grey/20">
          <div className="text-xs text-neutral-grey">
            {language === "th" ? "ระบบฮาร์ดแวร์" : "Hardware System"}: {isConnected ? "เชื่อมต่อ" : "ขาดการเชื่อมต่อ"}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}